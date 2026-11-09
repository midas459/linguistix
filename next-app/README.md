# Linguistix — Next.js application

This is the replacement application for the legacy Base44 runtime. Keep the existing Base44 app untouched until this replacement has passed release verification and the owner explicitly approves cutover.

## Stack

- Next.js App Router 16 and React 19
- Supabase Auth using `@supabase/ssr` cookie sessions
- Supabase Postgres with per-user Row Level Security (migration drafts only)
- Google Gemini only for Kalam AI, called from an authenticated server route
- Cloudflare Workers deployment through Cloudflare's recommended vinext integration (compatibility validation required)

## Local setup

1. Use Node.js 22 LTS.
2. From `next-app/`, install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from Supabase project settings.
5. Set `GEMINI_API_KEY` in the server environment if you want Kalam AI enabled.
6. Run `npm run dev` and open `http://localhost:3000`.

Do not add service-role keys or Gemini keys to `NEXT_PUBLIC_*`, client components, source control, or chat. The connected Supabase project currently has no Linguistix application tables; SQL in the parent `supabase/migrations` directory is draft only and has not been applied.

## Current feature set

- Seven language courses: Arabic, German, Japanese, English, Spanish, French and Portuguese.
- Responsive learning shell, course map, lessons, interactive lesson player, flashcards, pronunciation lab, research panel, dashboard and settings.
- Five visual themes.
- Supabase email/password registration and login, email confirmation, password recovery and route-level authentication enforcement.
- Server-side authenticated Kalam AI route using Gemini only, with bounded input, timeout, schema checks and sanitized errors.
- Local-first learning progress, XP, streaks, activity, hearts, badges, settings and spaced-repetition state.
- Authenticated `/api/learner-state` GET/PUT endpoint and account-aware background sync. It preserves the existing `lisan.state.v2` local data and avoids importing one account's local state into another account.

## Known release blockers

- Cloud sync is implemented in code but remains inactive until the reviewed Supabase migrations (including `learner_state`) are approved and applied.
- Supabase schema/RLS migrations have not been applied or fully verified. Review the SQL and the existing security findings before approval.
- Existing Base44 accounts/passwords do not automatically transfer. Users will need a new Supabase account or an explicitly planned recovery path.
- Cloudflare vinext compatibility, environment bindings and preview deployment must pass before production cutover.
- Live Gemini calls, browser QA, accessibility and mobile QA remain release gates.
- Study reminder preferences are saved locally; reminder delivery is not implemented.
- Cloud state currently uses a single versioned JSON snapshot with last-write-wins behavior; concurrent edits from multiple devices need a conflict-resolution policy before heavy use.

## Checks

```bash
npm run lint
npm run build
```

The GitHub Actions workflow runs these checks on changes to `next-app/`. A lockfile still needs to be generated and committed before switching CI to `npm ci`.

## Cutover safety

No production deployment, database migration, PR merge, destructive SQL or Base44 retirement is automatic. Keep the old runtime and its data intact until the replacement passes the full release checklist and the owner approves cutover.
