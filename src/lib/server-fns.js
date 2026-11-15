import { chat } from "@tanstack/ai";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateTutorReply } from "@/lib/ai.server";
import { requireUser } from "@/lib/auth-middleware";

export const getServerInfo = createServerFn({ method: "GET" }).handler(async () => ({
  renderedAt: new Date().toISOString(),
}));

const LANG_GUIDE = {
  ar: "Modern Standard Arabic. Always show the Arabic script, then a transliteration, then the English. Explain roots (e.g. ك-ت-ب), harakat, and why a nominal sentence needs no 'to be'.",
  de: "German. Show the noun with its article and gender (der/die/das, colour it in words), name the case in use, and give separable or irregular verb quirks when relevant.",
  ja: "Japanese. Show kana/kanji with romaji in brackets, name the particles in play, and give both the plain and the ます form of any verb.",
};

const MODE_GUIDE = {
  breakdown:
    "Mode: grammatical breakdown. Take the learner's sentence or question apart word by word, giving the role of each word, then rebuild it. Be concise: max 160 words.",
  quiz:
    "Mode: quiz generator. Create exactly 3 short questions targeting the learner's likely weak points at their level. Put the questions in the quiz array with a short answer each, and use the reply to say what the mini-quiz covers. Never put the answers in the reply.",
  roleplay:
    "Mode: roleplay. Stay in character inside the scenario, reply first in the target language (max 3 short sentences), then give the English meaning in the translation field. Gently correct one mistake at most, inside the reply after the in-character lines.",
};

const tutorResponseSchema = z.object({
  reply: z.string(),
  translation: z.string(),
  quiz: z.array(z.object({ question: z.string(), answer: z.string() })),
});

export const askTutor = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      language: z.enum(["ar", "de", "ja"]),
      mode: z.enum(["breakdown", "quiz", "roleplay"]),
      scenario: z.string().max(120).optional(),
      message: z.string().min(1).max(1200),
      history: z
        .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
        .max(12)
        .optional(),
    }),
  )
  .handler(async ({ data }) => {
    const transcript = (data.history || [])
      .map((turn) => `${turn.role === "user" ? "Learner" : "Tutor"}: ${turn.content}`)
      .join("\n");

    const prompt = [
      "You are Kalam AI, a patient language tutor inside a learning app called Lisan.",
      `Target language: ${LANG_GUIDE[data.language]}`,
      MODE_GUIDE[data.mode],
      data.scenario ? `Scenario: ${data.scenario}.` : "",
      "Address the learner directly, keep formatting plain (no markdown headings), and stay encouraging without flattery.",
      transcript ? `Conversation so far:\n${transcript}` : "",
      `Learner: ${data.message}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const result = await generateTutorReply(prompt, tutorResponseSchema);

    return {
      reply: result.reply.slice(0, 4000),
      translation: result.translation.slice(0, 1200),
      quiz: result.quiz.slice(0, 3).map(({ question, answer }) => ({
        question: question.slice(0, 600),
        answer: answer.slice(0, 600),
      })),
    };
  });