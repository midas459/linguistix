let activeAudio = null;
let activeUtterance = null;
let activeUrl = null;

const SPEECH_LOCALES = {
  ar: "ar-SA", de: "de-DE", ja: "ja-JP", en: "en-US",
  es: "es-ES", fr: "fr-FR", pt: "pt-PT",
};

function cleanup() {
  if (activeUrl) URL.revokeObjectURL(activeUrl);
  activeUrl = null;
  activeAudio = null;
  activeUtterance = null;
}

export function stopSpeech() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  cleanup();
}

export function pauseSpeech() {
  if (activeAudio) activeAudio.pause();
  else if (typeof window !== "undefined") window.speechSynthesis?.pause();
}

export async function resumeSpeech() {
  if (activeAudio) await activeAudio.play();
  else if (typeof window !== "undefined") window.speechSynthesis?.resume();
}

function speakWithDeviceVoice(text, language) {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    throw new Error("Audio is unavailable: this browser has no built-in speech engine.");
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = SPEECH_LOCALES[language] || "en-US";
  utterance.rate = 0.88;
  const voices = window.speechSynthesis.getVoices();
  const prefix = utterance.lang.toLowerCase().split("-")[0];
  const voice = voices.find(item => item.lang.toLowerCase() === utterance.lang.toLowerCase())
    || voices.find(item => item.lang.toLowerCase().startsWith(prefix));
  if (voice) utterance.voice = voice;
  activeUtterance = utterance;
  utterance.addEventListener("end", cleanup, { once: true });
  utterance.addEventListener("error", cleanup, { once: true });
  window.speechSynthesis.speak(utterance);
  return utterance;
}

export async function speakText(text, language) {
  stopSpeech();
  let providerError;
  try {
    const response = await fetch("/api/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Server pronunciation is temporarily unavailable.");
    }
    const blob = await response.blob();
    if (!blob.size || !blob.type.includes("audio")) throw new Error("The pronunciation service returned an invalid audio file.");
    activeUrl = URL.createObjectURL(blob);
    activeAudio = new Audio(activeUrl);
    activeAudio.addEventListener("ended", cleanup, { once: true });
    activeAudio.addEventListener("error", cleanup, { once: true });
    try {
      await activeAudio.play();
      return activeAudio;
    } catch (error) {
      cleanup();
      providerError = error;
    }
  } catch (error) {
    providerError = error;
  }

  try {
    return speakWithDeviceVoice(text, language);
  } catch (fallbackError) {
    throw new Error(providerError?.message || fallbackError.message || "Pronunciation audio could not be played.");
  }
}
