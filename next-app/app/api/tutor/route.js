import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

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

function jsonError(error, status, code) {
  return NextResponse.json({ error, code }, { status });
}

function buildSystem(language, mode, scenario) {
  return [
    "You are Kalam AI, a patient language tutor inside Linguistix.",
    `Target language: ${LANGUAGES[language]}`,
    MODES[mode],
    mode === "roleplay" && scenario ? `Roleplay scenario: ${scenario}` : "",
    "Be encouraging, concise, accurate and age-appropriate. Do not invent that you can hear the learner.",
    "Return only valid JSON with keys: reply (string), translation (string), quiz (array of objects with question and answer strings).",
    "Use an empty translation when not needed and an empty quiz array outside quiz mode.",
  ].filter(Boolean).join("\n\n");
}

function parseResult(raw) {
  if (typeof raw !== "string") return null;
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  try {
    const parsed = JSON.parse(cleaned);
    if (!parsed || typeof parsed.reply !== "string" || !parsed.reply.trim()) return null;
    const quiz = Array.isArray(parsed.quiz) ? parsed.quiz.slice(0, 3).filter((item) =>
      item && typeof item.question === "string" && typeof item.answer === "string"
    ).map((item) => ({ question: item.question.slice(0, 500), answer: item.answer.slice(0, 500) })) : [];
    return {
      reply: parsed.reply.slice(0, 4000),
      translation: typeof parsed.translation === "string" ? parsed.translation.slice(0, 1200) : "",
      quiz,
    };
  } catch {
    return null;
  }
}

async function callGemini({ apiKey, model, system, history, message }) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [
          ...history.map(({ role, content }) => ({
            role: role === "assistant" ? "model" : "user",
            parts: [{ text: content }],
          })),
          { role: "user", parts: [{ text: message }] },
        ],
        generationConfig: { temperature: 0.4, responseMimeType: "application/json" },
      }),
      signal: AbortSignal.timeout(20000),
    }
  );
  if (!response.ok) {
    // Keep upstream status and body private; never send provider diagnostics to the browser.
    throw new Error("Gemini request failed");
  }
  const payload = await response.json();
  return parseResult(payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n"));
}

export async function POST(request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return jsonError("Authentication is not configured yet.", 503, "AUTH_NOT_CONFIGURED");
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return jsonError("Sign in to use Kalam AI.", 401, "AUTH_REQUIRED");

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 16000) return jsonError("Request is too large.", 413, "REQUEST_TOO_LARGE");

  let body;
  try { body = await request.json(); }
  catch { return jsonError("Invalid request body.", 400, "INVALID_JSON"); }

  const { language, mode, message, history = [], scenario = "" } = body || {};
  if (!Object.hasOwn(LANGUAGES, language) || !Object.hasOwn(MODES, mode)) {
    return jsonError("Choose a supported language and tutor mode.", 400, "INVALID_OPTIONS");
  }
  if (typeof message !== "string" || !message.trim() || message.length > 1200) {
    return jsonError("Your message must be between 1 and 1,200 characters.", 400, "INVALID_MESSAGE");
  }
  if (!Array.isArray(history) || history.length > 12 || history.some((turn) =>
    !turn || !["user", "assistant"].includes(turn.role) ||
    typeof turn.content !== "string" || !turn.content.trim() || turn.content.length > 2000
  )) {
    return jsonError("Conversation history is invalid.", 400, "INVALID_HISTORY");
  }
  if (typeof scenario !== "string" || scenario.length > 120) {
    return jsonError("Scenario must be 120 characters or fewer.", 400, "INVALID_SCENARIO");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return jsonError("Kalam AI is not configured yet. Add the server-side GEMINI_API_KEY.", 503, "AI_NOT_CONFIGURED");

  try {
    const result = await callGemini({
      apiKey,
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      system: buildSystem(language, mode, scenario),
      history: history.map(({ role, content }) => ({ role, content: content.trim() })),
      message: message.trim(),
    });
    if (!result) return jsonError("Kalam AI returned an unreadable response. Please try again.", 502, "INVALID_AI_RESPONSE");
    if (mode === "quiz" && result.quiz.length !== 3) {
      return jsonError("Kalam AI could not create a complete quiz. Please try again.", 502, "INCOMPLETE_QUIZ");
    }
    return NextResponse.json(result, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return jsonError("Kalam AI is temporarily unavailable. Please try again shortly.", 502, "AI_PROVIDER_UNAVAILABLE");
  }
}
