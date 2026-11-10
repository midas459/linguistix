# GitHub Copilot instructions — Linguistix

Read this file and `AGENTS.md` before making changes. The application brand is **Linguistix** (not “Linguistics” or the old “Lisan” label). Keep user-facing branding consistent with Linguistix.

## Current application state

- This repository is currently a React 19 + TanStack Start application using JavaScript/JSX, Vite, Tailwind CSS and the existing Base44 integration.
- The migration target is being built in `next-app/` as a separate Next.js App Router application using Supabase Auth/Postgres. The root remains the legacy TanStack Start + Base44 application until the replacement is feature-complete and approved for cutover.
- For Next.js/Supabase work, read `next-app/README.md` and `next-app/AGENTS.md`; keep all new Next.js runtime code inside `next-app/` during the staged migration.
- Preserve the existing working Base44 application while the replacement is developed and reviewed. Do not remove Base44 integration, switch production traffic, or delete legacy data as part of routine changes.
- Supabase project is connected, but proposed SQL migrations are review artifacts. **Do not execute SQL, apply migrations, alter the live database, or merge this review branch into main without explicit user approval.**
- Work on `supabase-migration-review` unless the user explicitly chooses another branch. Do not merge to `main` without approval.

## Enabled language courses

The app currently has seven enabled language courses in `src/data/curriculum.js`:

| Code | Language | Course status |
| --- | --- | --- |
| `ar` | Arabic (MSA) | Available |
| `de` | German | Available |
| `ja` | Japanese | Available |
| `en` | English | Available |
| `es` | Spanish | Available |
| `fr` | French | Available |
| `pt` | Portuguese | Available |

- Each enabled language must have a `LANGUAGES` entry and a matching `MODULES[code]` curriculum. Do not enable a language in the settings picker unless its course content and app flows exist.
- The lesson player also needs `LESSON_TASKS[code][moduleId]` in `src/data/lessons.js`, or a valid language-specific flashcard deck for the `starterTasks()` fallback. Keep the fallback working while replacing its generic prompts with authored exercises. Ensure every enabled lesson opens a non-empty set of screens.
- Speech playback must use the language's `speech` locale from `getLanguage(code)`; do not default English, Spanish, French or Portuguese to German voices.
- The settings page also displays a searchable ISO 639-1 catalogue. Catalogue entries without course content are intentionally disabled and marked “Course coming soon”. Do not represent this ISO 639-1 list as every language in the world; ISO 639-3 would be needed for a much broader catalogue.
- If adding another enabled course, update all dependent language-keyed state and backend validation: `src/lib/learn-store.jsx`, `supabase/migrations/0001_schema.sql`, and `supabase/migrations/0004_import_legacy_state.sql`, as well as any course-specific content/decks or UI assumptions. Keep language code validation allowlisted; never accept arbitrary client-supplied language codes.
- Learning state is currently browser-local under `lisan.state.v2`. Preserve existing progress when changing storage or migrating it. Legacy import must remain opt-in, atomic, authenticated and non-overwriting.

## Themes

Five supported theme IDs are `ocean`, `forest`, `sunset`, `lavender`, and `midnight`. Their palettes are defined in `src/index.css`; selection and legacy preference normalization are handled by the settings page and `src/lib/learn-store.jsx`. Keep theme IDs consistent across CSS, UI, local state, and Supabase migration constraints. Old `light` / `dark` preferences are normalized by the store.

## Data and migration safety

- Do not invent course data or claim that an unbuilt language is available.
- Do not change existing lesson IDs casually: they are used by local progress and the legacy import.
- Do not overwrite existing user progress during import or account linking. Preserve the original localStorage value until remote read-back verification succeeds.
- Existing Base44 passwords, sessions and OAuth grants are not assumed portable to Supabase Auth; plan for re-registration/password reset and OAuth re-consent.
- Keep Supabase service-role credentials server-only. Never expose secrets through `VITE_*`, browser code, commits, logs or generated examples.
- Apply Row Level Security to user-owned data and derive ownership from the authenticated session, not client-supplied user IDs.
- AI tutor requests must be authenticated, server-side, bounded in payload/usage, and must not expose provider keys.

## Engineering workflow

- Inspect the current implementation before editing; make focused changes and preserve existing behavior.
- Use JavaScript/JSX conventions already present. Do not introduce TypeScript unless the user explicitly requests a broader migration.
- Update tests and documentation when behavior changes. Run the repository's lint/build/test scripts when available and report exactly which checks were run; never claim a check passed if it was not run.
- Keep migrations reviewable and ordered. Explain any schema changes and wait for approval before applying them.

## Cloudflare setup and current migration direction

- The approved target architecture is **Cloudflare Workers + Supabase**. The Next.js/vinext replacement lives in `next-app/`; the root Base44 app is legacy rollback material, not the deployment target.
- For Cloudflare work, read `next-app/README.md`, `next-app/AGENTS.md`, and the relevant installed Cloudflare Agent Skills before editing. For this Next.js-on-Workers app, prioritize the Cloudflare `nextjs-on-cloudflare`, `frameworks-on-cloudflare`, `workers-best-practices`, and `wrangler` skills as applicable.
- VS Code MCP servers are configured in `.vscode/mcp.json`: `cloudflare` for account/API operations and `cloudflare-docs` for current documentation. Complete the OAuth authorization in VS Code when prompted; grant only the scopes needed for the task.
- Use the existing `next-app/cloudflare.config.ts` and vinext deployment workflow. Do not introduce a second, conflicting Wrangler configuration or regenerate deployment config without inspecting the existing setup.
- Use Cloudflare Preview deployments for validation. **Never deploy to production, change DNS/traffic, delete the legacy Base44 app, or merge the migration PR without the user's explicit approval of that specific cutover action.**
- Never commit Cloudflare tokens, Supabase service-role keys, Gemini keys, or local `.dev.vars*` files. Keep runtime secrets in Cloudflare Worker secrets; use GitHub Actions secrets only for CI authentication. Public Supabase URL/publishable key may be build/runtime configuration, but must not be confused with service-role credentials.
- Do not assume the preview worker inherits production bindings. Verify each preview's runtime bindings and secrets before claiming Supabase Auth or the Gemini tutor works.
- Prefer the Cloudflare `cf` CLI for account-wide Cloudflare API tasks where appropriate; use Wrangler/vinext for this existing Workers project and its preview/deployment workflow. Authenticate interactively with `cf auth login` or the VS Code MCP OAuth flow; never ask the user to paste credentials into chat.
- The active migration branch is `base44-retirement-cloudflare-supabase`. Keep changes on this branch unless the user directs otherwise.
