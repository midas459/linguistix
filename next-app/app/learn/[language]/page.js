import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { getLanguage, MODULES } from "../../../data/curriculum";
import LearningPath from "./learning-path";

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
 return <LearningPath language={language} modules={MODULES[code]} code={code} />;
}
