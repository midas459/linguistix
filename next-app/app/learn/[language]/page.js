import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { getLanguage, MODULES } from "../../../data/curriculum";

export default async function LanguagePage({ params }) {
  const { language: code } = await params;
  const language = getLanguage(code);
  if (language.code !== code || !MODULES[code]) notFound();

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  return (
    <main>
      <section className="panel">
        <div className="eyebrow">{language.native} · {language.label}</div>
        <h1>{language.label}</h1>
        <p>{language.blurb}</p>
        <div className="module-list">
          {MODULES[code].map((module, index) => (
            <article className="module-card" key={module.id}>
              <div className="eyebrow">Unit {index + 1}</div>
              <h2>{module.title}</h2>
              <p>{module.summary}</p>
              <ul>
                {module.lessons.map(lesson => (
                  <li key={lesson.id}>
                    <Link href={`/learn/${code}/${lesson.id}`}>{lesson.title}</Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="actions"><Link className="button secondary" href="/learn">All languages</Link></div>
      </section>
    </main>
  );
}
