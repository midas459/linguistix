import { DEFAULT_GEMINI_MODEL } from "./tutor-providers.js";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/";
const DEFAULT_TIMEOUT_MS = 15_000;

const responseInstructions =
  'Return only a JSON object with exactly these fields: "reply" (string), "translation" (string), and "quiz" (array of objects with "question" and "answer" strings). Use an empty translation or quiz array when not needed. Do not wrap the JSON in markdown.';

const geminiResponseSchema = {
  type: "OBJECT",
  properties: {
    reply: { type: "STRING" },
    translation: { type: "STRING" },
    quiz: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" },
          answer: { type: "STRING" },
        },
        required: ["question", "answer"],
      },
    },
  },
  required: ["reply", "translation", "quiz"],
};

const errorMessages = {
  not_configured: "Kalam AI is not configured. Add GEMINI_API_KEY as a Base44 server secret.",
  unavailable: "Kalam AI is temporarily unavailable. Please try again later.",
};

export class TutorProviderError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "TutorProviderError";
    this.code = code;
  }
}

const providerError = (code) => new TutorProviderError(code, errorMessages.unavailable);

async function readGeminiText(response, signal) {
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw providerError("credentials");
    if (response.status === 402) throw providerError("quota");
    if (response.status === 408) throw providerError("timeout");
    if (response.status === 429) throw providerError("rate_limited");
    if (response.status >= 500) throw providerError("unavailable");
    throw providerError("request_rejected");
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    if (signal.aborted) throw providerError("timeout");
    throw providerError("malformed_response");
  }

  const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("");
  if (typeof text !== "string" || !text.trim()) throw providerError("malformed_response");
  return text;
}

export async function generateTutorResponse({
  apiKey,
  model = DEFAULT_GEMINI_MODEL,
  prompt,
  schema,
  fetchImpl = fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}) {
  if (typeof apiKey !== "string" || !apiKey.trim()) {
    throw new TutorProviderError("not_configured", errorMessages.not_configured);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(
      `${GEMINI_URL}${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": apiKey.trim(),
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `${prompt}\n\n${responseInstructions}` }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: geminiResponseSchema,
          },
        }),
        signal: controller.signal,
      },
    );

    const text = await readGeminiText(response, controller.signal);
    let value;
    try {
      value = JSON.parse(text);
    } catch {
      throw providerError("malformed_response");
    }

    const parsed = schema.safeParse(value);
    if (!parsed.success) throw providerError("malformed_response");
    return parsed.data;
  } catch (error) {
    if (error instanceof TutorProviderError) throw error;
    throw providerError(controller.signal.aborted || error?.name === "AbortError" ? "timeout" : "network");
  } finally {
    clearTimeout(timer);
  }
}
