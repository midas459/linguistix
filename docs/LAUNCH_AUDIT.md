# Linguistix launch audit

## Scope and evidence

This report records a repository-level review of the existing Base44/TanStack Start app and the Gemini-only tutor integration on branch `copilot/secure-gemini-tutor`. It is not a full browser-based launch certification. Findings below distinguish code/build evidence from behavior that still requires live environment or device testing.

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
- **Action required:** a Gemini key was pasted into chat during this work. Treat it as compromised, revoke it, and replace it before enabling Gemini in any environment. The key was not added to source, the example file, or the commit.
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

The local build printed Base44 warnings because `VITE_BASE44_APP_ID` and the Base44 proxy URL were not configured in this environment. A passing local build therefore does not verify connectivity to a linked Base44 app or either AI provider.

There is no package lockfile in the repository, so `npm ci` cannot be used reproducibly in this checkout. Dependency installation required npm's legacy peer-dependency resolution. Add and review a lockfile before relying on clean installs or CI.

## Launch blockers and follow-up

1. **Rotate the exposed Gemini key.** Confirm the replacement is stored only as a Base44 server secret.
2. **Configure Gemini.** Set `GEMINI_API_KEY` as a Base44 server secret; optionally set `GEMINI_MODEL` after verifying model availability.
3. **Run live Gemini checks.** Exercise valid responses, quota/rate limits, invalid credentials, network timeouts, malformed provider output, and sanitized failures in a non-production environment with the configured secret.
4. **Create reproducible CI.** No `.github` directory or GitHub Actions workflow was present during this review. Add checks for dependency installation, lint, tests and production build after committing a lockfile.
5. **Complete browser and device QA.** No viewport-specific or end-to-end checks were run here. Verify authentication, dashboard, lesson completion, flashcard scheduling, tutor, settings, errors, keyboard/accessibility behavior and themes at the requested mobile/tablet/desktop widths.
6. **Review settings requirements.** Current Settings covers language, appearance, reminders and local progress reset; it does not provide an AI configuration panel. Configure server secrets out-of-band and consider adding a safe, key-free status/help panel if users need in-app setup guidance.
7. **Confirm persistence expectations.** Progress is local to the browser. Verify that this is acceptable for launch or plan account synchronization and a recovery/export path.
8. **Confirm release operations.** No production deployment or merge was performed as part of this audit.

## Overall assessment

The Gemini-only tutor change passes its targeted automated checks and keeps provider credentials out of the browser bundle. The repository is **not launch-certified**: production secrets and live provider behavior, clean dependency installation/CI, and browser/accessibility/device QA remain unverified.
