import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next") ?? "/dashboard";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=oauth_callback", origin));
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  } catch {
    // Do not leak provider, cookie, or token details into the redirect.
  }

  return NextResponse.redirect(new URL("/login?error=oauth_callback", origin));
}
