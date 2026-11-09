-- Revoke direct RPC execution for the legacy auto-RLS helper.
-- The event trigger remains installed and continues to run on DDL events.
-- This migration is a draft and has NOT been applied.

revoke all on function public.rls_auto_enable() from public, anon, authenticated;
