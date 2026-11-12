"use client";
import Link from "next/link";
import { useLearn } from "../../../lib/learn-store";

export default function LearningPath({language,modules,code}){
 const {progress}=useLearn();
 const completed=progress.lessons||[];
 return <main className="learn-map-page">
  <header className="learn-map-hero"><div><p className="eyebrow">{language.native} · {language.label} COURSE</p><h1>Your learning path.</h1><p>Follow the path from your first words to confident conversation. Move at your own pace — every lesson is open.</p><div className="learn-map-hero-actions"><Link className="button" href="/alphabet">Open Alphabet Studio</Link><Link className="button secondary" href="/learn">Browse courses</Link></div></div><div className="learn-map-hero-mark" lang={language.code} dir={language.dir}>{language.native}</div></header>
  <div className="learn-map-progress"><span>YOUR COURSE MAP</span><strong>{completed.filter(id=>modules.some(module=>module.lessons.some(lesson=>lesson.id===id))).length} / {modules.reduce((n,module)=>n+module.lessons.length,0)} steps completed</strong><small>Follow the winding route or jump to any lesson.</small></div>
  {modules.map((module,index)=>{
   const done=module.lessons.filter(lesson=>completed.includes(lesson.id)).length;
   return <section className="learn-map-unit" key={module.id}>
    <header className="learn-map-unit-head"><span className="learn-map-unit-number">UNIT {String(index+1).padStart(2,"0")}</span><div><h2>{module.title}</h2><p>{module.summary}</p></div><span className="learn-map-unit-count">{done}/{module.lessons.length} done</span></header>
    <div className="learn-snake-grid">{module.lessons.map((lesson,lessonIndex)=>{
     const row=Math.floor(lessonIndex/3),position=lessonIndex%3,col=row%2===0?position:2-position;
     const isDone=completed.includes(lesson.id);
     return <Link key={lesson.id} href={"/learn/"+code+"/"+lesson.id} className={"learn-snake-node"+(isDone?" is-complete":"")} style={{gridColumn:col+1,gridRow:row+1}}>
      <span className="learn-snake-node-top"><span>{isDone?"✓":String(lessonIndex+1).padStart(2,"0")}</span><small>{isDone?"COMPLETED":"LESSON"}</small></span><strong>{lesson.title}</strong><small>{lesson.subtitle}</small><span className="learn-snake-node-arrow">↗</span>
     </Link>;
    })}</div>
   </section>;
  })}
 </main>;
}
