"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FLASHCARDS } from "../../data/cards";
import { useLearn } from "../../lib/learn-store";
import { speakText, stopSpeech } from "../../lib/speech-client";

export default function AlphabetPage() {
  const { language, lang } = useLearn();
  const [selectedId, setSelectedId] = useState("");
  const [status, setStatus] = useState("");
  const cards = useMemo(() => (FLASHCARDS[lang] || []).filter(card => card.category === "letters"), [lang]);
  const active = cards.find(card => card.id === selectedId) || cards[0] || null;
  useEffect(() => () => stopSpeech(), []);

  async function play(value) {
    if (!value) return;
    try {
      setStatus("Generating pronunciation…");
      await speakText(value, lang);
      setStatus("Audio generated. If playback did not start, check your device volume and try again.");
    } catch (error) {
      setStatus(error.message || "Pronunciation audio is unavailable.");
    }
  }

  const title = lang === "ja" ? "Japanese writing systems" : lang === "ar" ? "Arabic alphabet" : language.label + " character set";
  const subtitle = lang === "ja"
    ? "Hiragana and katakana are both included. Study every basic kana in one complete deck."
    : lang === "ar"
      ? "All 28 Arabic letters, including isolated, initial, medial and final forms."
      : "The complete character set is available immediately, including language-specific letters and accents.";

  return (
    <main className="alphabet-page">
      <header className="alphabet-hero">
        <div><p className="eyebrow">LINGUISTIX · SCRIPT STUDIO</p><h1>See every character.<br/><span>Learn the whole system.</span></h1><p>{subtitle}</p></div>
        <div className="alphabet-hero-mark" aria-hidden="true">{lang === "ar" ? "أ" : lang === "ja" ? "あ" : "Aa"}</div>
      </header>
      <div className="alphabet-toolbar">
        <div><strong>{title}</strong><small>Every card is unlocked for browsing and study.</small></div>
        <span className="alphabet-count">{cards.length} characters</span>
      </div>
      {active ? (
        <section className="alphabet-focus">
          <div className="alphabet-focus-main">
            <div className="alphabet-selected" lang={language.speech} dir={language.dir}>{active.front}</div>
            <div><p className="eyebrow">{active.frontSub || "Character"} · {active.translit || ""}</p><h2>{active.meaning}</h2><p>{active.breakdown}</p>{active.example && <p><strong>Example:</strong> {active.example} {active.exampleTranslit ? "· " + active.exampleTranslit : ""}{active.exampleMeaning ? " · " + active.exampleMeaning : ""}</p>}</div>
            <button className="button" type="button" onClick={() => play(active.front)}>▶ Hear character</button>
          </div>
        </section>
      ) : <section className="module-card"><h2>Character deck being prepared</h2><p>This language's character set is not available yet. The course vocabulary remains accessible in Flashcards.</p></section>}
      <section className="alphabet-grid-section">
        <div className="alphabet-section-heading"><div><p className="eyebrow">COMPLETE REFERENCE</p><h2>All {cards.length} characters</h2></div><p>Tap any character to inspect its pronunciation, forms and examples.</p></div>
        <div className={"alphabet-grid " + (lang === "ar" ? "arabic-grid" : lang === "ja" ? "kana-grid" : "german-grid")}>
          {cards.map(card => <button type="button" key={card.id} aria-pressed={active?.id === card.id} onClick={() => { setSelectedId(card.id); setStatus(""); }}>
            <strong lang={language.speech} dir={language.dir}>{card.front}</strong><small>{card.translit || card.frontSub || "Character"}</small>
          </button>)}
        </div>
      </section>
      <p className="alphabet-status" role="status">{status || "All characters are visible now. Nothing is locked behind a daily limit."}</p>
      <div className="actions"><Link className="button secondary" href="/learn">Back to Learn map</Link><Link className="button" href="/flashcards">Study these as flashcards</Link><Link className="button secondary" href="/pronunciation">Pronunciation practice</Link></div>
    </main>
  );
}
