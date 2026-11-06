import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import { generateTutorResponse, TutorProviderError } from "../src/lib/tutor-provider-core.server.js";
import { DEFAULT_GEMINI_MODEL, DEFAULT_GROQ_MODEL } from "../src/lib/tutor-providers.js";

const schema = z.object({
  reply: z.string(),
  translation: z.string(),
  quiz: z.array(z.object({ question: z.string(), answer: z.string() })),
});

const providers = (overrides = {}) => ({
  gemini: { apiKey: "test-gemini-key", model: DEFAULT_GEMINI_MODEL },
  groq: { apiKey: "test-groq-key", model: DEFAULT_GROQ_MODEL },
  ...overrides,
});

const geminiResponse = (value) =>
  new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(value) }] } }] }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

const groqResponse = (value) =>
  new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(value) } }] }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

const validResult = { reply: "Hallo!", translation: "Hello!", quiz: [] };

test("uses Gemini generateContent first and keeps its API key out of the URL", async () => {
  let request;
  const result = await generateTutorResponse({
    providers: providers({ groq: { apiKey: "", model: DEFAULT_GROQ_MODEL } }),
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

test("falls back to Groq chat completions when Gemini fails", async () => {
  const requests = [];
  const result = await generateTutorResponse({
    providers: providers(),
    prompt: "Explain this sentence.",
    schema,
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      if (requests.length === 1) return new Response("private provider detail", { status: 429 });
      return groqResponse(validResult);
    },
  });

  assert.deepEqual(result, validResult);
  assert.match(requests[0].url, /models\/gemini-3\.6-flash:generateContent$/);
  assert.equal(requests[1].url, "https://api.groq.com/openai/v1/chat/completions");
  assert.equal(requests[1].options.headers.authorization, "Bearer test-groq-key");
  assert.equal(JSON.parse(requests[1].options.body).response_format.type, "json_object");
});

test("uses Groq when it is the only configured provider", async () => {
  let request;
  const result = await generateTutorResponse({
    providers: providers({ gemini: { apiKey: "", model: DEFAULT_GEMINI_MODEL } }),
    prompt: "Explain this sentence.",
    schema,
    fetchImpl: async (url, options) => {
      request = { url, options };
      return groqResponse(validResult);
    },
  });

  assert.deepEqual(result, validResult);
  assert.equal(request.options.headers.authorization, "Bearer test-groq-key");
});

test("reports an actionable setup error when no provider key is configured", async () => {
  await assert.rejects(
    generateTutorResponse({
      providers: providers({
        gemini: { apiKey: "", model: DEFAULT_GEMINI_MODEL },
        groq: { apiKey: "", model: DEFAULT_GROQ_MODEL },
      }),
      prompt: "Explain this sentence.",
      schema,
      fetchImpl: async () => {
        throw new Error("must not make a request");
      },
    }),
    (error) =>
      error instanceof TutorProviderError &&
      error.code === "not_configured" &&
      error.message.includes("Base44 server secret"),
  );
});

test("sanitizes provider authorization and quota failures", async () => {
  await assert.rejects(
    generateTutorResponse({
      providers: providers({ groq: { apiKey: "", model: DEFAULT_GROQ_MODEL } }),
      prompt: "Explain this sentence.",
      schema,
      fetchImpl: async () => new Response("sensitive provider response", { status: 401 }),
    }),
    (error) =>
      error instanceof TutorProviderError &&
      error.code === "credentials" &&
      !error.message.includes("sensitive provider response") &&
      !error.message.includes("test-gemini-key"),
  );

  await assert.rejects(
    generateTutorResponse({
      providers: providers({ groq: { apiKey: "", model: DEFAULT_GROQ_MODEL } }),
      prompt: "Explain this sentence.",
      schema,
      fetchImpl: async () => new Response("quota detail", { status: 402 }),
    }),
    (error) => error instanceof TutorProviderError && error.code === "quota",
  );
});

test("falls back on malformed provider output and rejects malformed final output", async () => {
  let calls = 0;
  const result = await generateTutorResponse({
    providers: providers(),
    prompt: "Explain this sentence.",
    schema,
    fetchImpl: async () => {
      calls += 1;
      return calls === 1
        ? new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "not JSON" }] } }] }), { status: 200 })
        : groqResponse(validResult);
    },
  });
  assert.deepEqual(result, validResult);

  await assert.rejects(
    generateTutorResponse({
      providers: providers({ groq: { apiKey: "", model: DEFAULT_GROQ_MODEL } }),
      prompt: "Explain this sentence.",
      schema,
      fetchImpl: async () =>
        new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "{}" }] } }] }), { status: 200 }),
    }),
    (error) =>
      error instanceof TutorProviderError &&
      error.code === "malformed_response" &&
      error.message === "Kalam AI is temporarily unavailable. Please try again later.",
  );
});

test("times out without exposing the underlying fetch error", async () => {
  await assert.rejects(
    generateTutorResponse({
      providers: providers({ groq: { apiKey: "", model: DEFAULT_GROQ_MODEL } }),
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
