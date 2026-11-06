# Linguistix — Next.js migration workspace

This folder is the isolated replacement application. The repository root remains the legacy TanStack Start + Base44 app until the replacement is feature-complete and approved for cutover.

## Stack

- Next.js App Router 16
- React 19
- Supabase Auth through `@supabase/ssr`
- JavaScript/JSX

## Setup

1. Install Node.js 22 LTS or a compatible current LTS.
2. From this folder, run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Add the Supabase project URL and publishable key from the Supabase dashboard.
5. Optional: add `OPENAI_API_KEY` to `.env.local` to enable Kalam AI. Keep it server-only; never prefix it with `NEXT_PUBLIC_`.
6. Run `npm run dev` and open http://localhost:3000.

Optional AI settings: `OPENAI_MODEL` (defaults to `gpt-4o-mini`) and `OPENAI_BASE_URL` (defaults to the OpenAI API base URL). The tutor route requires an authenticated Supabase user. Without an AI key, the tutor page remains visible and explains that the provider is not configured.

Do not put a Supabase secret/service-role key or AI provider key in browser code, public environment variables, or source control.

## Current implementation

- Next.js App Router root layout and responsive authenticated app shell.
- Supabase browser and server clients with cookie-based sessions.
- Next.js 16 `proxy.js` refreshes/validates claims.
- Email/password sign-in, account registration/email confirmation, password recovery, and Google OAuth start/callback.
- Server-protected course, dashboard, flashcard, pronunciation and tutor routes.
- Seven-language curriculum and existing lesson/task/card content retained.
- Interactive six-screen lesson exercises.
- Local learning-state store retained under `lisan.state.v2`, with XP, streaks, hearts, activity, achievements and spaced-repetition scheduling.
- Dashboard with daily goals, weekly XP chart, course progress, achievements and recent activity.
- Flashcard review with four spaced-repetition ratings.
- Five themes, seven course choices and local study-reminder preferences.
- Pronunciation Lab using browser speech synthesis, language-specific sample phrases, voice selection and playback controls.
- Lugha Research searches flashcard reference content across all seven languages.
- Kalam AI tutor interface with breakdown, quiz and roleplay modes, backed by an authenticated server route. A provider key is required to receive live AI responses.

## Remaining migration work

- Persist learning progress, settings, flashcard schedules and activity in Supabase with tested Row Level Security.
- Implement actual reminder delivery (current settings only store the learner's preference locally).
- Complete profile/account management, voice recording and pronunciation assessment.
- Add opt-in, validated migration of legacy local state and verify imported data.
- Complete accessibility, mobile-browser and end-to-end QA.

Learning progress and preferences currently remain local to the browser; no Supabase learning tables have been created or used by this Next.js feature layer yet.

## Data safety

The SQL files in the parent `supabase/migrations` folder are drafts. They have not been applied to the connected Supabase project. Keep the Base44 app running until the new app and data migration have passed verification and the owner explicitly approves cutover.
