import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import KalamTutor from "./kalam-tutor";

export default async function TutorPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  return (
    <main className="lf-tutor-page">
      <div className="lf-tutor-heading">
        <p className="lf-eyebrow">Your language companion</p>
        <h1>Kalam AI</h1>
        <p>Ask questions, unpack tricky grammar and practise real-world conversations.</p>
      </div>
      <KalamTutor />
    </main>
  );
}
