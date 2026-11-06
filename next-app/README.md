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
5. Add a Gemini API key as `GEMINI_API_KEY` in `.env.local` to enable Kalam AI. Optionally add `GROQ_API_KEY` as a fallback. You can also configure the optional OpenAI-compatible fallback.
6. Run `npm run dev` and open http://localhost:3000.

### AI provider configuration

Kalam AI uses server-side providers in this order:

1. **Gemini** — `GEMINI_API_KEY`, model defaults to `gemini-2.5-flash`; override with `GEMINI_MODEL`.
2. **Groq fallback** — `GROQ_API_KEY`, model defaults to `llama-3.3-70b-versatile`; override with `GROQ_MODEL`.
3. **Optional OpenAI-compatible fallback** — `OPENAI_API_KEY`, `OPENAI_MODEL`, and `OPENAI_BASE_URL`.

If a configured provider fails or returns invalid output, the route tries the next configured provider. Provider errors and secrets are not sent to the browser. The route requires an authenticated Supabase user. Without a configured key, the tutor page remains visible and explains that the provider is not configured.

Get keys from [Google AI Studio](https://aistudio.google.com/apikey) and [Groq Console](https://console.groq.com/keys). Add them only to your local `.env.local` or your hosting provider's server-side environment settings. Never paste keys into chat, browser settings, client-side code, public environment variables, or source control. If a key is accidentally shared, revoke it and create a replacement.

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
- Kalam AI tutor interface with breakdown, quiz and roleplay modes, backed by an authenticated server route with Gemini-first and optional Groq/OpenAI-compatible fallback.

## Remaining migration work

- Persist learning progress, settings, flashcard schedules and activity in Supabase with tested Row Level Security.
- Implement actual reminder delivery (current settings only store the learner's preference locally).
- Complete profile/account management, voice recording and pronunciation assessment.
- Add opt-in, validated migration of legacy local state and verify imported data.
- Complete accessibility, mobile-browser and end-to-end QA.

Learning progress and preferences currently remain local to the browser; no Supabase learning tables have been created or used by this Next.js feature layer yet.

## Data safety

The SQL files in the parent `supabase/migrations` folder are drafts. They have not been applied to the connected Supabase project. Keep the Base44 app running until the new app and data migration have passed verification and the owner explicitly approves cutover.
