import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { LANGUAGES } from "../../data/curriculum";

export default async function LearnPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  return (
    <main>
      <section className="panel">
        <div className="eyebrow">Choose a course</div>
        <h1>Learn a language</h1>
        <p>Your existing seven course catalog is now available in the Next.js workspace.</p>
        <div className="course-grid">
          {LANGUAGES.map(language => (
            <Link className="course-card" key={language.code} href={`/learn/${language.code}`}>
              <span className="course-emblem">{language.emblem}</span>
              <strong>{language.label}</strong>
              <span>{language.native}</span>
              <small>{language.blurb}</small>
            </Link>
          ))}
        </div>
        <div className="actions"><Link className="button secondary" href="/dashboard">Back to dashboard</Link></div>
      </section>
    </main>
  );
}
