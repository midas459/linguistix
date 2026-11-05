"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendReset(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setBusy(false);
    setMessage(error ? error.message : "If an account exists for that email, a password reset link has been sent.");
  }

  return (
    <main>
      <section className="panel">
        <div className="eyebrow">Account recovery</div>
        <h1>Reset password</h1>
        <form onSubmit={sendReset}>
          <label htmlFor="email">Account email</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
          <div className="actions">
            <button className="button" type="submit" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</button>
          </div>
        </form>
        {message && <p role="status">{message}</p>}
        <p><Link href="/login">Back to sign in</Link></p>
      </section>
    </main>
  );
}
