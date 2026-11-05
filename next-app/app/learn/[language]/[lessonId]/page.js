import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { getLanguage, MODULES } from "../../../../data/curriculum";
import { buildScreens } from "../../../../data/lessons";

export default async function LessonPage({ params }) {
  const { language: code, lessonId } = await params;
  const language = getLanguage(code);
  if (language.code !== code || !MODULES[code]) notFound();

  const courseModule = MODULES[code].find(item => item.lessons.some(lesson => lesson.id === lessonId));
  const lesson = courseModule?.lessons.find(item => item.id === lessonId);
  if (!lesson) notFound();

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const lessonIndex = courseModule.lessons.findIndex(item => item.id === lessonId);
  const screens = buildScreens(code, courseModule.id, lessonIndex);

  return (
    <main>
      <section className="panel">
        <div className="eyebrow">{language.label} · {courseModule.title}</div>
        <h1>{lesson.title}</h1>
        <p>{lesson.subtitle}</p>
        <div className="lesson-points">
          {lesson.points.map((point, index) => <p key={index}>✦ {point}</p>)}
        </div>
        <h2>Practice preview</h2>
        <p>{screens.length} practice screens are available in the course data. The interactive exercise player is still being ported.</p>
        <div className="actions">
          <Link className="button secondary" href={`/learn/${code}`}>Back to units</Link>
          <Link className="button" href="/dashboard">Dashboard</Link>
        </div>
      </section>
    </main>
  );
}
