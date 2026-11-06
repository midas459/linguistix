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

function buildSystem(language, mode, scenario) {
  return [
    "You are Kalam AI, a patient language tutor inside Linguistix.",
    `Target language: ${LANGUAGES[language]}`,
    MODES[mode],
    mode === "roleplay" && typeof scenario === "string" ? `Roleplay scenario: ${scenario.slice(0, 120)}` : "",
    "Be encouraging, concise, accurate and age-appropriate. Do not invent that you can hear the learner.",
    "Return only valid JSON with keys: reply (string), translation (string), quiz (array of objects with question and answer strings).",
    "Use an empty translation when not needed and an empty quiz array outside quiz mode.",
  ].filter(Boolean).join("\n\n");
}

function parseResult(raw) {
  if (typeof raw !== "string") return null;
  const cleaned = raw.trim().replace(/^\x60{3}(?:json)?\s*/i, "").replace(/\s*\x60{3}$/i, "");
  try {
    const parsed = JSON.parse(cleaned);
    if (!parsed || typeof parsed.reply !== "string") return null;
    return {
      reply: parsed.reply.slice(0, 4000),
      translation: typeof parsed.translation === "string" ? parsed.translation.slice(0, 1200) : "",
      quiz: Array.isArray(parsed.quiz) ? parsed.quiz.slice(0, 3).filter((item) =>
        item && typeof item.question === "string" && typeof item.answer === "string"
      ) : [],
    };
  } catch {
    return null;
  }
}

async function callGemini({ apiKey, system, history, message }) {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [
          ...history.slice(-12).map(({ role, content }) => ({
            role: role === "assistant" ? "model" : "user",
            parts: [{ text: content }],
          })),
          { role: "user", parts: [{ text: message }] },
        ],
        generationConfig: { temperature: 0.4, responseMimeType: "application/json" },
      }),
      signal: AbortSignal.timeout(30000),
    }
  );
  if (!response.ok) throw new Error(`Gemini request failed (${response.status})`);
  const payload = await response.json();
  return parseResult(payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n"));
}

async function callOpenAICompatible({ apiKey, baseUrl, model, system, history, message }) {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        ...history.slice(-12).map(({ role, content }) => ({ role, content })),
        { role: "user", content: message },
      ],
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`AI provider request failed (${response.status})`);
  const payload = await response.json();
  return parseResult(payload?.choices?.[0]?.message?.content);
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Sign in to use Kalam AI." }, { status: 401 });

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

  const system = buildSystem(language, mode, scenario);
  const providers = [];
  if (process.env.GEMINI_API_KEY) {
    providers.push(() => callGemini({
      apiKey: process.env.GEMINI_API_KEY, system, history, message: message.trim(),
    }));
  }
  if (process.env.GROQ_API_KEY) {
    providers.push(() => callOpenAICompatible({
      apiKey: process.env.GROQ_API_KEY,
      baseUrl: "https://api.groq.com/openai/v1",
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      system, history, message: message.trim(),
    }));
  }
  if (process.env.OPENAI_API_KEY) {
    providers.push(() => callOpenAICompatible({
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      system, history, message: message.trim(),
    }));
  }

  if (!providers.length) {
    return NextResponse.json({
      error: "Kalam AI is not connected yet. Add GEMINI_API_KEY or GROQ_API_KEY to the server environment.",
      code: "AI_NOT_CONFIGURED",
    }, { status: 503 });
  }

  for (const provider of providers) {
    try {
      const result = await provider();
      if (result) return NextResponse.json(result);
    } catch {
      // Try the next configured provider without exposing provider errors or secrets.
    }
  }

  return NextResponse.json({
    error: "Kalam AI is temporarily unavailable. Check your server AI configuration or try again shortly.",
    code: "AI_PROVIDER_UNAVAILABLE",
  }, { status: 502 });
}
