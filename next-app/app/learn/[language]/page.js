import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { getLanguage, MODULES } from "../../../data/curriculum";
import LearningPath from "./learning-path";

export default async function LanguagePage({ params }) {
 const {language:code}=await params; const language=getLanguage(code);
 if(language.code!==code||!MODULES[code]) notFound();
 const supabase=await createClient(); const {data:{user},error}=await supabase.auth.getUser();
 if(error||!user) redirect("/login");
 return <LearningPath language={language} modules={MODULES[code]} code={code} />;
}
