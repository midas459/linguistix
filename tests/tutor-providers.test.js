import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import { generateTutorResponse, TutorProviderError } from "../src/lib/tutor-provider-core.server.js";
import { DEFAULT_GEMINI_MODEL } from "../src/lib/tutor-providers.js";

const schema = z.object({
  reply: z.string(),
  translation: z.string(),
  quiz: z.array(z.object({ question: z.string(), answer: z.string() })),
});

const geminiResponse = (value) =>
  new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(value) }] } }] }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

const validResult = { reply: "Hallo!", translation: "Hello!", quiz: [] };
const defaultConfig = { apiKey: "test-gemini-key", model: DEFAULT_GEMINI_MODEL };

test("calls Gemini generateContent with the API key in a header, never the URL", async () => {
  let request;
  const result = await generateTutorResponse({
    ...defaultConfig,
    prompt: "Explain this sentence.",
    schema,
    fetchImpl: async (url, options) => {
      request = { url, options };
      return geminiResponse(validResult);
    },
  });

  assert.deepEqual(result, validResult);
  assert.match(request.url, /models\/gemini-3\.6-flash:generateContent$/);
  assert.equal(new URL(request.url).search, "");
  assert.equal(request.options.headers["x-goog-api-key"], "test-gemini-key");
  assert.equal(request.options.method, "POST");
  const body = JSON.parse(request.options.body);
  assert.equal(body.generationConfig.responseMimeType, "application/json");
  assert.equal(body.contents[0].parts[0].text.includes("Return only a JSON object"), true);
});

test("reports an actionable setup error when the Gemini key is missing", async () => {
  await assert.rejects(
    generateTutorResponse({
      apiKey: "",
      prompt: "Explain this sentence.",
      schema,
      fetchImpl: async () => {
        throw new Error("must not make a request");
      },
    }),
    (error) =>
      error instanceof TutorProviderError &&
      error.code === "not_configured" &&
      error.message.includes("GEMINI_API_KEY") &&
      error.message.includes("Base44 server secret"),
  );
});

test("sanitizes authentication, quota and rate-limit failures", async () => {
  for (const [status, code] of [[401, "credentials"], [402, "quota"], [429, "rate_limited"]]) {
    await assert.rejects(
      generateTutorResponse({
        ...defaultConfig,
        prompt: "Explain this sentence.",
        schema,
        fetchImpl: async () => new Response("sensitive provider response", { status }),
      }),
      (error) =>
        error instanceof TutorProviderError &&
        error.code === code &&
        !error.message.includes("sensitive provider response") &&
        !error.message.includes("test-gemini-key"),
    );
  }
});

test("rejects malformed provider JSON without exposing its contents", async () => {
  await assert.rejects(
    generateTutorResponse({
      ...defaultConfig,
      prompt: "Explain this sentence.",
      schema,
      fetchImpl: async () =>
        new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "not JSON" }] } }] }), { status: 200 }),
    }),
    (error) =>
      error instanceof TutorProviderError &&
      error.code === "malformed_response" &&
      error.message === "Kalam AI is temporarily unavailable. Please try again later.",
  );
});

test("rejects structurally invalid tutor output", async () => {
  await assert.rejects(
    generateTutorResponse({
      ...defaultConfig,
      prompt: "Explain this sentence.",
      schema,
      fetchImpl: async () =>
        new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "{}" }] } }] }), { status: 200 }),
    }),
    (error) => error instanceof TutorProviderError && error.code === "malformed_response",
  );
});

test("times out without exposing the underlying fetch error", async () => {
  await assert.rejects(
    generateTutorResponse({
      ...defaultConfig,
      prompt: "Explain this sentence.",
      schema,
      timeoutMs: 5,
      fetchImpl: async (_url, { signal }) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(Object.assign(new Error("secret transport detail"), { name: "AbortError" })));
        }),
    }),
    (error) =>
      error instanceof TutorProviderError &&
      error.code === "timeout" &&
      !error.message.includes("secret transport detail"),
  );
});

test("maps server failures to a safe temporary-unavailable error", async () => {
  await assert.rejects(
    generateTutorResponse({
      ...defaultConfig,
      prompt: "Explain this sentence.",
      schema,
      fetchImpl: async () => new Response("private upstream detail", { status: 503 }),
    }),
    (error) =>
      error instanceof TutorProviderError &&
      error.code === "unavailable" &&
      !error.message.includes("private upstream detail"),
  );
});
