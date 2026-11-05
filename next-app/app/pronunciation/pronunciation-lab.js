"use client";

import { useEffect, useMemo, useState } from "react";
import { useLearn } from "../../lib/learn-store";

const EXAMPLES = {
  ar: [
    { text: "مرحبًا", meaning: "Hello", note: "A friendly everyday greeting" },
    { text: "كيف حالك؟", meaning: "How are you?", note: "A common question" },
    { text: "اسمي ليلى", meaning: "My name is Layla", note: "Introducing yourself" },
  ],
  de: [
    { text: "Guten Morgen", meaning: "Good morning", note: "A polite morning greeting" },
    { text: "Wie geht es dir?", meaning: "How are you?", note: "An informal question" },
    { text: "Ich heiße Alex", meaning: "My name is Alex", note: "Introducing yourself" },
  ],
  ja: [
    { text: "こんにちは", meaning: "Hello", note: "A standard daytime greeting" },
    { text: "お元気ですか？", meaning: "How are you?", note: "A polite question" },
    { text: "わたしはアレックスです", meaning: "I am Alex", note: "A simple introduction" },
  ],
  en: [
    { text: "Good morning", meaning: "Good morning", note: "A friendly morning greeting" },
    { text: "How are you?", meaning: "How are you?", note: "A common question" },
    { text: "My name is Alex", meaning: "My name is Alex", note: "Introducing yourself" },
  ],
  es: [
    { text: "Buenos días", meaning: "Good morning", note: "A polite morning greeting" },
    { text: "¿Cómo estás?", meaning: "How are you?", note: "An informal question" },
    { text: "Me llamo Alex", meaning: "My name is Alex", note: "Introducing yourself" },
  ],
  fr: [
    { text: "Bonjour", meaning: "Hello / good morning", note: "A polite everyday greeting" },
    { text: "Comment ça va ?", meaning: "How are you?", note: "A common informal question" },
    { text: "Je m'appelle Alex", meaning: "My name is Alex", note: "Introducing yourself" },
  ],
  pt: [
    { text: "Bom dia", meaning: "Good morning", note: "A polite morning greeting" },
    { text: "Como estás?", meaning: "How are you?", note: "An informal European Portuguese question" },
    { text: "Chamo-me Alex", meaning: "My name is Alex", note: "Introducing yourself in European Portuguese" },
  ],
};

export default function PronunciationLab() {
  const { language, lang } = useLearn();
  const examples = EXAMPLES[lang] || EXAMPLES.en;
  const [phrase, setPhrase] = useState("مرحبًا");
  const [voices, setVoices] = useState([]);
  const [voiceURI, setVoiceURI] = useState("");
  const [rate, setRate] = useState("0.9");
  const [support, setSupport] = useState("checking");
  const [playback, setPlayback] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let frame = window.requestAnimationFrame(() => {
      const available = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
      setSupport(available ? "available" : "unavailable");
      if (available) setVoices(window.speechSynthesis.getVoices());
    });
    if (!("speechSynthesis" in window)) return () => window.cancelAnimationFrame(frame);

    const refreshVoices = () => setVoices(window.speechSynthesis.getVoices());
    window.speechSynthesis.addEventListener?.("voiceschanged", refreshVoices);
    return () => {
      window.cancelAnimationFrame(frame);
      window.speechSynthesis.removeEventListener?.("voiceschanged", refreshVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  const matchingVoices = useMemo(
    () => voices.filter((voice) => voice.lang.toLowerCase().startsWith(language.speech.slice(0, 2).toLowerCase())),
    [voices, language.speech],
  );

  function stopPlayback() {
    if (support === "available") window.speechSynthesis.cancel();
    setPlayback("idle");
    setMessage("");
  }

  function speak() {
    const value = phrase.trim();
    if (!value) {
      setMessage("Enter some text before playing audio.");
      return;
    }
    if (support !== "available") {
      setMessage("Speech playback is not supported in this browser. Try an up-to-date version of Chrome, Edge, or Safari.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(value);
    utterance.lang = language.speech;
    utterance.rate = Number(rate);
    const selectedVoice = matchingVoices.find((voice) => voice.voiceURI === voiceURI);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.onstart = () => {
      setPlayback("speaking");
      setMessage("");
    };
    utterance.onend = () => setPlayback("idle");
    utterance.onerror = (event) => {
      setPlayback("idle");
      setMessage(event.error === "canceled" || event.error === "interrupted"
        ? "Playback stopped."
        : "The selected voice could not play this phrase. Try another voice or your browser's default voice.");
    };
    setPlayback("loading");
    window.speechSynthesis.speak(utterance);
  }

  function pauseOrResume() {
    if (playback === "paused") {
      window.speechSynthesis.resume();
      setPlayback("speaking");
    } else if (playback === "speaking") {
      window.speechSynthesis.pause();
      setPlayback("paused");
    }
  }

  return (
    <div className="pronunciation-lab">
      <div className="pronunciation-toolbar">
        <div>
          <strong>{language.label}</strong>
          <span className="pronunciation-meta">Voice language: {language.speech}</span>
        </div>
        <span className={support === "unavailable" ? "support-status unavailable" : "support-status"}>
          {support === "checking" ? "Checking browser audio…" : support === "available" ? "Browser speech available" : "Speech unavailable"}
        </span>
      </div>

      <label htmlFor="pronunciation-text">Text to pronounce</label>
      <textarea
        id="pronunciation-text"
        rows={4}
        maxLength={500}
        value={phrase}
        onChange={(event) => { setPhrase(event.target.value); setMessage(""); }}
        placeholder={`Type a phrase in ${language.label}…`}
        lang={language.speech}
        dir={language.dir}
        aria-describedby="pronunciation-help"
      />
      <p id="pronunciation-help" className="pronunciation-meta">Up to 500 characters. Speech is generated by your browser; no recording is made or uploaded.</p>

      <div className="pronunciation-controls">
        <div className="pronunciation-field">
          <label htmlFor="pronunciation-voice">Voice</label>
          <select id="pronunciation-voice" value={voiceURI} onChange={(event) => setVoiceURI(event.target.value)} disabled={!matchingVoices.length}>
            <option value="">{matchingVoices.length ? "Browser default voice" : "No matching voice installed"}</option>
            {matchingVoices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>
            ))}
          </select>
          <span className="pronunciation-meta">{matchingVoices.length ? `${matchingVoices.length} matching voice(s) found` : "Your device may need a language voice pack."}</span>
        </div>
        <div className="pronunciation-field">
          <label htmlFor="pronunciation-rate">Speaking speed: {Number(rate).toFixed(1)}×</label>
          <input id="pronunciation-rate" type="range" min="0.6" max="1.2" step="0.1" value={rate} onChange={(event) => setRate(event.target.value)} />
          <span className="pronunciation-meta">Slower can make unfamiliar sounds easier to hear.</span>
        </div>
      </div>

      <div className="actions pronunciation-actions">
        <button className="button" type="button" onClick={speak} disabled={support !== "available" || !phrase.trim() || playback === "speaking" || playback === "loading"}>▶ Play pronunciation</button>
        <button className="button secondary" type="button" onClick={pauseOrResume} disabled={playback !== "speaking" && playback !== "paused"}>{playback === "paused" ? "Resume" : "Pause"}</button>
        <button className="button secondary" type="button" onClick={stopPlayback} disabled={playback === "idle"}>Stop</button>
      </div>
      <p className="pronunciation-status" role="status" aria-live="polite">
        {message || (playback === "speaking" ? "Playing pronunciation…" : playback === "paused" ? "Playback paused." : playback === "loading" ? "Starting audio…" : "Ready when you are.")}
      </p>

      <section className="pronunciation-examples" aria-labelledby="pronunciation-examples-title">
        <h2 id="pronunciation-examples-title">Try a sample phrase</h2>
        <p>Choose a phrase to load it into the practice box, then press play.</p>
        <div className="pronunciation-example-list">
          {examples.map((example) => (
            <button
              className="pronunciation-example"
              key={example.text}
              type="button"
              onClick={() => { stopPlayback(); setPhrase(example.text); }}
              aria-label={`Practise ${example.text}: ${example.meaning}`}
            >
              <strong lang={language.speech} dir={language.dir}>{example.text}</strong>
              <span>{example.meaning}</span>
              <small>{example.note}</small>
            </button>
          ))}
        </div>
      </section>
      <p className="pronunciation-disclaimer">Voice quality and availability depend on your operating system, browser and installed speech voices. This tool demonstrates listening and playback; it does not record your voice, assess your accent, or assign an accuracy score.</p>
    </div>
  );
}
