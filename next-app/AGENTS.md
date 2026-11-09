# Linguistix Next.js application instructions

This folder is the Base44 replacement application. The repository root still contains the legacy TanStack Start + Base44 runtime; preserve it until the replacement is verified and cutover is approved.

## Stack and conventions

- Next.js App Router 16, React 19, JavaScript/JSX.
- Supabase Auth/Postgres through `@supabase/ssr` and `@supabase/supabase-js`.
- Keep Supabase clients request-scoped on the server. Use cookie `getAll`/`setAll` adapters and the Next.js 16 `proxy.js` request guard.
- Use `auth.getUser()` for server-side authorization decisions; do not trust browser-supplied user IDs or `getSession()` alone.
- Public browser configuration uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Never expose secret/service-role keys through `NEXT_PUBLIC_*`, client components, source control, or logs.
- Kalam AI is Gemini-only. Read `GEMINI_API_KEY` server-side; no Groq/OpenAI fallback.
- All user-owned database access must be protected by RLS and ownership predicates. Do not run SQL or apply migrations without the user's explicit approval.

## Product features

Preserve seven course codes (ar, de, ja, en, es, fr, pt), five themes (ocean, forest, sunset, lavender, midnight), lesson IDs, flashcards, spaced repetition, progress, activity, settings, pronunciation, tutor and account flows. Keep content IDs stable.

## Learning-state sync

- Existing browser state key is `lisan.state.v2`; keep it for compatibility.
- `/api/learner-state` stores a bounded JSON snapshot in `public.learner_state`.
- Only the authenticated owner may read/write their row; RLS is mandatory.
- Sync is inactive until `20261109080500_learner_state.sql` and `20261109080600_security_hardening.sql` are approved and applied.
- Initial sync preserves a local snapshot only when it is not already associated with a different Supabase user. Remote data wins if it exists.
- Never clear local state until remote read-back verification succeeds.
- Snapshot writes are last-write-wins; do not add concurrent multi-device editing without conflict handling.

## Account migration

Base44 passwords, sessions and OAuth grants are not portable by assumption. Provide a clear new-account/password-reset path. Do not silently claim existing Base44 accounts were migrated.

## Workflow

- Current integration branch: `base44-retirement-cloudflare-supabase`.
- Node.js 22 and the committed npm lockfile are required; use `npm ci`.
- CI runs vinext compatibility, ESLint, Next.js production build and Cloudflare Worker build.
- Cloudflare config is in `vite.config.ts` and `cloudflare.config.ts`; the Next config is ESM `next.config.mjs`.
- Do not merge to `main`, deploy production, or apply database migrations without explicit owner approval.
