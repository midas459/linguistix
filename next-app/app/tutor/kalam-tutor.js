"use client";

import { useEffect, useRef, useState } from "react";
import { useLearn } from "../../lib/learn-store";

const MODES = [
  ["breakdown", "Breakdown"],
  ["quiz", "Mini quiz"],
  ["roleplay", "Roleplay"],
];
const SCENARIOS = {
  ar: ["Ordering at a café", "Introducing yourself", "Asking for directions"],
  de: ["Im Restaurant bestellen", "Sich vorstellen", "Nach dem Weg fragen"],
  ja: ["喫茶店で注文", "自己紹介", "道をたずねる"],
  en: ["Ordering food", "Meeting someone", "Asking for directions"],
  es: ["Pedir en un café", "Presentarte", "Pedir indicaciones"],
  fr: ["Commander au café", "Se présenter", "Demander son chemin"],
  pt: ["Pedir num café", "Apresentar-se", "Pedir indicações"],
};

export default function KalamTutor() {
  const { language, lang } = useLearn();
  return <KalamTutorSession key={lang} language={language} lang={lang} />;
}

function KalamTutorSession({ language, lang }) {
  const [mode, setMode] = useState("breakdown");
  const [scenario, setScenario] = useState(SCENARIOS[lang]?.[0] || "Ordering at a café");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [translation, setTranslation] = useState(true);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  async function send(text) {
    const value = text.trim();
    if (!value || busy) return;
    const history = messages.slice(-12).map(({ role, text }) => ({ role, content: text }));
    setMessages((previous) => [...previous, { role: "user", text: value }]);
    setInput("");
    setBusy(true);
    setError("");
    setErrorCode("");
    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang, mode, scenario, message: value, history }),
      });
      const data = await response.json();
      if (!response.ok) { const failure = new Error(data.error || "Kalam AI is unavailable."); failure.code = data.code || ""; throw failure; }
      setMessages((previous) => [...previous, { role: "assistant", text: data.reply, translation: data.translation, quiz: data.quiz || [] }]);
    } catch (err) {
      setError(err.message || "Kalam AI could not answer just now.");
      setErrorCode(err.code || "");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="lf-tutor-layout">
      <section className="lf-card lf-tutor-chat">
        <div className="lf-tutor-toolbar">
          <div className="lf-tutor-modes" aria-label="Tutor mode">
            {MODES.map(([id, label]) => <button key={id} type="button" aria-pressed={mode===id} onClick={()=>setMode(id)}>{label}</button>)}
          </div>
          <label className="lf-translation-toggle"><input type="checkbox" checked={translation} onChange={(event)=>setTranslation(event.target.checked)} /> Show translation</label>
        </div>
        {mode==="roleplay" && <div className="lf-tutor-scenarios">{(SCENARIOS[lang]||[]).map((item)=><button type="button" key={item} aria-pressed={scenario===item} onClick={()=>setScenario(item)}>{item}</button>)}</div>}
        <div className="lf-tutor-messages" aria-live="polite">
          {!messages.length && <div className="lf-tutor-intro"><span className="lf-tutor-avatar">K</span><div><strong>Kalam AI · {language.label}</strong><p>{mode==="quiz"?"Tell me what you have been studying and I will build a three-question mini quiz.":mode==="roleplay"?`Let's practise: ${scenario}. Start whenever you're ready.`:"Paste a word, phrase or sentence and I will break it down with you."}</p><button type="button" onClick={()=>send(({ar:"أَنا طالِب",de:"Der Mann ist Lehrer.",ja:"私は学生です。",en:"I am learning a new language.",es:"Estoy aprendiendo español.",fr:"J'apprends une nouvelle langue.",pt:"Estou a aprender uma língua nova."})[lang])}>Try an example</button></div></div>}
          {messages.map((item,index)=><article className={item.role==="user"?"lf-tutor-message user":"lf-tutor-message"} key={index}><p>{item.text}</p>{item.role==="assistant"&&translation&&item.translation&&<small>{item.translation}</small>}{item.quiz?.length>0&&<ol>{item.quiz.map((q,i)=><li key={i}><strong>{q.question}</strong><details><summary>Reveal answer</summary><p>{q.answer}</p></details></li>)}</ol>}</article>)}
          {busy&&<p className="lf-tutor-status">Kalam is thinking…</p>}
          {error&&<p className="lf-tutor-error" role="alert">{error}{errorCode&&<small className="lf-tutor-error-code">Reference: {errorCode}</small>}</p>}
          <div ref={endRef} />
        </div>
        <form className="lf-tutor-form" onSubmit={(event)=>{event.preventDefault();send(input);}}>
          <textarea rows={2} maxLength={1200} value={input} onChange={(event)=>setInput(event.target.value)} placeholder={mode==="quiz"?"What topic should we practise?":"Write a word, phrase or question…"} onKeyDown={(event)=>{if(event.key==="Enter"&&!event.shiftKey){event.preventDefault();send(input);}}} />
          <button type="submit" disabled={busy||!input.trim()}>Send</button>
        </form>
      </section>
      <aside className="lf-tutor-aside">
        <article className="lf-card"><p className="lf-eyebrow">Your tutor</p><h2>Kalam AI</h2><p>A language-learning companion for explanations, short quizzes and guided roleplay.</p><ul><li>Break down grammar and vocabulary</li><li>Practise realistic conversations</li><li>Check understanding with mini quizzes</li></ul></article>
        <article className="lf-card"><p className="lf-eyebrow">Current language</p><h2>{language.native} · {language.label}</h2><p>Change your learning language from the top bar. The tutor will follow your selection.</p></article>
        <p className="lf-storage-note">AI responses are sent to the configured server-side provider. Do not enter passwords or other sensitive information.</p>
      </aside>
    </div>
  );
}
