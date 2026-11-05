"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function register(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    setBusy(false);
    setMessage(error ? error.message : "Check your email for the confirmation link before signing in.");
  }

  return (
    <main>
      <section className="panel">
        <div className="eyebrow">Start learning</div>
        <h1>Create account</h1>
        <p>New Linguistix accounts are created in Supabase Auth. Existing Base44 accounts do not automatically transfer.</p>
        <form onSubmit={register}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
          <label htmlFor="password">Password (at least 8 characters)</label>
          <input id="password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} />
          <div className="actions">
            <button className="button" type="submit" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
          </div>
        </form>
        {message && <p role="status">{message}</p>}
        <p><Link href="/login">Already have an account? Sign in</Link></p>
      </section>
    </main>
  );
}
