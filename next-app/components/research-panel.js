"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FLASHCARDS } from "../data/cards";
import { LANGUAGES } from "../data/curriculum";

export default function ResearchPanel({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    inputRef.current?.focus();
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    if (!q) return [];
    return LANGUAGES.flatMap((language) => (FLASHCARDS[language.code] || [])
      .filter((card) => [card.front, card.frontSub, card.translit, card.meaning, card.breakdown, card.example, card.exampleMeaning]
        .filter(Boolean).join(" ").toLocaleLowerCase().includes(q))
      .map((card) => ({ card, language })))
      .filter((result) => scope === "all" || result.language.code === scope)
      .slice(0, 30);
  }, [query, scope]);

  function speak(text, locale) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    window.speechSynthesis.speak(utterance);
  }

  if (!open) return null;
  return (
    <div className="lf-research-backdrop" role="presentation" onMouseDown={(event)=>{if(event.target===event.currentTarget)onClose();}}>
      <section className="lf-research-dialog" role="dialog" aria-modal="true" aria-labelledby="lf-research-title">
        <header><div><p className="lf-eyebrow">Linguistix reference library</p><h2 id="lf-research-title">Lugha Research</h2><p>Search words, roots, grammar notes and examples across every course.</p></div><button type="button" onClick={onClose} aria-label="Close research">×</button></header>
        <input ref={inputRef} value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Try ك-ت-ب, umlaut, の or please…" aria-label="Search learning content" />
        <div className="lf-research-filters"><button type="button" aria-pressed={scope==="all"} onClick={()=>setScope("all")}>All languages</button>{LANGUAGES.map((language)=><button type="button" key={language.code} aria-pressed={scope===language.code} onClick={()=>setScope(language.code)}>{language.emblem} {language.short}</button>)}</div>
        <div className="lf-research-results">
          {!query.trim()&&<p className="lf-empty">Enter a word or concept to search the course reference cards.</p>}
          {query.trim()&&results.length===0&&<p className="lf-empty">No matching cards found. Try a shorter search term.</p>}
          {results.map(({card,language})=><article className="lf-research-result" key={language.code+"-"+card.id}>
            <div><span className="lf-research-language">{language.emblem} {language.label}</span><h3>{card.front}</h3>{card.translit&&<small>{card.translit}</small>}<p><strong>{card.meaning}</strong></p><p>{card.breakdown}</p>{card.example&&<p className="lf-research-example">{card.example} — {card.exampleMeaning}</p>}</div>
            <button type="button" onClick={()=>speak(card.front,language.speech)} aria-label={`Play pronunciation for ${card.front}`}>▶</button>
          </article>)}
        </div>
      </section>
    </div>
  );
}
