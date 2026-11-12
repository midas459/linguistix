let activeAudio = null;
let activeUrl = null;

function cleanup() {
  if (activeUrl) URL.revokeObjectURL(activeUrl);
  activeUrl = null;
  activeAudio = null;
}

export function stopSpeech() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  }
  cleanup();
}

export function pauseSpeech() {
  activeAudio?.pause();
}

export async function resumeSpeech() {
  if (activeAudio) await activeAudio.play();
}

export async function speakText(text, language) {
  stopSpeech();
  const response = await fetch("/api/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Pronunciation audio is temporarily unavailable.");
  }
  const blob = await response.blob();
  if (!blob.size || !blob.type.includes("audio")) {
    throw new Error("The pronunciation service returned an invalid audio file.");
  }
  activeUrl = URL.createObjectURL(blob);
  activeAudio = new Audio(activeUrl);
  activeAudio.addEventListener("ended", cleanup, { once: true });
  activeAudio.addEventListener("error", cleanup, { once: true });
  try {
    await activeAudio.play();
  } catch (error) {
    cleanup();
    throw new Error("Your browser blocked audio playback. Click Play again to allow it.");
  }
}
