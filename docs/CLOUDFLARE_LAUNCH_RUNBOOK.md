# Linguistix Cloudflare launch runbook

This runbook is for the Next.js replacement in `next-app/`. It does not deploy or alter the legacy Base44 application.

## 1. Verify compatibility first

From the repository's `next-app/` directory:

```powershell
npx vinext check
```

Review every warning. Do not continue if the report identifies an unsupported feature that affects authentication, route handlers, server components or app navigation.

## 2. Initialize Cloudflare Workers support

The integration branch now contains the generated Cloudflare configuration in `next-app/vite.config.ts`, `next-app/cloudflare.config.ts` and `next-app/package.json`. CI has already run the initializer and built the Worker successfully. Only rerun the initializer if starting from an older branch or deliberately regenerating the platform configuration:

```powershell
npx vinext init --platform=cloudflare --name=linguistix --cdn-cache=none --data-cache=none --image-optimization=none
npm.cmd install
```

The initializer adds vinext/Vite dependencies and creates the Cloudflare Vite/Worker configuration alongside the existing Next.js setup. The current branch has already committed those outputs and a lockfile. Review any regenerated diff; do not accept unrelated rewrites.

Then run (already exercised in GitHub Actions):

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run build:vinext
```

The normal Next.js build and the Cloudflare/vinext build must both pass. The generated scripts/config may differ by vinext version; use the scripts actually written by the initializer.

## 3. Configure build-time and runtime settings

Set these before building the browser bundle:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

These are public client configuration values, not service-role credentials. They must be present at build time because the browser bundle references them.

Set this as a Cloudflare Worker **Secret** (not a plaintext variable):

- `GEMINI_API_KEY`

Optional server-side model setting:

- `GEMINI_MODEL` (defaults to `gemini-2.5-flash`)

Do not put Gemini keys or Supabase service-role/secret keys in GitHub source, `NEXT_PUBLIC_*`, browser code, or committed environment files. The app does not require a Supabase service-role key.

## 4. Configure Supabase Auth

After the site has a preview URL, add the exact preview and final production URLs to Supabase Auth's allowed redirect URLs. Configure email confirmation and password reset redirects to:

- `https://YOUR_HOST/auth/callback`

For production email delivery, configure a trusted custom SMTP provider and test confirmation and password reset messages. The default test email service is not a production email-delivery plan.

Enable leaked-password protection in Supabase Auth security settings.

## 5. Apply database migrations only after approval

The connected project currently has no Linguistix application tables. The two active v1 migrations are `20261109080500_learner_state.sql` and `20261109080600_security_hardening.sql`; earlier normalized-schema drafts are archived outside the active migrations folder. Read `supabase/LAUNCH_SETUP.md` before applying anything.

Do not apply them until the owner explicitly approves. After application, test:

- Anonymous requests cannot read or write learner data.
- User A cannot read or mutate User B's `learner_state`.
- Authenticated users can save and restore their own learning state.
- Import from an existing local snapshot does not overwrite remote data.
- The Supabase security advisor no longer reports the legacy public function grant.

## 6. Preview before production

Use a Cloudflare preview deployment first. Verify sign-up, email confirmation, sign-in, sign-out, password reset, all protected routes, all seven course routes, lesson completion, flashcard scheduling, settings, responsive navigation, and the live Gemini tutor.

Run the same checks with two separate test accounts to verify data isolation. Inspect Worker logs for runtime errors without logging credentials or learner messages.

## 7. Production cutover

Production deployment and cutover require separate explicit approval. Before cutover, confirm:

- A production domain is selected and its DNS/TLS is ready.
- Supabase Auth redirect URLs include the production domain.
- The reviewed database migrations are applied and RLS tests pass.
- Cloudflare build and preview checks pass.
- Gemini is live using a Cloudflare secret.
- A rollback plan exists and the legacy Base44 source/data remain preserved until the new app is verified.

Do not delete the legacy runtime or merge the release PR automatically.
