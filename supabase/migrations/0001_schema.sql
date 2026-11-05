-- Proposed initial Supabase schema for Linguistics.
-- Apply only to a reviewed Supabase project; this file has not been executed.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  active_language text not null default 'ar' check (active_language in ('ar', 'de', 'ja', 'en', 'es', 'fr', 'pt')),
  theme text not null default 'ocean' check (theme in ('ocean', 'forest', 'sunset', 'lavender', 'midnight')),
  time_zone text,
  reminder_enabled boolean not null default false,
  reminder_time time not null default '19:00',
  reminder_days smallint[] not null default array[1, 2, 3, 4, 5, 6, 0]::smallint[]
    check (
      cardinality(reminder_days) <= 7
      and reminder_days <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]
    ),
  hearts smallint not null default 5 check (hearts between 0 and 5),
  hearts_day date,
  last_reminder_fired timestamptz,
  legacy_imported_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.language_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  language text not null check (language in ('ar', 'de', 'ja', 'en', 'es', 'fr', 'pt')),
  xp_total integer not null default 0 check (xp_total >= 0),
  cards_total integer not null default 0 check (cards_total >= 0),
  minutes_total integer not null default 0 check (minutes_total >= 0),
  streak integer not null default 0 check (streak >= 0),
  last_day date,
  updated_at timestamptz not null default now(),
  primary key (user_id, language)
);

create table public.daily_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  language text not null check (language in ('ar', 'de', 'ja', 'en', 'es', 'fr', 'pt')),
  study_day date not null,
  xp integer not null default 0 check (xp >= 0),
  cards integer not null default 0 check (cards >= 0),
  minutes integer not null default 0 check (minutes >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, language, study_day)
);

create table public.lesson_completions (
  user_id uuid not null references auth.users (id) on delete cascade,
  language text not null check (language in ('ar', 'de', 'ja', 'en', 'es', 'fr', 'pt')),
  lesson_id text not null check (length(lesson_id) between 1 and 120),
  -- Legacy local state stored lesson IDs without completion timestamps.
  completed_at timestamptz,
  primary key (user_id, language, lesson_id)
);

create table public.card_reviews (
  user_id uuid not null references auth.users (id) on delete cascade,
  language text not null check (language in ('ar', 'de', 'ja', 'en', 'es', 'fr', 'pt')),
  card_id text not null check (length(card_id) between 1 and 120),
  due_at timestamptz not null,
  interval_days smallint not null check (interval_days in (1, 2, 4, 7)),
  last_rating text not null check (last_rating in ('again', 'hard', 'good', 'easy')),
  updated_at timestamptz not null default now(),
  primary key (user_id, language, card_id)
);

create table public.study_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  language text not null check (language in ('ar', 'de', 'ja', 'en', 'es', 'fr', 'pt')),
  source_id text,
  event_type text not null check (event_type in ('lesson', 'cards', 'badge')),
  title text not null check (length(title) between 1 and 240),
  detail text,
  created_at timestamptz not null,
  constraint study_activity_source_id_length
    check (source_id is null or length(source_id) between 1 and 160)
);

create unique index study_activity_user_source_id
  on public.study_activity (user_id, source_id)
  where source_id is not null;

create index study_activity_user_recent
  on public.study_activity (user_id, created_at desc);

create index daily_progress_user_recent
  on public.daily_progress (user_id, study_day desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger user_preferences_set_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

create trigger language_progress_set_updated_at
  before update on public.language_progress
  for each row execute function public.set_updated_at();

create trigger daily_progress_set_updated_at
  before update on public.daily_progress
  for each row execute function public.set_updated_at();

create trigger card_reviews_set_updated_at
  before update on public.card_reviews
  for each row execute function public.set_updated_at();
