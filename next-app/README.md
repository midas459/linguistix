# Linguistix — Next.js application

This is the replacement application for the legacy Base44 runtime. Keep the existing Base44 app untouched until this replacement has passed release verification and the owner explicitly approves cutover.

## Stack

- Next.js App Router 16 and React 19
- Supabase Auth using `@supabase/ssr` cookie sessions
- Supabase Postgres with per-user Row Level Security
- Cloudflare Workers AI for Kalam AI, accessed through a server-side Workers AI binding
- Cloudflare Workers through vinext and the Cloudflare Vite plugin

## Local setup

1. Use Node.js 22 LTS.
2. From `next-app/`, run `npm ci`.
3. Copy `.env.example` to `.env.local`.
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from Supabase project settings.
5. Authenticate the Cloudflare CLI with `npx cf auth login` if you want to run Workers AI locally.
6. Run `npm run dev:vinext` for the Cloudflare/Vite development runtime. The standard `npm run dev` Next.js Node server does not provide the Cloudflare AI binding.

Do not add service-role keys or AI provider keys to `NEXT_PUBLIC_*`, client components, source control, or chat. Kalam does not require learners to provide an API key. The connected Supabase project now has the `public.learner_state` table with RLS and four owner-scoped policies. The legacy `public.rls_auto_enable()` helper is no longer executable by `anon` or `authenticated`.

## Kalam AI

Kalam calls Cloudflare Workers AI using the `AI` binding declared in `cloudflare.config.ts`. The initial model is `@cf/google/gemma-4-26b-a4b-it`, selected for its multilingual support and availability on the Workers Free plan. The authenticated `/api/tutor` route retains bounded input, history validation, structured response parsing and sanitized errors. The binding is available in the deployed Worker; local Cloudflare/Vite development uses the remote binding.

Workers AI currently includes 10,000 Neurons per day at no charge. The allowance is shared across this Cloudflare account and resets daily; requests can fail after it is exhausted. Monitor usage in the Cloudflare dashboard. Some models require paid access, so do not change the configured model without checking its plan eligibility first.

## Cloudflare preview deployment

The isolated preview is deployed manually from GitHub Actions using `.github/workflows/cloudflare-preview.yml`. It does not deploy the production Worker or merge the pull request.

Before running it, add these repository settings in GitHub (**Settings → Secrets and variables → Actions**):

**Actions secret**
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with the Workers deployment permissions required by the vinext Cloudflare CLI.

**Actions variables**
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID.
- `NEXT_PUBLIC_SUPABASE_URL`: the Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: the Supabase publishable key.

Then open **Actions → Cloudflare preview deployment → Run workflow** and use the default preview name. The workflow runs compatibility checks and lint, builds with `CLOUDFLARE_PREVIEW_BUILD=true`, and deploys an isolated Worker Preview. It prints the preview URL in the deployment logs.

Cloudflare Preview URLs are explicitly enabled in `cloudflare.config.ts` with `previewUrls: true`. Cloudflare bindings, including Workers AI, are declared in the Worker configuration. Preview runtime variables for Supabase must still be configured in Cloudflare Dashboard → Workers & Pages → Linguistix → Settings. Cloudflare Preview settings do not inherit production settings. Add the resulting preview URL to Supabase Auth's allowed redirect URLs/site URL as appropriate, then test signup, email confirmation, password reset, learner-state sync and Kalam AI. Do not promote the preview until those checks pass.

## Self-hosted deployment (Docker)

The self-hosted option runs the standard Next.js Node server in Docker. It does not provide the Cloudflare Workers AI binding, so Kalam AI is available only when deployed to the configured Cloudflare Worker. The Docker option still uses your configured Supabase project for account sync.

1. Install Docker Engine/Desktop with the Compose plugin.
2. From this directory, copy `.env.example` to `.env`.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env`. Keep `.env` private and out of Git.
4. Build and start the container:

```bash
docker compose -f compose.yaml up --build -d
```

5. Open `http://localhost:3000`. For internet access, put the service behind a TLS-terminating reverse proxy (Caddy, Nginx, or Traefik); do not expose the container directly without HTTPS.
6. Add your public site URL and `https://YOUR_HOST/auth/callback` to Supabase Auth's site URL / allowed redirect URLs. Configure SMTP for reliable confirmation and password-reset emails.
7. Check health and logs:

```bash
docker compose -f compose.yaml ps
docker compose -f compose.yaml logs --tail=100 linguistix
```

To update, pull the reviewed branch and run `docker compose -f compose.yaml up --build -d` again. To stop, run `docker compose -f compose.yaml down`. Learning data remains in Supabase; the container itself is stateless. Back up Supabase data separately.

Never put a Supabase service-role key in this app; the application uses the publishable key plus per-user RLS.

## Current feature set

- Seven language courses: Arabic, German, Japanese, English, Spanish, French and Portuguese.
- Responsive learning shell, course map, lessons, interactive lesson player, flashcards, pronunciation lab, research panel, dashboard and settings.
- Eight visual themes, including Sakura, Imperial and Obsidian.
- Supabase email/password registration and login, email confirmation, password recovery and route-level authentication enforcement.
- Server-side authenticated Kalam AI route using Cloudflare Workers AI, with bounded input, response parsing and sanitized errors.
- Local-first learning progress, XP, streaks, activity, hearts, badges, settings and spaced-repetition state.
- Authenticated `/api/learner-state` GET/PUT endpoint and account-aware background sync. It preserves the existing `lisan.state.v2` local data and avoids importing one account's local state into another account.

## Release blockers

- Supabase table and RLS setup is applied and catalog-verified. Still required: end-to-end tests with two real test accounts to prove cross-account isolation before enabling cloud sync for general users.
- Supabase Auth leaked-password protection is currently disabled. Supabase documentation says this feature is available on Pro and above; the connected project should remain on its current plan unless the owner separately chooses an upgrade. Earlier normalized schema drafts are archived under `supabase/drafts/legacy-normalized/` and are not required for v1.
- Existing Base44 accounts/passwords do not automatically transfer. Users will need a new Supabase account or an explicitly planned recovery path.
- Re-run checks after the latest integration changes. The isolated Cloudflare preview has deployed successfully in earlier revisions; confirm current production deployment and public HTTP health checks. Full browser-level auth, learner-state isolation and live AI/TTS acceptance tests remain outstanding.
- Test Kalam with Arabic and Japanese prompts, plus all other supported languages, after deployment. A successful homepage HTTP response does not prove that authenticated AI inference works.
- Study reminder preferences are saved locally; reminder delivery is not implemented.
- Cloud state currently uses a single versioned JSON snapshot with last-write-wins behavior; concurrent edits from multiple devices need a conflict-resolution policy before heavy use.

## Checks

```bash
npm ci
npm run lint
npm run build
npm run build:vinext
```

GitHub Actions runs these checks with the committed lockfile and Node.js 22.

## Cutover safety

No database migration, PR merge, destructive SQL or Base44 retirement is automatic. Keep the old runtime and its data intact until the replacement passes the full release checklist and the owner approves cutover.
