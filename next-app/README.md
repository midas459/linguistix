# Linguistix — Next.js application

This is the replacement application for the legacy Base44 runtime. Keep the existing Base44 app untouched until this replacement has passed release verification and the owner explicitly approves cutover.

## Stack

- Next.js App Router 16 and React 19
- Supabase Auth using `@supabase/ssr` cookie sessions
- Supabase Postgres with per-user Row Level Security
- Google Gemini only for Kalam AI, called from an authenticated server route
- Cloudflare Workers through vinext and the Cloudflare Vite plugin

## Local setup

1. Use Node.js 22 LTS.
2. From `next-app/`, run `npm ci`.
3. Copy `.env.example` to `.env.local`.
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from Supabase project settings.
5. Set `GEMINI_API_KEY` in the server environment if you want Kalam AI enabled.
6. Run `npm run dev` and open `http://localhost:3000`. For the Cloudflare/Vite development path, use `npm run dev:vinext`.

Do not add service-role keys or Gemini keys to `NEXT_PUBLIC_*`, client components, source control, or chat. The connected Supabase project now has the `public.learner_state` table with RLS and four owner-scoped policies. The legacy `public.rls_auto_enable()` helper is no longer executable by `anon` or `authenticated`.

## Current feature set

- Seven language courses: Arabic, German, Japanese, English, Spanish, French and Portuguese.
- Responsive learning shell, course map, lessons, interactive lesson player, flashcards, pronunciation lab, research panel, dashboard and settings.
- Five visual themes.
- Supabase email/password registration and login, email confirmation, password recovery and route-level authentication enforcement.
- Server-side authenticated Kalam AI route using Gemini only, with bounded input, timeout, schema checks and sanitized errors.
- Local-first learning progress, XP, streaks, activity, hearts, badges, settings and spaced-repetition state.
- Authenticated `/api/learner-state` GET/PUT endpoint and account-aware background sync. It preserves the existing `lisan.state.v2` local data and avoids importing one account's local state into another account.

## Release blockers

- Supabase table and RLS setup is applied and catalog-verified. Still required: end-to-end tests with two real test accounts to prove cross-account isolation before enabling cloud sync for general users.
- Supabase Auth leaked-password protection is currently disabled. Supabase documentation says this feature is available on Pro and above; the connected project should remain on its current plan unless the owner separately chooses an upgrade. Earlier normalized schema drafts are archived under `supabase/drafts/legacy-normalized/` and are not required for v1.
- Existing Base44 accounts/passwords do not automatically transfer. Users will need a new Supabase account or an explicitly planned recovery path.
- GitHub Actions previously reported passing Next.js production build, ESLint, vinext compatibility scan (95% with one non-blocking React Strict Mode note), and Cloudflare Worker build. Re-run checks after the latest integration changes. A live Cloudflare preview and runtime environment bindings have not been tested.
- Live Gemini calls, browser QA, accessibility and mobile QA remain release gates.
- Study reminder preferences are saved locally; reminder delivery is not implemented.
- Cloud state currently uses a single versioned JSON snapshot with last-write-wins behavior; concurrent edits from multiple devices need a conflict-resolution policy before heavy use.

## Checks

```bash
npm ci
npm run lint
npm run build
npm run build:vinext
```

GitHub Actions runs these checks with the committed lockfile and Node.js 22.

## Cutover safety

No production deployment, database migration, PR merge, destructive SQL or Base44 retirement is automatic. Keep the old runtime and its data intact until the replacement passes the full release checklist and the owner approves cutover.
