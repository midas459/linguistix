import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export const runtime = "nodejs";

const LANGUAGES = {
  ar: "Modern Standard Arabic. Show Arabic script, transliteration, then English meaning. Explain roots and harakat when useful.",
  de: "German. Include noun articles and grammatical case when relevant. Explain irregular and separable verbs.",
  ja: "Japanese. Show kana/kanji with romaji. Explain particles and polite/plain forms when useful.",
  en: "English. Explain natural phrasing, pronunciation and grammar clearly.",
  es: "Spanish. Explain gender, verb forms and natural everyday usage.",
  fr: "French. Explain gender, agreement, liaison and natural everyday usage.",
  pt: "European Portuguese. Explain gender, verb forms and natural everyday usage.",
};

const MODES = {
  breakdown: "Break down the learner's sentence word by word, explain grammar, then provide a corrected natural version. Keep it under 180 words.",
  quiz: "Create exactly three short quiz questions. Put questions and answers in the quiz array. Do not reveal answers in the reply.",
  roleplay: "Stay in the requested scenario. Reply first in the target language in no more than three short sentences, then provide the English meaning in translation. Correct at most one mistake gently.",
};

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Sign in to use Kalam AI." }, { status: 401 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      error: "Kalam AI is not connected yet. Add OPENAI_API_KEY to the server environment to enable the tutor.",
      code: "AI_NOT_CONFIGURED",
    }, { status: 503 });
  }

  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }

  const { language, mode, message, history = [], scenario = "" } = body || {};
  if (!Object.hasOwn(LANGUAGES, language) || !Object.hasOwn(MODES, mode)) {
    return NextResponse.json({ error: "Choose a supported language and tutor mode." }, { status: 400 });
  }
  if (typeof message !== "string" || !message.trim() || message.length > 1200) {
    return NextResponse.json({ error: "Your message must be between 1 and 1,200 characters." }, { status: 400 });
  }
  if (!Array.isArray(history) || history.length > 12 || history.some((turn) =>
    !turn || !["user", "assistant"].includes(turn.role) || typeof turn.content !== "string" || turn.content.length > 2000
  )) {
    return NextResponse.json({ error: "Conversation history is invalid." }, { status: 400 });
  }

  const system = [
    "You are Kalam AI, a patient language tutor inside Linguistix.",
    `Target language: ${LANGUAGES[language]}`,
    MODES[mode],
    mode === "roleplay" && typeof scenario === "string" ? `Roleplay scenario: ${scenario.slice(0, 120)}` : "",
    "Be encouraging, concise, accurate and age-appropriate. Do not invent that you can hear the learner.",
    "Return only valid JSON with keys: reply (string), translation (string), quiz (array of objects with question and answer strings).",
    "Use an empty translation when not needed and an empty quiz array outside quiz mode.",
  ].filter(Boolean).join("\n\n");

  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  let upstream;
  try {
    upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          ...history.slice(-12).map(({ role, content }) => ({ role, content })),
          { role: "user", content: message.trim() },
        ],
      }),
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    return NextResponse.json({ error: "Kalam AI could not be reached. Please try again." }, { status: 502 });
  }

  if (!upstream.ok) {
    return NextResponse.json({ error: "The AI provider rejected the request. Check the server AI configuration." }, { status: 502 });
  }

  let payload;
  try { payload = await upstream.json(); }
  catch { return NextResponse.json({ error: "Kalam AI returned an unreadable response." }, { status: 502 }); }

  const raw = payload?.choices?.[0]?.message?.content;
  let result;
  try { result = typeof raw === "string" ? JSON.parse(raw) : null; }
  catch { result = null; }
  if (!result || typeof result.reply !== "string") {
    return NextResponse.json({ error: "Kalam AI returned an incomplete answer. Please try again." }, { status: 502 });
  }

  return NextResponse.json({
    reply: result.reply.slice(0, 4000),
    translation: typeof result.translation === "string" ? result.translation.slice(0, 1200) : "",
    quiz: Array.isArray(result.quiz) ? result.quiz.slice(0, 3).filter((item) =>
      item && typeof item.question === "string" && typeof item.answer === "string"
    ) : [],
  });
}
