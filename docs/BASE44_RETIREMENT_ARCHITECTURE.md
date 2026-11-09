# Linguistix Base44 Retirement — Architecture Decision

**Status:** Accepted for implementation; production cutover not approved.
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
- The learning UI has been substantially restored, but progress, flashcard schedules, and preferences still use browser-local storage.
- The tutor route in the current migration branch has Gemini plus optional Groq/OpenAI-compatible fallbacks. This conflicts with the Gemini-only product decision and must be simplified before release.
- The connected Supabase project is active in `eu-west-1`.
- Read-only inspection found no base tables in the `public` schema and no recorded Supabase migrations.
- Supabase security advisors reported a public `SECURITY DEFINER` function named `rls_auto_enable()` executable by both `anon` and `authenticated`, and leaked-password protection is disabled. These need investigation/remediation before production auth is enabled. No database changes were made during this audit.

## Required implementation sequence

1. **Consolidate the app:** make this branch the single integration line for the Next.js workspace; retain the existing learning features and remove all Base44 runtime dependencies from the launch application.
2. **Cloudflare compatibility:** run the Cloudflare-recommended `vinext check`, add its non-destructive setup, pin dependencies and lockfile, and verify local build/preview. Do not deploy production.
3. **Gemini-only tutor:** remove Groq/OpenAI fallback code and environment variables. Read `GEMINI_API_KEY` only on the server. Validate authentication, request bounds, timeout handling, output schema and sanitized errors.
4. **Supabase security:** investigate `rls_auto_enable()`; enable leaked-password protection; prepare reviewed schema and least-privilege grants; enable RLS on every exposed user-data table and verify ownership policies. Do not apply SQL until separately approved.
5. **Cloud persistence:** implement authenticated persistence for user preferences, language progress, daily activity, lesson completion and spaced-repetition reviews. Preserve local-first behavior and provide an explicit, validated, one-time import path; never silently overwrite remote data.
6. **Environment and auth setup:** configure Supabase URL/publishable key and auth redirect URLs; configure Gemini and Supabase server settings in Cloudflare secrets/environment. No secret values belong in GitHub.
7. **Release verification:** CI, end-to-end auth tests, tutor live test, data-isolation/RLS tests, mobile/desktop browser QA, backup/rollback plan, and owner approval.
8. **Cutover:** only after explicit approval, deploy to Cloudflare, verify production smoke tests, and then retire remaining Base44 configuration. Do not merge or deploy automatically.

## Explicit safety boundaries

- No production deployment, PR merge, database migration, destructive SQL, paid resource creation, or secret exposure without the owner's explicit approval.
- Keep the current Base44 application and its data untouched until the replacement has passed release verification and the owner approves cutover.
