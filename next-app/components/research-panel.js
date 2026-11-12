"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FLASHCARDS } from "../data/cards";
import { LANGUAGES } from "../data/curriculum";
import { useLearn } from "../lib/learn-store";
import { speakText } from "../lib/speech-client";

const QUICK_LOOKUPS = [
  { en:"I understand", values:{ar:["أَفْهَمُ","afham","I understand"],de:["Ich verstehe","ikh fershtay-uh","I understand"],ja:["わかります","wakarimasu","I understand"],es:["Entiendo","en-tee-en-doh","I understand"],fr:["Je comprends","zhuh kohm-prahn","I understand"],pt:["Compreendo","kom-preh-en-doo","I understand"]}},
  { en:"I don't understand", values:{ar:["لا أَفْهَمُ","la afham","I do not understand"],de:["Ich verstehe nicht","ikh fershtay-uh nikht","I do not understand"],ja:["わかりません","wakarimasen","I do not understand"],es:["No entiendo","noh en-tee-en-doh","I do not understand"],fr:["Je ne comprends pas","zhuh nuh kohm-prahn pah","I do not understand"],pt:["Não compreendo","now kom-preh-en-doo","I do not understand"]}},
  { en:"Hello", values:{ar:["مَرْحَبًا","marhaban","Hello"],de:["Hallo","hah-loh","Hello"],ja:["こんにちは","konnichiwa","Hello"],es:["Hola","oh-lah","Hello"],fr:["Bonjour","bohn-zhoor","Hello"],pt:["Olá","oh-lah","Hello"]}},
  { en:"Thank you", values:{ar:["شُكْرًا","shukran","Thank you"],de:["Danke","dahn-kuh","Thank you"],ja:["ありがとう","arigatō","Thank you"],es:["Gracias","grah-see-ahs","Thank you"],fr:["Merci","mehr-see","Thank you"],pt:["Obrigado / Obrigada","oh-bree-gah-doo / dah","Thank you"]}},
  { en:"Please", values:{ar:["مِنْ فَضْلِكَ","min faḍlik","Please"],de:["Bitte","bit-tuh","Please"],ja:["お願いします","onegaishimasu","Please"],es:["Por favor","por fah-vor","Please"],fr:["S'il vous plaît","seel voo pleh","Please"],pt:["Por favor","por fah-vor","Please"]}},
  { en:"Where is the bathroom?", values:{ar:["أَيْنَ الحَمَّام؟","ayna al-hammām?","Where is the bathroom?"],de:["Wo ist die Toilette?","voh ist dee toy-let-uh?","Where is the bathroom?"],ja:["トイレはどこですか？","toire wa doko desu ka?","Where is the bathroom?"],es:["¿Dónde está el baño?","dohn-deh es-tah el bah-nyoh?","Where is the bathroom?"],fr:["Où sont les toilettes ?","oo sohn lay twah-let?","Where is the bathroom?"],pt:["Onde fica a casa de banho?","ohn-duh fee-kah ah kah-zah duh bah-nyoo?","Where is the bathroom?"]}}
];

function parseLookup(input) {
  let value = input.trim();
  let detected = "";
  const languageNames = { arabic: "ar", german: "de", japanese: "ja", english: "en", spanish: "es", french: "fr", portuguese: "pt" };
  value = value.replace(/^how\s+do\s+i\s+say\s+/i, "").replace(/^how\s+to\s+say\s+/i, "").replace(/^translate\s+/i, "");
  value = value.replace(/\s+in\s+(arabic|german|japanese|english|spanish|french|portuguese)\s*\\??$/i, (_, name) => { detected = languageNames[name.toLowerCase()]; return ""; });
  value = value.replace(/[?!.]+$/g, "").trim();
  return { value, detected };
}

export default function ResearchPanel({ open, onClose }) {
  const { lang } = useLearn();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  const [lookup, setLookup] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const parsedQuery = parseLookup(query);
  const effectiveScope = scope === "all" && parsedQuery.detected ? parsedQuery.detected : scope;

  useEffect(() => {
    if (!open) return undefined;
    inputRef.current?.focus();
    function onKeyDown(event) { if (event.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = parsedQuery.value.toLocaleLowerCase();
    if (!q) return [];
    return LANGUAGES.flatMap((language) => (FLASHCARDS[language.code] || [])
      .filter((card) => [card.front, card.frontSub, card.translit, card.meaning, card.breakdown, card.example, card.exampleMeaning]
        .filter(Boolean).join(" ").toLocaleLowerCase().includes(q))
      .map((card) => ({ card, language })))
      .filter((result) => effectiveScope === "all" || result.language.code === effectiveScope)
      .slice(0, 30);
  }, [parsedQuery.value, effectiveScope]);

  const quickResults = useMemo(() => {
    const q=parsedQuery.value.toLocaleLowerCase();
    if(!q) return [];
    return QUICK_LOOKUPS.filter(item=>item.en.toLowerCase().includes(q)||q.includes(item.en.toLowerCase()))
      .flatMap(item=>Object.entries(item.values).filter(([code])=>effectiveScope==="all"||effectiveScope===code).map(([code,value])=>({english:item.en,language:LANGUAGES.find(l=>l.code===code),word:value[0],translit:value[1],meaning:value[2]})));
  },[parsedQuery.value,effectiveScope]);

  async function speak(text, languageCode) {
    try { setError(""); await speakText(text, languageCode); }
    catch (err) { setError(err.message || "Pronunciation audio is unavailable."); }
  }

  async function search(event) {
    event?.preventDefault();
    if(!query.trim()||busy) return;
    setBusy(true); setError(""); setLookup(null);
    const target=effectiveScope==="all"?lang:effectiveScope;
    try {
      const response=await fetch("/api/tutor",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        language:target,mode:"breakdown",
        message:"Translate the following English word or phrase into "+(LANGUAGES.find(item=>item.code===target)?.label||target)+". Give the native script, natural transliteration, concise meaning and one short example. The learner's lookup: "+query.trim()
      })});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||"Live lookup is temporarily unavailable.");
      setLookup({language:LANGUAGES.find(item=>item.code===target),reply:data.reply,translation:data.translation});
    } catch(err) { setError(err.message||"Lookup could not be completed."); }
    finally { setBusy(false); }
  }

  if (!open) return null;
  return (
    <div className="lf-research-backdrop" role="presentation" onMouseDown={(event)=>{if(event.target===event.currentTarget)onClose();}}>
      <section className="lf-research-dialog" role="dialog" aria-modal="true" aria-labelledby="lf-research-title">
        <header><div><p className="lf-eyebrow">Linguistix reference library</p><h2 id="lf-research-title">Lugha Research</h2><p>Look up how to say something in a language — not just words in your completed lessons.</p></div><button type="button" onClick={onClose} aria-label="Close research">×</button></header>
        <form className="lf-research-search" onSubmit={search}><input ref={inputRef} value={query} onChange={(event)=>{setQuery(event.target.value);setLookup(null);setError("");}} placeholder="Try “I understand in Arabic”, hello, or thank you…" aria-label="Search a word or phrase" /><button className="button" type="submit" disabled={!query.trim()||busy}>{busy?"Looking up…":"Look up phrase"}</button></form>
        <div className="lf-research-filters"><button type="button" aria-pressed={scope==="all"} onClick={()=>setScope("all")}>All languages</button>{LANGUAGES.map((language)=><button type="button" key={language.code} aria-pressed={scope===language.code} onClick={()=>setScope(language.code)}>{language.emblem} {language.short}</button>)}</div>
        <div className="lf-research-results">
          {!query.trim()&&<p className="lf-empty">Type an English word or phrase to find its translation, pronunciation and examples.</p>}
          {quickResults.map((item,index)=><article className="lf-research-result lf-lookup-result" key={item.language.code+item.english+index}><div><span className="lf-research-language">{item.language.emblem} {item.language.label} · Quick reference</span><h3 lang={item.language.speech} dir={item.language.dir}>{item.word}</h3><small>{item.translit}</small><p><strong>{item.meaning}</strong></p></div><button type="button" onClick={()=>speak(item.word,item.language.code)} aria-label={"Play pronunciation of "+item.word}>▶</button></article>)}
          {results.map(({card,language})=><article className="lf-research-result" key={language.code+"-"+card.id}><div><span className="lf-research-language">{language.emblem} {language.label} · Course example</span><h3 lang={language.speech} dir={language.dir}>{card.front}</h3>{card.translit&&<small>{card.translit}</small>}<p><strong>{card.meaning}</strong></p><p>{card.breakdown}</p>{card.example&&<p className="lf-research-example">{card.example} — {card.exampleMeaning}</p>}</div><button type="button" onClick={()=>speak(card.front,language.code)} aria-label={"Play pronunciation for "+card.front}>▶</button></article>)}
          {lookup&&<article className="lf-research-result lf-live-lookup"><div><span className="lf-research-language">{lookup.language?.emblem} {lookup.language?.label} · Live lookup</span><h3>{lookup.reply}</h3>{lookup.translation&&<p>{lookup.translation}</p>}</div></article>}
          {error&&<p className="lf-research-error" role="alert">{error}</p>}
          {query.trim()&&!quickResults.length&&!results.length&&!lookup&&!busy&&!error&&<p className="lf-empty">No saved example matched. Press “Look up phrase” for a fresh translation from Kalam AI.</p>}
        </div>
      </section>
    </div>
  );
}
