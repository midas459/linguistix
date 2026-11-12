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
  lookup: "Act as a multilingual dictionary. Translate the learner’s exact word or phrase into the requested target language. Put the native writing system first, then a readable transliteration, a concise English meaning, and one natural example sentence with its English translation. If the input is already in the target language, explain it rather than translating it again. This is a fresh dictionary lookup, not a flashcard search. Never say no matching cards were found. Keep the answer concise and factual.",
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
  const cleaned = raw.trim();
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
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents: [
      ...history.map(({ role, content }) => ({
        role: role === "assistant" ? "model" : "user",
        parts: [{ text: content }],
      })),
      { role: "user", parts: [{ text: message }] },
    ],
    generationConfig: { responseMimeType: "application/json" },
  });

  // Gemini can return transient 429/5xx responses under load. Retry twice,
  // but never retry authentication, validation, or model-not-found errors.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body,
      signal: AbortSignal.timeout(25000),
    });
    if (response.ok) {
      const payload = await response.json();
      return parseResult(payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n"));
    }
    const errorPayload = await response.json().catch(() => null);
    const error = new Error("Gemini request failed");
    error.providerStatus = response.status;
    const details = errorPayload?.error?.details || [];
    const retryInfo = details.find((item) => item["@type"]?.endsWith("RetryInfo"));
    const quotaFailure = details.find((item) => item["@type"]?.endsWith("QuotaFailure"));
    const retryDelay = retryInfo?.retryDelay;
    const retrySeconds = typeof retryDelay === "string" ? Number.parseFloat(retryDelay) : NaN;
    error.retryAfterSeconds = Number.isFinite(retrySeconds) ? Math.min(3600, Math.max(1, Math.ceil(retrySeconds))) : null;
    error.quotaReason = quotaFailure ? "quota" : "rate";
    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 2) throw error;
    const delay = error.retryAfterSeconds ? Math.min(5000, error.retryAfterSeconds * 1000) : 500 * (attempt + 1);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  return null;
}

export async function POST(request) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return jsonError("Authentication is not configured yet.", 503, "AUTH_NOT_CONFIGURED");
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return jsonError("Sign in to use Kalam AI.", 401, "AUTH_REQUIRED");
  } catch {
    return jsonError("Authentication could not be verified. Please try again.", 503, "AUTH_UNAVAILABLE");
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > 16000) {
    return jsonError("Request is too large.", 413, "REQUEST_TOO_LARGE");
  }

  let body;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 16000) {
      return jsonError("Request is too large.", 413, "REQUEST_TOO_LARGE");
    }
    body = JSON.parse(raw);
  } catch {
    return jsonError("Invalid request body.", 400, "INVALID_JSON");
  }

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
      model: "gemini-3.8-flash",
      system: buildSystem(language, mode, scenario),
      history: history.map(({ role, content }) => ({ role, content: content.trim() })),
      message: message.trim(),
    });
    if (!result) return jsonError("Kalam AI returned an unreadable response. Please try again.", 502, "INVALID_AI_RESPONSE");
    if (mode === "quiz" && result.quiz.length !== 3) {
      return jsonError("Kalam AI could not create a complete quiz. Please try again.", 502, "INCOMPLETE_QUIZ");
    }
    return NextResponse.json(result, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const providerStatus = Number.isInteger(error?.providerStatus) ? error.providerStatus : null;
    const errorName = typeof error?.name === "string" ? error.name.slice(0, 40) : "UnknownError";
    console.error("[Kalam AI] Provider request failed", {
      providerStatus,
      errorName,
      errorMessage: errorName === "Error" ? "Gemini upstream request failed" : "Gemini fetch or response processing failed",
    });
    const code = providerStatus === 401 || providerStatus === 403
      ? "AI_PROVIDER_AUTH_FAILED"
      : providerStatus === 404
        ? "AI_MODEL_NOT_FOUND"
        : providerStatus === 429
          ? "AI_RATE_LIMITED"
          : providerStatus === 400
            ? "AI_REQUEST_REJECTED"
            : errorName === "TimeoutError" || errorName === "AbortError"
              ? "AI_PROVIDER_TIMEOUT"
              : "AI_PROVIDER_UNAVAILABLE";
    if (code === "AI_RATE_LIMITED") {
      const retryAfterSeconds = Number.isInteger(error?.retryAfterSeconds) ? error.retryAfterSeconds : null;
      const message = retryAfterSeconds
        ? `Kalam is receiving too many requests. Please try again in about ${retryAfterSeconds} seconds.`
        : "Kalam has temporarily reached its AI provider limit. Please wait a little before trying again.";
      return NextResponse.json({ error: message, code, retryAfterSeconds }, {
        status: 429,
        headers: { "Cache-Control": "private, no-store", ...(retryAfterSeconds ? { "Retry-After": String(retryAfterSeconds) } : {}) },
      });
    }
    return jsonError("Kalam AI is temporarily unavailable. Please try again shortly.", 502, code);
  }
}
