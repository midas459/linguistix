const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
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
  not_configured: "Kalam AI is not configured. Add a Gemini or Groq API key as a Base44 server secret.",
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

async function requestProvider({ provider, model, apiKey, prompt, fetchImpl, timeoutMs }) {
  const { url, options } = providerRequest(provider, model, apiKey, prompt);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, { ...options, signal: controller.signal });
    const text = await readProviderText(provider, response, controller.signal);
    let value;
    try {
      value = JSON.parse(text);
    } catch {
      throw providerError("malformed_response");
    }

    return value;
  } catch (error) {
    if (error instanceof TutorProviderError) throw error;
    throw providerError(controller.signal.aborted || error?.name === "AbortError" ? "timeout" : "network");
  } finally {
    clearTimeout(timer);
  }
}

function providerRequest(provider, model, apiKey, prompt) {
  const outputPrompt = `${prompt}\n\n${responseInstructions}`;

  if (provider === "gemini") {
    return {
      url: `${GEMINI_URL}${encodeURIComponent(model)}:generateContent`,
      options: {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: outputPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: geminiResponseSchema,
          },
        }),
      },
    };
  }

  return {
    url: GROQ_URL,
    options: {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: outputPrompt }],
        response_format: { type: "json_object" },
      }),
    },
  };
}

async function readProviderText(provider, response, signal) {
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw providerError("credentials");
    if (response.status === 408) throw providerError("timeout");
    if (response.status === 402) throw providerError("quota");
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

  const text =
    provider === "gemini"
      ? payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("")
      : payload?.choices?.[0]?.message?.content;

  if (typeof text !== "string" || !text.trim()) throw providerError("malformed_response");
  return text;
}

export async function generateTutorResponse({
  providers,
  prompt,
  schema,
  fetchImpl = fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}) {
  const configured = ["gemini", "groq"].filter(
    (provider) => typeof providers?.[provider]?.apiKey === "string" && providers[provider].apiKey.trim(),
  );
  if (!configured.length) {
    throw new TutorProviderError("not_configured", errorMessages.not_configured);
  }

  let lastError;
  for (const provider of configured) {
    try {
      const response = await requestProvider({
        provider,
        model: providers[provider].model,
        apiKey: providers[provider].apiKey.trim(),
        prompt,
        fetchImpl,
        timeoutMs,
      });
      const parsed = schema.safeParse(response);
      if (!parsed.success) throw providerError("malformed_response");
      return parsed.data;
    } catch (error) {
      lastError = error;
    }
  }

  const code = lastError instanceof TutorProviderError ? lastError.code : "unavailable";
  throw new TutorProviderError(code, errorMessages.unavailable);
}
