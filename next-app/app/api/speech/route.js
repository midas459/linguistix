import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

const LANGUAGES = { ar: "ar-XA", de: "de-DE", ja: "ja-JP", en: "en-US", es: "es-ES", fr: "fr-FR", pt: "pt-BR" };

function pcmToWav(base64) {
  const binary = atob(base64);
  const pcm = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) pcm[i] = binary.charCodeAt(i);
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const write = (offset, value) => { for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i)); };
  write(0, "RIFF"); view.setUint32(4, 36 + pcm.length, true); write(8, "WAVE"); write(12, "fmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, 24000, true); view.setUint32(28, 48000, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  write(36, "data"); view.setUint32(40, pcm.length, true);
  const wav = new Uint8Array(44 + pcm.length); wav.set(new Uint8Array(header), 0); wav.set(pcm, 44); return wav;
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: "Sign in to use pronunciation audio." }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Authentication could not be verified." }, { status: 503 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { text, language } = body || {};
  if (!Object.hasOwn(LANGUAGES, language) || typeof text !== "string" || !text.trim() || text.length > 500) {
    return NextResponse.json({ error: "Choose a supported language and enter up to 500 characters." }, { status: 400 });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Pronunciation audio is not configured on the Linguistix server." }, { status: 503 });

  try {
    const models = process.env.GEMINI_TTS_MODEL
      ? [process.env.GEMINI_TTS_MODEL]
      : ["gemini-3.1-flash-tts-preview", "gemini-2.5-flash-preview-tts"];
    const requestBody = JSON.stringify({
      contents: [{ parts: [{ text: "Read this text exactly as written. Use natural, clear pronunciation in the requested language. Do not translate or add words: " + text.trim() }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          languageCode: LANGUAGES[language],
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
        },
      },
    });
    let response;
    for (const model of models) {
      response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent", {
        method: "POST",
        headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
        body: requestBody,
        signal: AbortSignal.timeout(30000),
      });
      if (response.ok || (response.status !== 400 && response.status !== 404)) break;
    }
    if (!response || !response.ok) {
      console.error("[Linguistix speech] Gemini TTS failed", { status: response?.status || 0 });
      return NextResponse.json({ error: response?.status === 429 ? "Pronunciation is busy. Please try again in a moment." : "The pronunciation service could not generate audio right now." }, { status: 502 });
    }
    const payload = await response.json();
    const audio = payload?.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data)?.inlineData;
    if (!audio?.data) return NextResponse.json({ error: "The pronunciation service returned no audio." }, { status: 502 });
    if (audio.mimeType?.includes("wav")) {
      const bytes = Uint8Array.from(atob(audio.data), (char) => char.charCodeAt(0));
      return new Response(bytes, { headers: { "Content-Type": "audio/wav", "Cache-Control": "private, no-store" } });
    }
    return new Response(pcmToWav(audio.data), { headers: { "Content-Type": "audio/wav", "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[Linguistix speech] Audio generation failed", { name: error?.name || "UnknownError" });
    return NextResponse.json({ error: "Pronunciation audio timed out or is temporarily unavailable." }, { status: 502 });
  }
}
