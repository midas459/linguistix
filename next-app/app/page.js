import { createClient } from "../lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    redirect(user ? "/learn" : "/login");
  } catch (error) {
    // Next.js redirect throws a control-flow exception; rethrow it unchanged.
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    redirect("/login");
  }
}
