"use client";
import Link from "next/link";
import { useLearn } from "../../../lib/learn-store";

export default function LearningPath({language,modules,code}){
 const {progress}=useLearn();
 const completed=progress.lessons||[];
 const allLessons=modules.flatMap((module,moduleIndex)=>module.lessons.map((lesson,lessonIndex)=>({...lesson,moduleTitle:module.title,moduleIndex,lessonIndex})));
 return <main className="learn-map-page">
  <header className="learn-map-hero"><div><p className="eyebrow">{language.native} · {language.label} COURSE</p><h1>Your learning path.</h1><p>Follow the winding route from first words to confident conversation. Every lesson is open — learn at your own pace.</p><div className="learn-map-hero-actions"><Link className="button" href="/alphabet">Open Alphabet Studio</Link><Link className="button secondary" href="/learn">Browse courses</Link></div></div><div className="learn-map-hero-mark" lang={language.code} dir={language.dir}>{language.native}</div></header>
  <div className="learn-map-progress"><span>YOUR COURSE MAP</span><strong>{completed.filter(id=>allLessons.some(lesson=>lesson.id===id)).length} / {allLessons.length} steps completed</strong><small>Start at the beginning or jump to any lesson. The route winds through every unit.</small></div>
  <section className="learn-map-unit"><header className="learn-map-unit-head"><span className="learn-map-unit-number">START HERE</span><div><h2>{language.label} learning route</h2><p>{modules.length} units · {allLessons.length} lessons</p></div></header>
   <div className="learn-snake-grid">{allLessons.map((lesson,index)=>{
    const row=Math.floor(index/3),position=index%3,col=row%2===0?position:2-position;
    const isDone=completed.includes(lesson.id);
    return <Link key={lesson.id} href={"/learn/"+code+"/"+lesson.id} className={"learn-snake-node"+(isDone?" is-complete":"")} style={{gridColumn:col+1,gridRow:row+1}}>
     <span className="learn-snake-node-top"><span>{isDone?"✓":String(index+1).padStart(2,"0")}</span><small>{isDone?"COMPLETED":"STEP "+String(index+1).padStart(2,"0")}</small></span>
     <span className="learn-snake-unit-label">UNIT {lesson.moduleIndex+1} · {lesson.moduleTitle}</span>
     <strong>{lesson.title}</strong><small>{lesson.subtitle}</small><span className="learn-snake-node-arrow">↗</span>
    </Link>;
   })}</div>
  </section>
 </main>;
}
