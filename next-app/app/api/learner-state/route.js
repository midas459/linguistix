import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

const LANGUAGES = new Set(["ar", "de", "ja", "en", "es", "fr", "pt"]);
const THEMES = new Set(["ocean", "forest", "sunset", "lavender", "midnight", "sakura", "royal", "obsidian"]);
const MAX_STATE_BYTES = 64 * 1024;

function fail(message, status, code) {
  return NextResponse.json({ error: message, code }, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validState(state) {
  if (!isRecord(state) || !LANGUAGES.has(state.lang)) return false;
  if (state.theme !== undefined && !THEMES.has(state.theme)) return false;
  if (!isRecord(state.progress) || !isRecord(state.srs) || !isRecord(state.reminders)) return false;

  for (const language of LANGUAGES) {
    const progress = state.progress[language];
    const srs = state.srs[language];
    if (progress !== undefined && !isRecord(progress)) return false;
    if (srs !== undefined && !isRecord(srs)) return false;
    if (progress) {
      for (const key of ["xpTotal", "cardsTotal", "minutesTotal", "streak"]) {
        if (progress[key] !== undefined && (!Number.isSafeInteger(progress[key]) || progress[key] < 0 || progress[key] > 100000000)) return false;
      }
      if (progress.lessons !== undefined && (
        !Array.isArray(progress.lessons) || progress.lessons.length > 2000 ||
        progress.lessons.some((id) => typeof id !== "string" || id.length < 1 || id.length > 120)
      )) return false;
    }
  }

  if (state.reminders.days !== undefined && (
    !Array.isArray(state.reminders.days) || state.reminders.days.length > 7 ||
    state.reminders.days.some((day) => !Number.isInteger(day) || day < 0 || day > 6)
  )) return false;

  try {
    return new TextEncoder().encode(JSON.stringify(state)).byteLength <= MAX_STATE_BYTES;
  } catch {
    return false;
  }
}

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { error: fail("Sign in to sync your learning data.", 401, "AUTH_REQUIRED") };
  return { supabase, user };
}

export async function GET() {
  let auth;
  try { auth = await getAuthenticatedClient(); }
  catch { return fail("Supabase authentication is not configured.", 503, "AUTH_NOT_CONFIGURED"); }
  if (auth.error) return auth.error;

  const { data, error } = await auth.supabase
    .from("learner_state")
    .select("state, updated_at")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error) return fail("Learning data could not be loaded.", 503, "STATE_READ_FAILED");
  return NextResponse.json({
    state: data?.state ?? null,
    updatedAt: data?.updated_at ?? null,
  }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function PUT(request) {
  let auth;
  try { auth = await getAuthenticatedClient(); }
  catch { return fail("Supabase authentication is not configured.", 503, "AUTH_NOT_CONFIGURED"); }
  if (auth.error) return auth.error;

  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_STATE_BYTES + 1024) return fail("Learning data is too large.", 413, "STATE_TOO_LARGE");

  let body;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_STATE_BYTES + 1024) {
      return fail("Learning data is too large.", 413, "STATE_TOO_LARGE");
    }
    body = JSON.parse(raw);
  } catch {
    return fail("Invalid request body.", 400, "INVALID_JSON");
  }

  if (body?.userId !== auth.user.id) return fail("The signed-in account changed. Reload before syncing.", 409, "ACCOUNT_CHANGED");
  if (!validState(body?.state)) return fail("Learning data failed validation.", 400, "INVALID_STATE");

  const { error } = await auth.supabase.from("learner_state").upsert({
    user_id: auth.user.id,
    state: body.state,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });

  if (error) return fail("Learning data could not be saved.", 503, "STATE_WRITE_FAILED");
  return NextResponse.json({ saved: true }, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
