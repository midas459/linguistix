# Base44 experience restoration — implementation brief

## Goal
Restore the original Linguistix/Lisan product experience inside `next-app/`, using the legacy app in the repository root (`src/`) as the source of truth. The current Next.js app is a migration shell, not a faithful port. Rebuild the experience rather than polishing the simplified placeholder dashboard.

## Safe workspace and branch
- Work only on branch `copilot/restore-base44-experience`, created from remote `supabase-migration-review` at commit `9add2c54c4ff59d0e0dec4a577bc8c79bf05ac30`.
- Do not switch, reset, clean, rebase, or overwrite the user's existing local checkout. It has nine uncommitted legacy-app changes and a divergent local history.
- Keep all implementation changes under `next-app/` unless a root-level instruction/document genuinely must change.
- Keep legacy `src/` unchanged.
- Do not merge PR #2, merge to `main`, deploy, apply SQL, or change Supabase project data.
- Never read, overwrite, print, or commit `.env.local`, access tokens, or secret keys.

## Verified source-of-truth files
Use these original components and their imports/related modules as design and behavior references:
- `src/components/shell/AppShell.jsx`: desktop sidebar + sticky top bar + mobile sheet/drawer.
- `src/components/shell/SideNav.jsx`: Lisan identity, Learn Map, Alphabet Lab, Flashcards, Kalam AI, Badges, Settings, XP/badge progress.
- `src/components/shell/TopBar.jsx`: language picker, streak, hearts, XP, Lugha Research, notifications, theme toggle, account menu/sign-out.
- `src/components/shell/PageHeader.jsx`: shared page heading.
- `src/components/dashboard/DashboardHero.jsx`, `src/components/dashboard/LearningPath.jsx`, `src/components/dashboard/WeeklyChart.jsx`, `src/components/dashboard/RecentActivity.jsx`, `src/components/dashboard/TickInstruments.jsx`, `src/styles/dashboard.css`: dashboard and learning path.
- `src/components/tutor/TutorChat.jsx`, `src/components/tutor/QuizCard.jsx`, `src/lib/server-fns.js`, `src/lib/ai.server.js`: Kalam AI behavior and structured quiz output.
- Also inspect the original alphabet, flashcards, badges, research dialog, lesson dialog/player, settings, reminder, auth, curriculum, learn-store, theme and styling modules before porting their behavior.
- Original global design tokens and fonts are in `src/index.css`; reuse the original look and responsive behavior, not the current generic blue placeholder style.

## Existing Next.js baseline
- Next.js App Router 16.4.5, React 19.3.1, Supabase SSR clients and auth routes already exist.
- Existing Next.js pages include home, login/register/recovery, dashboard, learn/course/lesson, pronunciation, settings and flashcards.
- The current `next-app/app/globals.css` is a minimal custom CSS sheet, and `next-app/package.json` currently does not list `lucide-react`, Tailwind, or the original shadcn/Radix component dependencies. Do not assume original imports resolve. Prefer a deliberate, minimal dependency/config migration or implement equivalent accessible components in the existing CSS/React stack.
- Preserve Next.js 16 `proxy.js` session refresh and server-side `supabase.auth.getUser()` authorization.
- Keep the original seven course codes (ar, de, ja, en, es, fr, pt), five themes (ocean, forest, sunset, lavender, midnight), stable lesson IDs, flashcards, SRS ratings, and the `lisan.state.v2` localStorage key.

## Required experience
1. App shell: responsive sidebar on desktop, accessible mobile drawer, top bar, language picker, profile/account controls, theme control and sign-out.
2. Dashboard: original dashboard hero, date-aware progress title, XP/card/minute KPIs, streak, weekly XP chart, recent activity, resume action, learning path and module/lesson completion states.
3. Navigation/features: Learn Map, Alphabet Lab, Flashcards, Kalam AI, Badges, Settings, Lugha Research, Pronunciation Lab and account flows. Every visible navigation item must lead to a working page/action; do not leave dead links.
4. Learning: preserve all seven course datasets, lesson IDs/content, interactive lesson screens, progress updates, hearts/XP/streaks, flashcard review and spaced repetition.
5. Themes: Ocean, Forest, Sunset, Lavender, Midnight; persist selection and verify contrast/readability in every theme.
6. Kalam AI: restore Breakdown, Mini quiz and Roleplay modes, message history, translation toggle, scenario controls and quiz cards. The original implementation calls the Base44 AI gateway, which is not portable by assuming the gateway exists in Next.js. Replace it with a documented server-only provider adapter only if a provider and server-side key are configured. Never expose a provider key to the browser or commit one. If no provider credential is available, keep the full tutor UI and return a clear setup-required error; do not fake AI replies or claim the tutor is live.
7. Data: retain local learning state compatibility. Do not create/use Supabase tables or run SQL in this task. Any future cloud sync/import must be separately designed, user-initiated, authenticated, RLS-protected, atomic, validated, non-overwriting, and read-back verified before local state can be cleared.

## Responsive/accessibility QA
Test at 375px, 768px, 1024px and 1440px. No horizontal overflow. Drawer and dialogs must be keyboard accessible, focus managed, and dismissible. Touch targets should be comfortably usable. Respect reduced-motion preferences. Ensure charts have accessible summaries and controls have labels/focus states.

## Execution and completion report
- First inspect current Next.js files and all relevant legacy dependencies/data modules.
- Implement in small coherent steps; preserve existing auth and learning state.
- Run the available lint, build and tests. Report exact commands and results. If command execution is unavailable, say so explicitly; do not claim checks passed.
- Report changed files, features restored, features still blocked, required environment variable NAMES (never values), responsive test results and commit SHA.
- Commit implementation to this branch only after checks. Do not merge or deploy.
