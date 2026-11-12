"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CARD_CATEGORIES, FLASHCARDS } from "../../data/cards";
import { useLearn } from "../../lib/learn-store";
import { speakText, stopSpeech } from "../../lib/speech-client";
import FeatureIcon from "../../components/feature-icon";

const RATINGS = [["again", "Again"], ["hard", "Hard"], ["good", "Good"], ["easy", "Easy"]];

export default function FlashcardsPage() {
  const { language, lang, srs, rateCard } = useLearn();
  const [category, setCategory] = useState("letters");
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState("browse");
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(null);
  const [audioStatus, setAudioStatus] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setNow(Date.now()));
    return () => window.cancelAnimationFrame(frame);
  }, [lang, srs]);

  const deck = FLASHCARDS[lang] || [];
  const allCards = deck.filter(card => category === "all" || card.category === category);
  const due = allCards.filter(card => {
    const review = srs[card.id];
    return !review || (now !== null && new Date(review.due).getTime() <= now);
  });
  const cards = mode === "browse" ? allCards : due;
  const activeIndex = Math.min(index, Math.max(0, cards.length - 1));
  const card = cards[activeIndex] || null;

  function rate(rating) {
    if (!card) return;
    rateCard(card.id, rating);
    setFlipped(false);
  }

  return (
    <main>
      <section className="panel">
        <div className="eyebrow">{language.label} · Spaced repetition</div>
        <h1>Flashcards</h1>
        <div className="actions"><Link className="button secondary" href="/alphabet">See the complete alphabet →</Link></div>
        <p>Browse every card in the deck whenever you want, or switch to due reviews for spaced repetition. Your ratings update the local review schedule.</p>
        <div className="choice-row" role="group" aria-label="Flashcard mode">
          <button className="choice-button" type="button" aria-pressed={mode === "browse"} onClick={() => { setMode("browse"); setIndex(0); setFlipped(false); }}>Browse all cards ({allCards.length})</button>
          <button className="choice-button" type="button" aria-pressed={mode === "review"} onClick={() => { setMode("review"); setIndex(0); setFlipped(false); }}>Due reviews ({due.length})</button>
        </div>
        <label htmlFor="category">Deck category</label>
        <select id="category" value={category} onChange={event => { setCategory(event.target.value); setIndex(0); setFlipped(false); }}>
          <option value="all">All categories</option>
          {CARD_CATEGORIES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
        <p>{now === null ? "Loading review schedule…" : mode === "browse" ? `${allCards.length} cards available · card ${cards.length ? activeIndex + 1 : 0} of ${cards.length}` : `${due.length} cards due · card ${cards.length ? activeIndex + 1 : 0} of ${cards.length}`}</p>
        {card ? (
          <div className="flashcard">
            <small>{CARD_CATEGORIES.find(item => item.id === card.category)?.label || "Vocabulary"}</small>
            <div className="flashcard-face">
              <h2>{flipped ? card.meaning : card.front}</h2>
              {flipped && <>
                {card.translit && <p>{card.translit}</p>}
                {card.breakdown && <p>{card.breakdown}</p>}
                {card.example && <p><strong>Example:</strong> {card.example}</p>}
                {card.exampleMeaning && <p>{card.exampleMeaning}</p>}
              </>}
            </div>
            <button className="button secondary" type="button" onClick={() => setFlipped(value => !value)}>
              {flipped ? "Show prompt" : "Reveal answer"}
            </button>
            <button className="button secondary" type="button" onClick={async () => { try { setAudioStatus("Generating pronunciation…"); await speakText(card.front, lang); setAudioStatus("Playing pronunciation."); } catch (error) { setAudioStatus(error.message); } }}><FeatureIcon name="audio" size={16} /> Hear this card</button>
            {audioStatus && <p role="status">{audioStatus}</p>}
            {flipped && mode === "review" && <div className="choice-row">
              {RATINGS.map(([value, label]) => (
                <button className="choice-button" key={value} type="button" onClick={() => rate(value)}>{label}</button>
              ))}
            </div>}
          </div>
        ) : now !== null ? (
          <div className="module-card">
            <h2>All caught up</h2>
            <p>No cards are due in this category right now. Choose another category or come back when your next reviews are due.</p>
          </div>
        ) : null}
        <div className="actions">
          <Link className="button secondary" href="/dashboard">Dashboard</Link>
          <Link className="button" href="/learn">Courses</Link>
        </div>
      </section>
    </main>
  );
}
