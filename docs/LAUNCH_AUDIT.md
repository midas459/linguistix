# Linguistix launch audit

## Scope and evidence

This report records a repository-level review of the Base44/TanStack Start app and Gemini-only tutor integration on `release-candidate-1-quality-gates`. It is not a full browser-based launch certification. Findings below distinguish verified repository/CI evidence from behavior that still requires live environment or device testing.

## Architecture

- React 19 and TanStack Start with file-based routes; Vite builds client assets and a Cloudflare Worker.
- Base44 supplies authentication and server-side runtime integration. Authenticated pages are grouped under `src/routes/_authed.jsx`, which applies `requireSignedIn` and renders the shared app shell.
- Tutor calls are POST server functions in `src/lib/server-fns.js`, guarded by `requireUser` and Zod input validation.
- Tutor generation is server-only. `src/lib/ai.server.js` reads Base44 secrets and delegates to `src/lib/tutor-provider-core.server.js`, which calls Google's Gemini `generateContent` endpoint.
- Learning preferences and progress are stored in browser `localStorage` by `src/lib/learn-store.jsx`; they are not synchronized to a server account.

## Existing features observed

The route tree includes sign-in, registration and password recovery; authenticated dashboard, lessons, flashcards, alphabet practice, badges, tutor and settings pages. Learning state includes language-specific progress, XP, streaks, lesson completions, review intervals, reminders, hearts and theme selection. The dashboard can seed clearly marked sample progress for a new learner.

The tutor supports Arabic, German and Japanese with breakdown, quiz and roleplay modes. Its server boundary limits message and history sizes and preserves the existing response contract. Provider calls have a timeout, response shape validation, and sanitized failures.

This list reflects code paths and route definitions; it does not certify every interaction or curriculum item in a live browser.

## Security review

- **Positive:** tutor access requires an authenticated user; input is validated and bounded; API keys are read from Base44 server secrets and sent in provider request headers, not query strings.
- **Positive:** `.env.local` is ignored by Git; `.env.example` contains only a blank Gemini key placeholder and the optional model name. A built-client search found no Gemini endpoint or key names.
- **Positive:** provider failures do not relay provider response bodies or credentials to the browser. The missing-Gemini-key case has a setup-specific message.
- **Credential rotation:** the user reports that the previously exposed Gemini key was revoked and a replacement was configured as a Base44 server secret. This is user-confirmed, not independently verified. The key was not added to source, the example file, or the commit.
- **Configuration note:** provider credentials are configured as Base44 runtime secrets, not loaded from `.env.local`. Do not put the key in a `VITE_*` variable.

## Build and test status

Checks run for the tutor integration:

| Check | Result |
|---|---|
| `npm test` | Pass — 7 mocked tests covering Gemini request construction, missing-key handling, sanitized authentication/quota/rate-limit failures, malformed output, structural validation, timeout, and upstream server errors |
| `npm run lint` | Pass |
| `npm run build` | Pass — client and Worker bundles produced |
| Client bundle search for provider endpoints and key names | No matches |
| `.env.local` ignore check | Ignored by `.gitignore` |

The local build printed Base44 warnings because `VITE_BASE44_APP_ID` and the Base44 proxy URL were not configured in that environment. A passing build therefore does not verify connectivity to a linked Base44 app or live Gemini responses.

**Updated RC1 dependency/CI status:** `.npmrc` now sets `legacy-peer-deps=true`; `package-lock.json` (lockfile v3) is committed; `.github/workflows/quality.yml` uses `npm ci` on Node.js 22. The pushed RC1 commit `38163998b8b90137bb6c319c1f42007a0e0b6762` has a successful GitHub Actions run: install, lint, unit tests and production build all passed. The contributor also reports local `npm ci`, lint, tests (7), and build passed using Node.js 26.13.0/npm 11.20.0. CI's Node.js 22 run is the authoritative automated check.

## Launch blockers and follow-up

1. **Gemini credential rotation/configuration:** the user reports that the previously exposed key was revoked and a replacement secret was configured in Base44. This is user-confirmed, not independently verified. Keep the credential server-side; never request or commit it.
2. **Run live Gemini checks.** Exercise valid responses for breakdown, quiz and roleplay, plus missing/invalid credentials, quota/rate limits, timeouts, malformed output and sanitized failures in a non-production environment.
3. **Complete browser and device QA.** No viewport-specific or end-to-end checks are certified yet. Verify authentication, dashboard, lesson completion, flashcard scheduling, tutor, settings, errors, keyboard/accessibility behavior and themes at mobile/tablet/desktop widths.
4. **Review settings requirements.** Current Settings covers language, appearance, reminders and local progress reset; it does not provide an AI configuration panel. Configure server secrets out-of-band and consider a safe, key-free status/help panel only if users need in-app setup guidance.
5. **Confirm persistence expectations.** Progress is local to the browser. Verify that this is acceptable for the first launch or plan account synchronization and a recovery/export path.
6. **Confirm release operations.** The RC1 branch remains separate from `main`; no production deployment or merge was performed.

## Overall assessment

The Gemini-only tutor change passes targeted automated checks and keeps provider credentials out of the browser bundle. Reproducible dependency installation and GitHub Actions quality gates are now in place and have passed on the RC1 branch. The repository is **not launch-certified**: live Gemini behavior and full browser/accessibility/device QA remain unverified.
