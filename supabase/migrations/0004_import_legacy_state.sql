-- One-time, atomic import for the existing lisan.state.v2 localStorage object.
-- Call as the signed-in user through Supabase RPC. This is intentionally
-- SECURITY INVOKER so table grants and RLS remain in force.

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
  v_activity jsonb;
  v_day_key text;
  v_lesson_id text;
  v_card_id text;
  v_event jsonb;
  v_review jsonb;
  v_reminders jsonb;
  v_reminder_days smallint[];
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_state is null or pg_catalog.jsonb_typeof(p_state) <> 'object' then
    raise exception 'Invalid legacy state';
  end if;

  if coalesce(p_state ->> 'lang', '') not in ('ar', 'de', 'ja') then
    raise exception 'Invalid active language';
  end if;

  if coalesce(p_state ->> 'theme', 'light') not in ('light', 'dark') then
    raise exception 'Invalid theme';
  end if;

  if p_time_zone is not null and (
    length(p_time_zone) > 64
    or not exists (
      select 1
      from pg_catalog.pg_timezone_names
      where name = p_time_zone
    )
  ) then
    raise exception 'Invalid time zone';
  end if;

  -- Do not overwrite or merge remote data implicitly: legacy local state has no
  -- global updated-at/version, so the newer copy cannot be identified safely.
  if exists (select 1 from public.user_preferences where user_id = v_user_id)
    or exists (select 1 from public.language_progress where user_id = v_user_id)
    or exists (select 1 from public.daily_progress where user_id = v_user_id)
    or exists (select 1 from public.lesson_completions where user_id = v_user_id)
    or exists (select 1 from public.card_reviews where user_id = v_user_id)
    or exists (select 1 from public.study_activity where user_id = v_user_id) then
    raise exception 'Remote learning data already exists; choose an explicit conflict-resolution path';
  end if;

  v_reminders := coalesce(p_state -> 'reminders', '{}'::jsonb);
  if pg_catalog.jsonb_typeof(v_reminders -> 'days') = 'array' then
    select coalesce(
      array_agg(value::smallint),
      array[]::smallint[]
    )
    into v_reminder_days
    from pg_catalog.jsonb_array_elements_text(v_reminders -> 'days') as days(value);
  else
    v_reminder_days := array[1, 2, 3, 4, 5, 6, 0]::smallint[];
  end if;

  insert into public.user_preferences (
    user_id,
    active_language,
    theme,
    time_zone,
    reminder_enabled,
    reminder_time,
    reminder_days,
    hearts,
    hearts_day,
    last_reminder_fired,
    legacy_imported_at
  )
  values (
    v_user_id,
    p_state ->> 'lang',
    coalesce(p_state ->> 'theme', 'light'),
    p_time_zone,
    coalesce((v_reminders ->> 'enabled')::boolean, false),
    coalesce((v_reminders ->> 'time')::time, time '19:00'),
    v_reminder_days,
    coalesce((p_state ->> 'hearts')::smallint, 5),
    nullif(p_state ->> 'heartsDay', '')::date,
    nullif(p_state ->> 'lastReminderFired', '')::timestamptz,
    now()
  );

  for v_language in select unnest(array['ar', 'de', 'ja']::text[])
  loop
    v_progress := coalesce(p_state #> array['progress', v_language], '{}'::jsonb);

    -- sampleProgress() is generated demonstration data. Do not turn it into
    -- real learner history or unlocks in the account database.
    if coalesce((v_progress ->> 'sample')::boolean, false) then
      continue;
    end if;

    insert into public.language_progress (
      user_id,
      language,
      xp_total,
      cards_total,
      minutes_total,
      streak,
      last_day
    )
    values (
      v_user_id,
      v_language,
      coalesce((v_progress ->> 'xpTotal')::integer, 0),
      coalesce((v_progress ->> 'cardsTotal')::integer, 0),
      coalesce((v_progress ->> 'minutesTotal')::integer, 0),
      coalesce((v_progress ->> 'streak')::integer, 0),
      nullif(v_progress ->> 'lastDay', '')::date
    );

    for v_lesson_id in
      select lesson_id
      from pg_catalog.jsonb_array_elements_text(
        coalesce(v_progress -> 'lessons', '[]'::jsonb)
      ) as lessons(lesson_id)
    loop
      insert into public.lesson_completions (user_id, language, lesson_id)
      values (v_user_id, v_language, v_lesson_id);
    end loop;

    for v_day_key in
      select day_key
      from (
        select key as day_key from pg_catalog.jsonb_object_keys(
          coalesce(v_progress -> 'dayXp', '{}'::jsonb)
        ) as xp(key)
        union
        select key as day_key from pg_catalog.jsonb_object_keys(
          coalesce(v_progress -> 'dayMinutes', '{}'::jsonb)
        ) as mins(key)
        union
        select key as day_key from pg_catalog.jsonb_object_keys(
          coalesce(v_progress -> 'dayCards', '{}'::jsonb)
        ) as cards(key)
      ) as days
    loop
      insert into public.daily_progress (
        user_id,
        language,
        study_day,
        xp,
        cards,
        minutes
      )
      values (
        v_user_id,
        v_language,
        v_day_key::date,
        coalesce((v_progress -> 'dayXp' ->> v_day_key)::integer, 0),
        coalesce((v_progress -> 'dayCards' ->> v_day_key)::integer, 0),
        coalesce((v_progress -> 'dayMinutes' ->> v_day_key)::integer, 0)
      );
    end loop;

    for v_event in
      select value
      from pg_catalog.jsonb_array_elements(
        coalesce(v_progress -> 'activity', '[]'::jsonb)
      ) as events(value)
    loop
      insert into public.study_activity (
        user_id,
        language,
        source_id,
        event_type,
        title,
        detail,
        created_at
      )
      values (
        v_user_id,
        v_language,
        nullif(v_event ->> 'id', ''),
        v_event ->> 'type',
        v_event ->> 'title',
        v_event ->> 'detail',
        (v_event ->> 'at')::timestamptz
      );
    end loop;
  end loop;

  for v_language in select unnest(array['ar', 'de', 'ja']::text[])
  loop
    v_srs := coalesce(p_state #> array['srs', v_language], '{}'::jsonb);
    for v_card_id, v_review in
      select key, value
      from pg_catalog.jsonb_each(v_srs)
    loop
      insert into public.card_reviews (
        user_id,
        language,
        card_id,
        due_at,
        interval_days,
        last_rating
      )
      values (
        v_user_id,
        v_language,
        v_card_id,
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
