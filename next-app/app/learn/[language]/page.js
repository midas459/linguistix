import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { getLanguage, MODULES } from "../../../data/curriculum";

function SnakeUnit({module,index,code,completed}){
 const lessons=module.lessons;
 return <section className="learn-map-unit">
  <header className="learn-map-unit-head"><span className="learn-map-unit-number">UNIT {String(index+1).padStart(2,"0")}</span><div><h2>{module.title}</h2><p>{module.summary}</p></div><span className="learn-map-unit-count">{lessons.length} lessons</span></header>
  <div className="learn-snake-grid">{lessons.map((lesson,lessonIndex)=>{
   const row=Math.floor(lessonIndex/3),position=lessonIndex%3,col=row%2===0?position:2-position;
   const done=completed.includes(lesson.id);
   return <Link key={lesson.id} href={"/learn/"+code+"/"+lesson.id} className={"learn-snake-node"+(done?" is-complete":"")} style={{gridColumn:col+1,gridRow:row+1}}>
    <span className="learn-snake-node-top"><span>{done?"✓":String(lessonIndex+1).padStart(2,"0")}</span><small>{done?"COMPLETED":"LESSON"}</small></span>
    <strong>{lesson.title}</strong><small>{lesson.subtitle}</small><span className="learn-snake-node-arrow">↗</span>
   </Link>;
  })}</div>
 </section>;
}

export default async function LanguagePage({ params }) {
 const {language:code}=await params; const language=getLanguage(code);
 if(language.code!==code||!MODULES[code]) notFound();
 const supabase=await createClient(); const {data:{user},error}=await supabase.auth.getUser();
 if(error||!user) redirect("/login");
 return <main className="learn-map-page">
  <header className="learn-map-hero"><div><p className="eyebrow">{language.native} · {language.label} COURSE</p><h1>Your learning path.</h1><p>Follow the path from your first words to confident conversation. Move at your own pace — every lesson is open.</p><div className="learn-map-hero-actions"><Link className="button" href="/alphabet">Open Alphabet Studio</Link><Link className="button secondary" href="/learn">All languages</Link></div></div><div className="learn-map-hero-mark" lang={language.code} dir={language.dir}>{language.native}</div></header>
  <div className="learn-map-progress"><span>YOUR COURSE MAP</span><strong>{MODULES[code].reduce((total,module)=>total+module.lessons.length,0)} learning steps</strong><small>Complete lessons in sequence or jump to any topic.</small></div>
  {MODULES[code].map((module,index)=><SnakeUnit key={module.id} module={module} index={index} code={code} completed={[]}/>)}
 </main>;
}
