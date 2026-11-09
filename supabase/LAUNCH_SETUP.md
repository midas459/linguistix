# Supabase launch setup

## Current state

The connected Supabase project has no Linguistix application tables or recorded migrations. The current project also has a legacy `public.rls_auto_enable()` SECURITY DEFINER event-trigger function that the Supabase advisor reports as executable by anon/authenticated. The remediation draft revokes those direct grants without dropping the event trigger.

## Migration order

Review and apply only after explicit approval:

1. `0001_schema.sql`
2. `0002_rls.sql`
3. `0003_auth_profiles.sql`
4. `0004_import_legacy_state.sql` (legacy normalized import RPC; review carefully)
5. `0005_learner_state.sql` (canonical v1 app snapshot used by `/api/learner-state`)
6. `0006_security_hardening.sql`

The app uses the JSONB `learner_state` snapshot for v1 sync. The normalized tables are retained as a future analytics/structured-data path and are not yet used by the app's sync endpoint.

## Manual Supabase Auth setting

Enable leaked-password protection in the Supabase Auth security settings. This is an Auth configuration setting, not part of the SQL migrations.

## Validation after approved migration

- Confirm all user-data tables have RLS enabled.
- Confirm anon has no table grants.
- Confirm authenticated users can read/write only rows where `user_id = auth.uid()`.
- Test two accounts against each other and confirm neither can read or mutate the other's state.
- Verify the `learner_state` endpoint rejects unauthenticated requests and invalid/oversized payloads.
- Confirm the legacy import is opt-in and does not overwrite existing remote data.
