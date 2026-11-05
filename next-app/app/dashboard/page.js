import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

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
        <p>The existing course experience is the next porting milestone; this is not yet the complete Linguistix feature set.</p>
        <Link className="button secondary" href="/">Home</Link>
      </section>
    </main>
  );
}
