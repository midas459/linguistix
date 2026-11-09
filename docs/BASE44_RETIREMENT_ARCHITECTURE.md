# Linguistix Base44 Retirement — Architecture Decision

**Status:** Accepted; integration work underway. Production cutover not approved.
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
- The Next.js app now has an authenticated learner-state API and account-aware background sync. Sync remains inactive until the `learner_state` migration is approved and applied.
- Kalam AI has been changed to Gemini-only, with bounded input, a timeout, output validation and sanitized failures.
- Supabase schema and RLS migration drafts remain unapplied; no production data has been modified.
- The connected Supabase project is active in `eu-west-1`.
- Read-only inspection found no base tables in the `public` schema and no recorded Supabase migrations.
- Supabase security advisors reported a public `SECURITY DEFINER` function named `rls_auto_enable()` executable by both `anon` and `authenticated`, and leaked-password protection is disabled. These need investigation/remediation before production auth is enabled. No database changes were made during this audit.

## Required implementation sequence

1. **Consolidate the app:** use this branch as the single integration line for the Next.js workspace; preserve existing lessons, flashcards and app features.
2. **Cloudflare compatibility:** completed in CI: vinext scan reports 95% compatibility with one non-blocking React Strict Mode note; Next.js production build and Cloudflare Worker build both pass. Generated Vite/Cloudflare config and npm lockfile are committed. Live Cloudflare preview and runtime bindings still need testing. Do not deploy production.
3. **Gemini-only tutor:** completed in this branch. Live Gemini credentials and calls still need verification in the final runtime.
4. **Supabase security:** investigate `rls_auto_enable()`; enable leaked-password protection; review grants and RLS policies. Draft migration `0006_security_hardening.sql` revokes direct execute grants from `anon` and `authenticated`. Do not apply SQL until separately approved.
5. **Cloud persistence:** authenticated GET/PUT API and account-aware background sync are implemented. Draft migration `0005_learner_state.sql` creates the owner-only RLS table. Apply and verify only after approval; sync will not function before then.
6. **Environment and auth setup:** configure Supabase URL/publishable key and auth redirect URLs; configure Gemini and Supabase server settings in Cloudflare secrets/environment. No secret values belong in GitHub.
7. **Release verification:** CI, end-to-end auth tests, live tutor test, data-isolation/RLS tests, mobile/desktop browser QA, backup/rollback plan, and owner approval.
8. **Cutover:** only after explicit approval, deploy to Cloudflare, verify production smoke tests, and then retire remaining Base44 configuration. Do not merge or deploy automatically.

## Explicit safety boundaries

- No production deployment, PR merge, database migration, destructive SQL, paid resource creation, or secret exposure without the owner's explicit approval.
- Keep the current Base44 application and its data untouched until the replacement has passed release verification and the owner approves cutover.
