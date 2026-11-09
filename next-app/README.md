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

Do not add service-role keys or Gemini keys to `NEXT_PUBLIC_*`, client components, source control, or chat. The replacement Supabase project currently has no Linguistix application tables; SQL in the parent `supabase/migrations` directory is draft only and has not been applied.

## Current feature set

- Seven language courses: Arabic, German, Japanese, English, Spanish, French and Portuguese.
- Responsive learning shell, course map, lessons, interactive lesson player, flashcards, pronunciation lab, research panel, dashboard and settings.
- Five visual themes.
- Supabase email/password registration and login, email confirmation, password recovery and OAuth callback.
- Server-side authenticated Kalam AI route using Gemini only.
- Local-first learning progress, XP, streaks, activity, hearts, badges, settings and spaced-repetition state.

## Known release blockers

- Learning progress and preferences still live in browser localStorage. Cross-device Supabase sync is not implemented.
- Supabase schema/RLS migrations are not applied or fully verified. Review the existing migration SQL and security findings before approval.
- Existing Base44 accounts/passwords do not automatically transfer. Users will need a new Supabase account or an explicitly planned recovery path.
- Cloudflare vinext compatibility, environment bindings and preview deployment must pass before production cutover.
- Live Gemini calls, browser QA, accessibility and mobile QA remain release gates.
- Study reminder preferences are saved locally; reminder delivery is not implemented.

## Checks

```bash
npm run lint
npm run build
```

The GitHub Actions workflow runs these checks on changes to `next-app/`. A lockfile still needs to be generated and committed before switching CI to `npm ci`.

## Cutover safety

No production deployment, database migration, PR merge, destructive SQL or Base44 retirement is automatic. Keep the old runtime and its data intact until the replacement passes the full release checklist and the owner approves cutover.
