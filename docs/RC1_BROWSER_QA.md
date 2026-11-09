# Release Candidate 1 — Browser QA

This checklist is a release gate, not a claim that these checks have already passed. Record the browser, device, date, tester and result for each run. Use a non-production Base44 environment for provider tests.

## Test environment

- [ ] Confirm the tested commit SHA and deployment/environment.
- [ ] Confirm Base44 app ID and proxy configuration are present in the test environment.
- [x] User confirms the replacement Gemini credential is stored only as a Base44 server secret. Never paste keys into this checklist, browser storage, screenshots or issue comments. (Not independently verified.)
- [x] User confirms the Gemini key previously exposed in chat has been revoked. (Not independently verified.)

## Authentication and navigation

- [ ] New user registration and validation.
- [ ] Sign in with valid credentials.
- [ ] Invalid credentials show a safe, understandable error.
- [ ] Password recovery flow.
- [ ] Protected routes redirect signed-out users.
- [ ] Sign out clears the authenticated session.
- [ ] Refreshing a protected route preserves the expected signed-in state.
- [ ] Header, sidebar/mobile navigation and active route indicators work.

## Learning experience

- [ ] Dashboard loads for a new account without console errors.
- [ ] Sample/demo progress is clearly identified and does not masquerade as synced account data.
- [ ] Arabic, German and Japanese can each be selected.
- [ ] Lesson start, completion and next-lesson navigation work.
- [ ] Flashcard review, answer feedback and review scheduling work.
- [ ] Alphabet practice works for supported scripts.
- [ ] XP, streaks, badges and daily goals update consistently.
- [ ] Refresh and sign-in on a second browser confirm the documented local-only persistence behavior.
- [ ] Settings changes and progress reset behave as described, with confirmation before destructive reset.

## Tutor — non-production environment

Run with a valid signed-in test account and replacement server-side secrets.

- [ ] Gemini succeeds for breakdown, quiz and roleplay.
- [ ] Gemini-only configuration works without any secondary provider credentials.
- [ ] Missing credentials show safe setup guidance.
- [ ] Invalid credentials and quota/rate limits show sanitized errors.
- [ ] Timeout/network failure returns a recoverable error.
- [ ] Empty, oversized and malformed requests are rejected safely.
- [ ] Arabic, German and Japanese responses follow the response contract.
- [ ] Browser network inspection confirms provider requests and credentials never originate from the client.

Do not use real learner personal data in provider tests. Do not test quota exhaustion against a production account.

## Responsive, accessibility and browser checks

Run each critical flow at approximately 360px mobile, 768px tablet and 1280px desktop widths.

- [ ] No horizontal overflow or clipped dialogs.
- [ ] Navigation drawer opens, closes and traps focus appropriately.
- [ ] Keyboard-only navigation reaches all controls in a logical order.
- [ ] Visible focus indicators are present.
- [ ] Inputs have labels and actionable validation messages.
- [ ] Dialogs and menus expose accessible names and close behavior.
- [ ] Text contrast and theme readability are acceptable in every shipped theme.
- [ ] Loading, empty, success and error states are understandable.
- [ ] No uncaught console errors or failed critical network requests.

## Evidence and sign-off

For each failure, record the route, viewport, steps, expected result, actual result and sanitized screenshot/log. Do not include credentials, session tokens or personal learner data.

- [ ] All critical flows pass on desktop and mobile.
- [ ] No open critical/high severity defects.
- [ ] Live Gemini behavior and sanitized failure handling verified in staging.
- [ ] CI is green for the exact release candidate commit.
- [ ] Lockfile and deterministic clean-install requirement is satisfied.
- [ ] Product owner approves release.

**Release rule:** do not call RC1 launch-ready while any critical item is unchecked. CI passing alone is not browser QA or live-provider certification.
