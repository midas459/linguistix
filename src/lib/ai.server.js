import { secrets } from "base44:runtime";
import { DEFAULT_GEMINI_MODEL, DEFAULT_GROQ_MODEL } from "@/lib/tutor-providers";
import { generateTutorResponse, TutorProviderError } from "@/lib/tutor-provider-core.server";

export const generateTutorReply = async (prompt, schema) => {
  try {
    return await generateTutorResponse({
      prompt,
      schema,
      providers: {
        gemini: {
          apiKey: secrets.get("GEMINI_API_KEY"),
          model: secrets.get("GEMINI_MODEL") || DEFAULT_GEMINI_MODEL,
        },
        groq: {
          apiKey: secrets.get("GROQ_API_KEY"),
          model: secrets.get("GROQ_MODEL") || DEFAULT_GROQ_MODEL,
        },
      },
    });
  } catch (error) {
    if (error instanceof TutorProviderError) throw error;
    throw new TutorProviderError("unavailable", "Kalam AI is temporarily unavailable. Please try again later.");
  }
};
