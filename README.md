# Linguistix

Linguistix is a language-learning web app with guided lessons, flashcards, spaced repetition, pronunciation practice, learning progress, themes and an AI tutor.

## Current status

- **Current runtime:** React 19 + TanStack Start, JavaScript/JSX, Vite, Tailwind CSS and the existing Base44 integration.
- **Migration target:** a separate Next.js App Router + Supabase Auth/Postgres application is being built in `next-app/`. The root application still runs on TanStack Start and Base44; the replacement is not yet feature-complete.
- **Next.js workspace:** see `next-app/README.md` for setup, Supabase environment variables and current migration scope.
- **Safe review branch:** `supabase-migration-review`.
- **Database safety:** SQL files under `supabase/migrations/` are drafts only. They have not been executed against the connected Supabase project. Do not apply them or merge this branch into `main` without the owner's explicit approval.
- **Legacy safety:** keep the Base44 app and its existing authentication available until the replacement has been tested and a deliberate cutover is approved.

## Available language courses

Seven languages currently have curriculum modules and flashcard decks:

| Code | Language |
| --- | --- |
| `ar` | Arabic (Modern Standard Arabic) |
| `de` | German |
| `ja` | Japanese |
| `en` | English |
| `es` | Spanish |
| `fr` | French |
| `pt` | Portuguese (European Portuguese starter content) |

The settings screen also provides a searchable ISO 639-1 language catalogue. Catalogue entries without published curriculum remain disabled and are marked as coming soon. The catalogue is not a claim that all of the world's approximately 7,000 languages are supported.

The four newer courses use starter lesson tasks generated from their language-specific flashcard decks where fully authored interactive task sets are not yet available. Expand and review this content before marketing the courses as comprehensive.

## Themes

The five supported theme IDs are:

- `ocean` — teal and blue
- `forest` — green
- `sunset` — orange and amber
- `lavender` — violet
- `midnight` — dark navy

Theme definitions live in `src/index.css`; settings and preference state live in `src/routes/_authed/settings.jsx` and `src/lib/learn-store.jsx`.

## Local development

Requirements: Node.js (use a current LTS release) and npm.

```bash
npm install
npm run dev
```

The app currently uses the Base44 Vite plugin and Base44 platform runtime. For the platform's full local backend workflow, install/authenticate the Base44 CLI and follow the owner dashboard's current setup instructions.

Useful scripts:

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

This repository currently has no committed npm lockfile, so `npm ci` is not the correct install command until a lockfile is added and committed.

## Key project files

- `src/data/curriculum.js` — enabled languages and lesson modules.
- `src/data/cards.js` — language-specific flashcard decks.
- `src/data/lessons.js` — authored lesson exercises and starter task generation.
- `src/data/language-catalog.js` — searchable ISO 639-1 catalogue.
- `src/lib/learn-store.jsx` — local learning state, progress, themes and spaced repetition.
- `src/routes/_authed/settings.jsx` — language and theme settings.
- `src/index.css` — theme palettes and design tokens.
- `.github/copilot-instructions.md` — project-specific guidance for GitHub Copilot.
- `AGENTS.md` — repository architecture and safety conventions.
- `supabase/migrations/` — reviewed migration drafts; not applied.

## Migration guardrails

1. Preserve existing Base44 behavior until the Next.js/Supabase replacement has passed functional and security testing.
2. Keep Supabase service-role secrets server-only; never put them in browser-exposed `VITE_*` or `NEXT_PUBLIC_*` variables.
3. Enable RLS on every exposed user-data table and enforce ownership using the authenticated user ID.
4. Treat legacy localStorage import as opt-in, authenticated, atomic and non-overwriting. Do not clear the original local state before verifying the imported state can be read back.
5. Existing Base44 passwords, sessions and OAuth grants should not be assumed portable to Supabase Auth.
6. Run lint/build and migration review before proposing a release. Report checks honestly; do not claim tests passed unless they were run.
7. Do not execute SQL, apply migrations, switch production traffic, or merge into `main` without explicit owner approval.

For AI-assisted work, read `.github/copilot-instructions.md` and `AGENTS.md` before editing.
