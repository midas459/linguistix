# Next.js migration workspace instructions

This folder is the new Linguistix application. The repository root is still the legacy TanStack Start + Base44 app; do not delete or rewrite it during the staged migration.

## Stack and conventions

- Next.js App Router 16, React 19, JavaScript/JSX.
- Supabase Auth/Postgres through `@supabase/ssr` and `@supabase/supabase-js`.
- Keep Supabase clients request-scoped on the server. Use cookie `getAll`/`setAll` adapters and the Next.js 16 `proxy.js` session-refresh convention.
- Use `auth.getUser()` for server-side authorization decisions; do not trust browser-supplied user IDs or `getSession()` alone.
- Public browser configuration uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Never expose secret/service-role keys through `NEXT_PUBLIC_*`, client components, source control, or logs.
- All user-owned database access must be protected by RLS and ownership predicates. Do not run SQL or apply migrations without the user's explicit approval.

## Features to port from the legacy app

Preserve the existing seven course codes (ar, de, ja, en, es, fr, pt), five themes (ocean, forest, sunset, lavender, midnight), lesson IDs, flashcards, spaced repetition, progress, activity, settings, pronunciation, tutor, and account flows. Keep content IDs stable so local learning data can be migrated safely.

## Data migration

- Existing browser state uses localStorage key `lisan.state.v2`; preserve it for backward compatibility.
- Import must be user-initiated, authenticated, validated, atomic and non-overwriting.
- Never clear local state until remote read-back verification succeeds.
- Base44 passwords, sessions and OAuth grants are not portable by assumption; plan a clear account re-registration/password-reset path.
- Do not switch production traffic or merge to `main` until the new app passes build, auth, RLS, data-integrity and feature QA and the owner explicitly approves.

## Workflow

- Work on `supabase-migration-review`.
- Pin dependencies and commit a lockfile after installation.
- Run lint/build and tests; report exactly what ran.
- Update the root `.github/copilot-instructions.md` and this file when architecture decisions change.
