import Link from "next/link";
import { createClient } from "../lib/supabase/server";

export default async function HomePage() {
  let user = null;
  let setupMissing = false;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    setupMissing = true;
  }

  return (
    <main>
      <section className="panel">
        <div className="eyebrow">The next chapter</div>
        <h1>Linguistix</h1>
        <p>
          A language-learning space for guided lessons, flashcards,
          pronunciation and consistent daily progress.
        </p>
        {setupMissing ? (
          <p>Connect the Supabase project by creating <code>.env.local</code> from <code>.env.example</code>.</p>
        ) : (
          <p>{user ? `Signed in as ${user.email}` : "You are viewing the new Next.js application shell."}</p>
        )}
        <div className="actions">
          <Link className="button" href="/login">Sign in</Link>
          <Link className="button secondary" href="/dashboard">Open learning dashboard</Link>
        </div>
      </section>
    </main>
  );
}
