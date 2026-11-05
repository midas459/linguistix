# Linguistix — Next.js migration workspace

This folder is the isolated replacement application. The root repository remains the legacy TanStack Start + Base44 app until the replacement is feature-complete and approved for cutover.

## Stack

- Next.js App Router (16.x)
- React 19
- Supabase Auth/Postgres using `@supabase/ssr`
- JavaScript/JSX

## Setup

1. Install Node.js 22 LTS or a compatible current LTS.
2. In this folder, run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Add the Supabase project URL and publishable key from the Supabase dashboard.
5. Run `npm run dev` and open http://localhost:3000.

Do not put a Supabase secret/service-role key in a `NEXT_PUBLIC_*` variable or browser code.

## Current implementation

- Next.js App Router root layout and landing page.
- Supabase browser and server clients with cookie-based sessions.
- Next.js 16 `proxy.js` refreshes/validates claims.
- Email/password sign-in and Google OAuth start/callback.
- Server-protected dashboard route.

This is the migration foundation, not a completed port. Lessons, flashcards, SRS, progress, themes, settings, tutor, profile management, account recovery, signup/verification, and legacy-state import still need to be ported and tested.

## Data safety

The SQL files in the parent `supabase/migrations` folder are drafts. They have not been applied to the connected Supabase project. Keep the Base44 app running until the new app and data migration have passed verification and the owner explicitly approves cutover.
