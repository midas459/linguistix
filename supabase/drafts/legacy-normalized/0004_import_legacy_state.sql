-- One-time, atomic import for the existing lisan.state.v2 localStorage object.
-- Call as the signed-in user through Supabase RPC. SECURITY INVOKER keeps
-- table grants and RLS in force. Any validation/insert failure rolls back all rows.

create or replace function public.import_legacy_state(
  p_state jsonb,
  p_time_zone text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_language text;
  v_progress jsonb;
  v_srs jsonb;
  v_day_key text;
  v_lesson_id text;
  v_card_id text;
  v_event jsonb;
  v_review jsonb;
  v_reminders jsonb;
  v_reminder_days smallint[];
  v_value jsonb;
  v_numeric numeric;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_state is null or pg_catalog.jsonb_typeof(p_state) <> 'object' then
    raise exception 'Invalid legacy state: expected an object';
  end if;

  if pg_catalog.jsonb_typeof(p_state -> 'lang') <> 'string'
     or p_state ->> 'lang' not in ('ar', 'de', 'ja', 'en', 'es', 'fr', 'pt') then
    raise exception 'Invalid active language';
  end if;
  if p_state ? 'theme' and (
    pg_catalog.jsonb_typeof(p_state -> 'theme') <> 'string'
    or p_state ->> 'theme' not in ('ocean', 'forest', 'sunset', 'lavender', 'midnight')
  ) then
    raise exception 'Invalid theme';
  end if;

  if p_time_zone is not null and (
    pg_catalog.length(p_time_zone) > 64
    or not exists (
      select 1 from pg_catalog.pg_timezone_names where name = p_time_zone
    )
  ) then
    raise exception 'Invalid time zone';
  end if;

  -- Serialize imports per user, preventing two simultaneous first imports.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 0)
  );

  -- Never overwrite or merge remote data implicitly.
  if exists (select 1 from public.user_preferences where user_id = v_user_id)
    or exists (select 1 from public.language_progress where user_id = v_user_id)
    or exists (select 1 from public.daily_progress where user_id = v_user_id)
    or exists (select 1 from public.lesson_completions where user_id = v_user_id)
    or exists (select 1 from public.card_reviews where user_id = v_user_id)
    or exists (select 1 from public.study_activity where user_id = v_user_id) then
    raise exception 'Remote learning data already exists; choose an explicit conflict-resolution path';
  end if;

  v_reminders := coalesce(p_state -> 'reminders', '{}'::jsonb);
  if pg_catalog.jsonb_typeof(v_reminders) <> 'object' then
    raise exception 'Invalid reminders: expected an object';
  end if;
  if v_reminders ? 'enabled' and pg_catalog.jsonb_typeof(v_reminders -> 'enabled') <> 'boolean' then
    raise exception 'Invalid reminder enabled flag';
  end if;
  if v_reminders ? 'time' and (
    pg_catalog.jsonb_typeof(v_reminders -> 'time') <> 'string'
    or (v_reminders ->> 'time') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
  ) then
    raise exception 'Invalid reminder time; expected HH:mm';
  end if;
  if pg_catalog.jsonb_typeof(v_reminders -> 'days') = 'array' then
    if pg_catalog.jsonb_array_length(v_reminders -> 'days') > 7 then
      raise exception 'Invalid reminder days: at most seven values are allowed';
    end if;
    if exists (
      select 1
      from pg_catalog.jsonb_array_elements(v_reminders -> 'days') d(value)
      where pg_catalog.jsonb_typeof(d.value) <> 'number'
         or (d.value #>> '{}') !~ '^[0-6]$'
    ) then
      raise exception 'Invalid reminder days: use integers from 0 to 6';
    end if;
    select coalesce(array_agg(distinct (value #>> '{}')::smallint), array[]::smallint[])
      into v_reminder_days
      from pg_catalog.jsonb_array_elements(v_reminders -> 'days') d(value);
  elsif v_reminders ? 'days' then
    raise exception 'Invalid reminder days: expected an array';
  else
    v_reminder_days := array[1, 2, 3, 4, 5, 6, 0]::smallint[];
  end if;

  if p_state ? 'hearts' then
    if pg_catalog.jsonb_typeof(p_state -> 'hearts') <> 'number'
       or (p_state ->> 'hearts') !~ '^[0-5]$' then
      raise exception 'Invalid hearts value: expected an integer from 0 to 5';
    end if;
  end if;
  if p_state ? 'heartsDay' and nullif(p_state ->> 'heartsDay', '') is not null
     and (p_state ->> 'heartsDay') !~ '^\d{4}-\d{2}-\d{2}$' then
    raise exception 'Invalid heartsDay date';
  end if;
  if p_state ? 'lastReminderFired'
     and nullif(p_state ->> 'lastReminderFired', '') is not null
     and pg_catalog.jsonb_typeof(p_state -> 'lastReminderFired') <> 'string' then
    raise exception 'Invalid lastReminderFired timestamp';
  end if;

  insert into public.user_preferences (
    user_id, active_language, theme, time_zone, reminder_enabled,
    reminder_time, reminder_days, hearts, hearts_day, last_reminder_fired,
    legacy_imported_at
  )
  values (
    v_user_id,
    p_state ->> 'lang',
    coalesce(p_state ->> 'theme', 'ocean'),
    p_time_zone,
    coalesce((v_reminders ->> 'enabled')::boolean, false),
    coalesce((v_reminders ->> 'time')::time, time '19:00'),
    v_reminder_days,
    coalesce((p_state ->> 'hearts')::smallint, 5),
    nullif(p_state ->> 'heartsDay', '')::date,
    nullif(p_state ->> 'lastReminderFired', '')::timestamptz,
    now()
  );

  for v_language in select unnest(array['ar', 'de', 'ja', 'en', 'es', 'fr', 'pt']::text[])
  loop
    v_progress := p_state #> array['progress', v_language];

    -- Missing language data is not a real zero-progress record.
    if v_progress is null then
      continue;
    end if;
    if pg_catalog.jsonb_typeof(v_progress) <> 'object' then
      raise exception 'Invalid progress object for language %', v_language;
    end if;
    if v_progress ? 'sample' and pg_catalog.jsonb_typeof(v_progress -> 'sample') <> 'boolean' then
      raise exception 'Invalid sample flag for language %', v_language;
    end if;

    -- Sample/demo languages are excluded in full, including SRS below.
    if coalesce((v_progress ->> 'sample')::boolean, false) then
      continue;
    end if;

    foreach v_value in array array[
      v_progress -> 'xpTotal',
      v_progress -> 'cardsTotal',
      v_progress -> 'minutesTotal',
      v_progress -> 'streak'
    ]
    loop
      if v_value is not null and (
        pg_catalog.jsonb_typeof(v_value) <> 'number'
        or (v_value #>> '{}') !~ '^\d+$'
      ) then
        raise exception 'Invalid non-negative progress metric for language %', v_language;
      end if;
    end loop;

    if v_progress ? 'lastDay' and nullif(v_progress ->> 'lastDay', '') is not null
       and (v_progress ->> 'lastDay') !~ '^\d{4}-\d{2}-\d{2}$' then
      raise exception 'Invalid lastDay for language %', v_language;
    end if;

    insert into public.language_progress (
      user_id, language, xp_total, cards_total, minutes_total, streak, last_day
    )
    values (
      v_user_id, v_language,
      coalesce((v_progress ->> 'xpTotal')::integer, 0),
      coalesce((v_progress ->> 'cardsTotal')::integer, 0),
      coalesce((v_progress ->> 'minutesTotal')::integer, 0),
      coalesce((v_progress ->> 'streak')::integer, 0),
      nullif(v_progress ->> 'lastDay', '')::date
    );

    if v_progress ? 'lessons' then
      if pg_catalog.jsonb_typeof(v_progress -> 'lessons') <> 'array'
         or exists (
           select 1 from pg_catalog.jsonb_array_elements(v_progress -> 'lessons') x(value)
           where pg_catalog.jsonb_typeof(x.value) <> 'string'
              or pg_catalog.length(x.value #>> '{}') not between 1 and 120
         ) then
        raise exception 'Invalid lesson list for language %', v_language;
      end if;
    end if;
    for v_lesson_id in
      select value from pg_catalog.jsonb_array_elements_text(
        coalesce(v_progress -> 'lessons', '[]'::jsonb)
      ) as lessons(value)
    loop
      insert into public.lesson_completions (user_id, language, lesson_id)
      values (v_user_id, v_language, v_lesson_id);
    end loop;

    foreach v_value in array array[
      coalesce(v_progress -> 'dayXp', '{}'::jsonb),
      coalesce(v_progress -> 'dayMinutes', '{}'::jsonb),
      coalesce(v_progress -> 'dayCards', '{}'::jsonb)
    ]
    loop
      if pg_catalog.jsonb_typeof(v_value) <> 'object' then
        raise exception 'Invalid daily metrics object for language %', v_language;
      end if;
      if exists (
        select 1 from pg_catalog.jsonb_each(v_value) e(key, value)
        where e.key !~ '^\d{4}-\d{2}-\d{2}$'
           or pg_catalog.jsonb_typeof(e.value) <> 'number'
           or (e.value #>> '{}') !~ '^\d+$'
      ) then
        raise exception 'Invalid daily metric values or date keys for language %', v_language;
      end if;
    end loop;

    for v_day_key in
      select day_key from (
        select key as day_key from pg_catalog.jsonb_object_keys(coalesce(v_progress -> 'dayXp', '{}'::jsonb)) as xp(key)
        union
        select key as day_key from pg_catalog.jsonb_object_keys(coalesce(v_progress -> 'dayMinutes', '{}'::jsonb)) as mins(key)
        union
        select key as day_key from pg_catalog.jsonb_object_keys(coalesce(v_progress -> 'dayCards', '{}'::jsonb)) as cards(key)
      ) days
    loop
      insert into public.daily_progress (user_id, language, study_day, xp, cards, minutes)
      values (
        v_user_id, v_language, v_day_key::date,
        coalesce((v_progress -> 'dayXp' ->> v_day_key)::integer, 0),
        coalesce((v_progress -> 'dayCards' ->> v_day_key)::integer, 0),
        coalesce((v_progress -> 'dayMinutes' ->> v_day_key)::integer, 0)
      );
    end loop;

    if v_progress ? 'activity' then
      if pg_catalog.jsonb_typeof(v_progress -> 'activity') <> 'array' then
        raise exception 'Invalid activity list for language %', v_language;
      end if;
      for v_event in
        select value from pg_catalog.jsonb_array_elements(v_progress -> 'activity')
      loop
        if pg_catalog.jsonb_typeof(v_event) <> 'object'
           or coalesce(v_event ->> 'type', '') not in ('lesson', 'cards', 'badge')
           or nullif(v_event ->> 'title', '') is null
           or pg_catalog.length(v_event ->> 'title') > 240
           or pg_catalog.jsonb_typeof(v_event -> 'at') <> 'string'
           or nullif(v_event ->> 'at', '') is null
           or (v_event ? 'id' and pg_catalog.length(v_event ->> 'id') > 160)
           or (v_event ? 'detail' and pg_catalog.jsonb_typeof(v_event -> 'detail') not in ('string', 'null')) then
          raise exception 'Invalid activity record for language %', v_language;
        end if;
        insert into public.study_activity (
          user_id, language, source_id, event_type, title, detail, created_at
        )
        values (
          v_user_id, v_language, nullif(v_event ->> 'id', ''),
          v_event ->> 'type', v_event ->> 'title', v_event ->> 'detail',
          (v_event ->> 'at')::timestamptz
        );
      end loop;
    end if;

    -- Import SRS only for a language with real (non-sample) progress.
    v_srs := coalesce(p_state #> array['srs', v_language], '{}'::jsonb);
    if pg_catalog.jsonb_typeof(v_srs) <> 'object' then
      raise exception 'Invalid SRS object for language %', v_language;
    end if;
    for v_card_id, v_review in select key, value from pg_catalog.jsonb_each(v_srs)
    loop
      if pg_catalog.length(v_card_id) not between 1 and 120
         or pg_catalog.jsonb_typeof(v_review) <> 'object'
         or pg_catalog.jsonb_typeof(v_review -> 'due') <> 'string'
         or nullif(v_review ->> 'due', '') is null
         or pg_catalog.jsonb_typeof(v_review -> 'interval') <> 'number'
         or (v_review ->> 'interval') not in ('1', '2', '4', '7')
         or pg_catalog.jsonb_typeof(v_review -> 'last') <> 'string'
         or v_review ->> 'last' not in ('again', 'hard', 'good', 'easy') then
        raise exception 'Invalid SRS review record for language % and card %', v_language, v_card_id;
      end if;
      insert into public.card_reviews (
        user_id, language, card_id, due_at, interval_days, last_rating
      )
      values (
        v_user_id, v_language, v_card_id,
        (v_review ->> 'due')::timestamptz,
        (v_review ->> 'interval')::smallint,
        v_review ->> 'last'
      );
    end loop;
  end loop;
end;
$$;

revoke all on function public.import_legacy_state(jsonb, text) from public, anon;
grant execute on function public.import_legacy_state(jsonb, text) to authenticated;
