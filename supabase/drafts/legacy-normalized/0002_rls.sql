-- Proposed grants and row-level security. No anonymous access is granted.

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.language_progress enable row level security;
alter table public.daily_progress enable row level security;
alter table public.lesson_completions enable row level security;
alter table public.card_reviews enable row level security;
alter table public.study_activity enable row level security;

revoke all on table
  public.profiles,
  public.user_preferences,
  public.language_progress,
  public.daily_progress,
  public.lesson_completions,
  public.card_reviews,
  public.study_activity
from anon, authenticated;

-- A user may view their own role, but the client has no role write privilege.
grant select on table public.profiles to authenticated;
revoke update (role) on table public.profiles from anon, authenticated;
grant update (display_name) on table public.profiles to authenticated;

grant select, insert, update, delete on table
  public.user_preferences,
  public.language_progress,
  public.daily_progress,
  public.lesson_completions,
  public.card_reviews,
  public.study_activity
to authenticated;

create policy profiles_select_own
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy profiles_update_own
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy user_preferences_own
  on public.user_preferences for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy language_progress_own
  on public.language_progress for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy daily_progress_own
  on public.daily_progress for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy lesson_completions_own
  on public.lesson_completions for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy card_reviews_own
  on public.card_reviews for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy study_activity_own
  on public.study_activity for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
