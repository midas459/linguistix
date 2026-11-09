# Linguistix

Linguistix is a language-learning application with guided lessons, flashcards, pronunciation practice and an AI tutor.

## Active replacement application

The Base44-free replacement is being built in [`next-app/`](./next-app/) using Next.js 16, Supabase Auth/Postgres and Google Gemini. Cloudflare Workers is the planned hosting target, pending compatibility and release verification.

See:
- [Next.js app setup and feature status](./next-app/README.md)
- [Base44 retirement architecture decision](./docs/BASE44_RETIREMENT_ARCHITECTURE.md)
- [Supabase launch setup and migration order](./supabase/LAUNCH_SETUP.md)

## Legacy runtime

The repository root still contains the previous TanStack Start + Base44 application. It is retained temporarily as a reference and rollback source. It is **not** the new launch target. Do not deploy it as the replacement or delete its files until the new app has passed release QA and the owner approves cutover.

## Release status

The replacement is not production-ready yet. Required gates include applying reviewed Supabase migrations with explicit approval, verifying auth and RLS isolation, validating Cloudflare vinext compatibility, live Gemini testing, end-to-end browser QA, and a separately approved production deployment.

No production migration, deployment or merge is performed automatically.
