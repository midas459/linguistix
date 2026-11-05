import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import PronunciationLab from "./pronunciation-lab";

export default async function PronunciationPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  return (
    <main>
      <section className="panel">
        <div className="eyebrow">Speaking practice · Browser audio</div>
        <h1>Pronunciation Lab</h1>
        <p>Listen to words and phrases in your selected course language, then practise at a pace that feels comfortable.</p>
        <PronunciationLab />
        <div className="actions">
          <Link className="button secondary" href="/dashboard">Dashboard</Link>
          <Link className="button secondary" href="/learn">Courses</Link>
        </div>
      </section>
    </main>
  );
}
