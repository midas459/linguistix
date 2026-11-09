# Supabase launch setup

## Verified project state

The connected Supabase project is active in `eu-west-1`. Read-only inspection found no Linguistix application tables and no recorded migrations in the database. The project does have a legacy `public.rls_auto_enable()` SECURITY DEFINER helper reported as directly executable by `anon` and `authenticated`. The security advisor also reports leaked-password protection disabled.

## Active v1 migration set

The Next.js application v1 needs only the following two active migrations:

1. `20261109080500_learner_state.sql` — creates the single per-user JSONB learning snapshot table, enables RLS, and grants only authenticated owner-scoped access.
2. `20261109080600_security_hardening.sql` — conditionally revokes direct execution of the legacy helper for `PUBLIC`, `anon` and `authenticated`. It is safe on a fresh project where the helper is absent.

These migrations are drafts and have **not** been applied. Apply them only after explicit owner approval.

## Archived design drafts

The earlier normalized schema, RLS, profile trigger and localStorage import RPC are preserved under `supabase/drafts/legacy-normalized/`. They are not part of the active migration chain and must not be applied for v1. The current app uses `public.learner_state`; adding normalized analytics tables can be considered after launch validation.

## Manual Supabase Auth setting

Enable leaked-password protection in Supabase Auth security settings. This is an Auth configuration setting, not part of SQL migrations.

## Validation after approved migrations

- Confirm `public.learner_state` exists and RLS is enabled.
- Confirm `anon` has no table privileges.
- Confirm authenticated users can read/write only rows where `user_id = auth.uid()`.
- Test two accounts against each other and confirm neither can read or mutate the other's state.
- Verify `/api/learner-state` rejects unauthenticated requests and invalid/oversized payloads.
- Confirm the Supabase security advisor no longer reports the legacy public function grant.
- Confirm leaked-password protection is enabled.
