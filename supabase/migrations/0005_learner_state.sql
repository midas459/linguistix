-- Canonical v1 cloud snapshot for the existing client-side learning store.
-- This migration is a draft and has NOT been applied to the connected project.

create table public.learner_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  updated_at timestamptz not null default now(),
  constraint learner_state_max_size check (octet_length(state::text) <= 65536)
);

alter table public.learner_state enable row level security;

revoke all on table public.learner_state from anon, authenticated;
grant select, insert, update, delete on table public.learner_state to authenticated;

create policy learner_state_select_own
  on public.learner_state for select to authenticated
  using ((select auth.uid()) = user_id);

create policy learner_state_insert_own
  on public.learner_state for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy learner_state_update_own
  on public.learner_state for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy learner_state_delete_own
  on public.learner_state for delete to authenticated
  using ((select auth.uid()) = user_id);
