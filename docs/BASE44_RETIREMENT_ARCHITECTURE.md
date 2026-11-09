# Linguistix Base44 Retirement — Architecture Decision

**Status:** Accepted; Supabase v1 schema and helper-function hardening applied and verified. Cloudflare preview and production cutover not approved.
**Date:** 2026-11-09

## Decision

Retire Base44 as the application runtime and use:

- **Application:** the existing Next.js App Router workspace in `next-app/`.
- **Hosting/runtime:** Cloudflare Workers. Use Cloudflare's currently recommended `vinext` path for Next.js 16 after compatibility checks; retain the normal Next.js development workflow while validating the adapter.
- **Authentication and database:** the existing Supabase project, using `@supabase/ssr` cookie-based sessions and Postgres Row Level Security.
- **AI tutor:** Google Gemini only, called from a server-only route. The Gemini key must be stored as a Cloudflare server-side secret and never exposed through a `NEXT_PUBLIC_*` variable or committed to Git.
- **Source control and CI:** GitHub and GitHub Actions.

Do not create a second app or rewrite the existing Next.js workspace without a demonstrated compatibility or product need.

## Verified repository and Supabase state

- The Next.js workspace and Supabase SSR clients exist on the migration branches.
- The Next.js app has an authenticated learner-state API and account-aware background sync. The `public.learner_state` table and owner-scoped RLS policies are now applied and catalog-verified.
- Kalam AI has been changed to Gemini-only, with bounded input, a timeout, output validation and sanitized failures.
- Supabase migrations `learner_state` and `security_hardening_rls_auto_enable` were applied to the connected project after the owner's explicit approval.
- The `learner_state` table is RLS-enabled with SELECT/INSERT/UPDATE/DELETE policies restricted to `auth.uid() = user_id`; the table has no user rows yet.
- The legacy `public.rls_auto_enable()` function remains installed for its DDL event-trigger purpose, but EXECUTE has been revoked from `PUBLIC`, `anon`, and `authenticated`; the catalog confirms only `postgres` and `service_role` retain EXECUTE.
- The connected Supabase project is active in `eu-west-1`.
- Supabase security advisor now reports only leaked-password protection disabled. Supabase docs state this control is available on Pro and above; do not upgrade the project without a separate cost decision.

## Required implementation sequence

1. **Consolidate the app:** use this branch as the single integration line for the Next.js workspace; preserve existing lessons, flashcards and app features.
2. **Cloudflare compatibility:** completed in CI: vinext scan reports 95% compatibility with one non-blocking React Strict Mode note; Next.js production build and Cloudflare Worker build both pass. Generated Vite/Cloudflare config and npm lockfile are committed. Live Cloudflare preview and runtime bindings still need testing. Do not deploy production.
3. **Gemini-only tutor:** completed in this branch. Live Gemini credentials and calls still need verification in the final runtime.
4. **Supabase security:** applied the v1 learner-state table/RLS and revoked public execution of the legacy `rls_auto_enable()` function. Catalog verification passed. The only remaining advisor is leaked-password protection, which is a Pro+ feature; do not upgrade without a cost decision.
5. **Cloud persistence:** authenticated GET/PUT API and account-aware background sync are implemented. The v1 table and four owner-scoped RLS policies are applied. Next: two-account isolation tests and end-to-end sync verification. Earlier normalized schema/import drafts are archived outside the active migrations folder.
6. **Environment and auth setup:** configure Supabase URL/publishable key and auth redirect URLs; configure Gemini and Supabase server settings in Cloudflare secrets/environment. No secret values belong in GitHub.
7. **Release verification:** CI, end-to-end auth tests, live tutor test, data-isolation/RLS tests, mobile/desktop browser QA, backup/rollback plan, and owner approval.
8. **Cutover:** only after explicit approval, deploy to Cloudflare, verify production smoke tests, and then retire remaining Base44 configuration. Do not merge or deploy automatically.

## Explicit safety boundaries

- No production deployment, PR merge, database migration, destructive SQL, paid resource creation, or secret exposure without the owner's explicit approval.
- Keep the current Base44 application and its data untouched until the replacement has passed release verification and the owner approves cutover.
