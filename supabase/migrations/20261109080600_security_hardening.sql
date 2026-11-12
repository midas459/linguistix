-- Restrict direct RPC execution of the legacy auto-RLS helper, if present.
-- The event trigger remains installed and continues to run on DDL events.
-- This migration is safe on fresh projects where the legacy helper does not exist.

do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke all on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end
$$;
