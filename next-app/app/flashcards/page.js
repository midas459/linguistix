"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CARD_CATEGORIES, FLASHCARDS } from "../../data/cards";
import { useLearn } from "../../lib/learn-store";

const RATINGS = [["again", "Again"], ["hard", "Hard"], ["good", "Good"], ["easy", "Easy"]];

export default function FlashcardsPage() {
  const { language, lang, srs, rateCard } = useLearn();
  const [category, setCategory] = useState("all");
  const [flipped, setFlipped] = useState(false);
  const [now, setNow] = useState(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setNow(Date.now()));
    return () => window.cancelAnimationFrame(frame);
  }, [lang, srs]);

  const deck = FLASHCARDS[lang] || [];
  const due = deck.filter(card => {
    const review = srs[card.id];
    return (!review || (now !== null && new Date(review.due).getTime() <= now))
      && (category === "all" || card.category === category);
  });
  const card = due[0];

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
        <p>Review vocabulary and phrases. Your ratings update the existing local spaced-repetition schedule.</p>
        <label htmlFor="category">Deck category</label>
        <select id="category" value={category} onChange={event => { setCategory(event.target.value); setFlipped(false); }}>
          <option value="all">All categories</option>
          {CARD_CATEGORIES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
        <p>{now === null ? "Loading review schedule…" : `${due.length} cards due in this category`}</p>
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
            {flipped && <div className="choice-row">
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
