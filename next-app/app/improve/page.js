"use client";
import Link from "next/link";
import { useLearn } from "../../lib/learn-store";
import { FLASHCARDS } from "../../data/cards";
import FeatureIcon from "../../components/feature-icon";

const ROUTINES = [
  { title:"Speak with confidence",detail:"Read a short exchange aloud, then practise pronunciation.",href:"/pronunciation",tag:"SPEAKING",icon:"microphone",tone:"speak" },
  { title:"Build active vocabulary",detail:"Review a spaced-repetition deck and strengthen recall.",href:"/flashcards",tag:"VOCABULARY",icon:"vocabulary",tone:"vocab" },
  { title:"Understand the structure",detail:"Work through guided lessons and grammar in context.",href:"/learn",tag:"GRAMMAR",icon:"grammar",tone:"grammar" },
  { title:"Practise with Kalam",detail:"Try a guided roleplay, ask for corrections and keep talking.",href:"/tutor",tag:"CONVERSATION",icon:"conversation",tone:"talk" },
];

export default function ImprovementPage() {
  const { language, lang, progress } = useLearn();
  const deck = FLASHCARDS[lang] || [];
  const examples = deck.filter(card => card.example).slice(0,4);
  return <main className="li-page">
    <header className="li-hero">
      <div className="li-hero-copy">
        <p className="li-kicker">THE PRACTICE ATELIER · {language.label.toUpperCase()}</p>
        <h1>Language is built<br/><em>in the doing.</em></h1>
        <p className="li-lede">A focused space to turn what you recognise into what you can actually say, understand and remember.</p>
        <div className="li-hero-actions"><Link className="li-primary" href="/tutor">Start a conversation <FeatureIcon name="arrowUpRight" size={16} /></Link><Link className="li-text-link" href="/flashcards">Review flashcards →</Link></div>
      </div>
      <div className="li-hero-art" aria-label="Language practice statistics"><span className="li-orbit li-orbit-one"/><span className="li-orbit li-orbit-two"/><span className="li-roman">λόγος</span><div className="li-art-stamp"><span>YOUR CURRENT PRACTICE</span><strong>{String(progress.lessons.length).padStart(2,"0")}</strong><small>LESSONS COMPLETED</small></div><span className="li-art-star"><FeatureIcon name="sparkles" size={25} /></span></div>
    </header>
    <section className="li-routines">
      <div className="li-section-head"><div><p className="li-kicker">FOUR WAYS TO IMPROVE</p><h2>Train every skill.</h2></div><span className="li-section-note">A little, every day.</span></div>
      <div className="li-routine-grid">{ROUTINES.map((item,index)=><Link href={item.href} className={`li-routine li-${item.tone}`} key={item.title}><span className="li-routine-index">0{index+1}</span><span className="li-routine-icon"><FeatureIcon name={item.icon} size={27} strokeWidth={1.7} /></span><span className="li-routine-tag">{item.tag}</span><strong>{item.title}</strong><p>{item.detail}</p><span className="li-routine-arrow">↗</span></Link>)}</div>
    </section>
    <section className="li-dialogue-section">
      <div className="li-dialogue-heading"><div><p className="li-kicker">LISTEN · READ · REPLY</p><h2>Conversation studies.</h2><p>Short, practical examples drawn from your {language.label} learning deck.</p></div><Link href="/tutor">Practise with Kalam ↗</Link></div>
      {examples.length ? <div className="li-dialogue-grid">{examples.map((card,index)=><article className="li-dialogue" key={card.id}><div className="li-dialogue-top"><span>FIELD NOTE 0{index+1}</span><span>{card.category}</span></div><div className="li-bubble li-bubble-one"><small>YOU</small><strong dir={language.dir}>{card.front}</strong>{card.translit&&<span>{card.translit}</span>}</div><div className="li-bubble li-bubble-two"><small>THE RESPONSE</small><strong dir={language.dir}>{card.example}</strong><span>{card.exampleMeaning}</span></div><div className="li-dialogue-foot"><span>{card.meaning}</span><Link href="/flashcards">Study this phrase →</Link></div></article>)}</div> : <div className="li-empty">Conversation examples for this language are being prepared. Start with a guided lesson or ask Kalam to build a dialogue.</div>}
    </section>
    <section className="li-bottom"><div><p className="li-kicker">THE DAILY DISCIPLINE</p><h2>Fluency is a practice,<br/><em>not a finish line.</em></h2></div><div className="li-bottom-actions"><Link href="/flashcards">Open your flashcard deck ↗</Link><Link href="/pronunciation">Enter pronunciation lab ↗</Link><Link href="/learn">Continue your learning path ↗</Link></div></section>
  </main>;
}
