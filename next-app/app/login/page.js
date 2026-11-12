"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/dashboard");
  }

  async function signInWithGoogle() {
    setBusy(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    if (error) {
      setMessage(error.message);
      setBusy(false);
    }
  }

  return (
    <main>
      <section className="panel">
        <div className="eyebrow">Welcome back</div>
        <h1>Sign in</h1>
        <p>This login is connected to Supabase Auth, not the legacy Base44 account system.</p>
        <form onSubmit={signIn}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
          <div className="actions">
            <button className="button" type="submit" disabled={busy}>{busy ? "Please wait…" : "Sign in"}</button>
            <button className="button secondary" type="button" onClick={signInWithGoogle} disabled={busy}>Continue with Google</button>
          </div>
        </form>
        {message && <p role="alert">{message}</p>}
        <p><Link href="/register">Create an account</Link> · <Link href="/forgot-password">Forgot password?</Link></p>
        <p><Link href="/">Back to home</Link></p>
      </section>
    </main>
  );
}
