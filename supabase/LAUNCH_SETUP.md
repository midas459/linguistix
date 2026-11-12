# Supabase launch verification

## Current connected project

- Project ref: `sbvedvvdskrwvvnkggte`
- Region: `eu-west-1`
- Project status: `ACTIVE_HEALTHY`
- Database: PostgreSQL 17

## Verified database state (2026-11-12)

Read-only catalog checks confirm:

- `public.learner_state` exists.
- Row-level security is enabled.
- Four policies restrict SELECT, INSERT, UPDATE and DELETE to the authenticated owner where `user_id = auth.uid()`.
- Table grants expose CRUD to `authenticated`; no table grants were found for `anon`.
- The legacy `public.rls_auto_enable()` helper ACL is restricted to `postgres` and `service_role`; it is not executable by `PUBLIC`, `anon` or `authenticated`.
- Migration history contains `20261109080109 learner_state` and `20261109080524 security_hardening_rls_auto_enable`.

The active migration source files are retained in `supabase/migrations/`. Do not re-run them against the live project without first checking migration history and current schema.

## Remaining Supabase release checks

1. Run end-to-end tests with two dedicated test accounts to prove cross-account isolation. Do not use real learner accounts for this test.
2. Verify signup confirmation, sign-in, password reset and sign-out using the production domain.
3. Verify Supabase Auth Site URL and allowed redirect URLs include the production callback.
4. Review the Auth security advisor warning for leaked-password protection. It is currently disabled. Supabase documents this feature as a Pro-and-above capability; do not upgrade the project or incur charges without the owner's explicit decision.
5. Confirm backups and recovery procedures for the learner-state table.

## Application security contract

- Browser code uses only the Supabase publishable key.
- Gemini credentials stay in the Cloudflare Worker secret store and are never sent to browsers.
- Server API routes verify the current user with `auth.getUser()`.
- Learner state is stored per authenticated user and validated for shape and size before writes.
- Cross-account local-state import is blocked by the account-aware sync layer.

## Launch decision

Deployment, build and lint success are not substitutes for browser-level acceptance tests. Keep the replacement isolated from the legacy Base44 app until the two-account RLS test and production auth/AI/pronunciation tests pass. Do not merge the draft release PR or retire the old runtime until the owner explicitly approves cutover.
