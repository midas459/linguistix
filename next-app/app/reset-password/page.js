"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function updatePassword(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    setMessage(error ? error.message : "Password updated. You can now continue to your dashboard.");
  }

  return (
    <main>
      <section className="panel">
        <div className="eyebrow">Secure your account</div>
        <h1>Choose a new password</h1>
        <form onSubmit={updatePassword}>
          <label htmlFor="password">New password (at least 8 characters)</label>
          <input id="password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} />
          <div className="actions">
            <button className="button" type="submit" disabled={busy}>{busy ? "Saving…" : "Update password"}</button>
          </div>
        </form>
        {message && <p role="status">{message}</p>}
        <p><Link href="/dashboard">Continue to dashboard</Link></p>
      </section>
    </main>
  );
}
