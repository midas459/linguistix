import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import DashboardLearningStats from "./dashboard-learning-stats";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  return (
    <main>
      <section className="panel">
        <div className="eyebrow">Your learning space</div>
        <h1>Dashboard</h1>
        <p>Signed in as {user.email}. This protected page confirms that the Next.js app can read the Supabase session on the server.</p>
        <DashboardLearningStats />
        <p>The existing course experience is the next porting milestone; this is not yet the complete Linguistix feature set.</p>
        <div className="actions">
          <Link className="button" href="/learn">Explore courses</Link>
          <Link className="button secondary" href="/settings">Settings</Link>
          <Link className="button secondary" href="/flashcards">Flashcards</Link>
          <Link className="button secondary" href="/pronunciation">Pronunciation Lab</Link>
          <Link className="button secondary" href="/">Home</Link>
        </div>
      </section>
    </main>
  );
}
