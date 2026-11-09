"use client";

import Link from "next/link";
import { useLearn } from "../../lib/learn-store";

const THEMES = [
  ["ocean", "Ocean"], ["forest", "Forest"], ["sunset", "Sunset"],
  ["lavender", "Lavender"], ["midnight", "Midnight"],
];
const DAYS = [["Mon",1],["Tue",2],["Wed",3],["Thu",4],["Fri",5],["Sat",6],["Sun",0]];

export default function SettingsPage() {
  const { language, languages, lang, setLang, theme, setTheme, reminders, setReminders } = useLearn();

  function toggleDay(day) {
    const days = reminders.days.includes(day)
      ? reminders.days.filter((value) => value !== day)
      : [...reminders.days, day];
    setReminders({ days });
  }

  return (
    <main>
      <section className="panel">
        <div className="eyebrow">Personalize Linguistix</div>
        <h1>Settings</h1>
        <div className="settings-grid">
          <section>
            <h2>Learning language</h2>
            <p>Choose one of the seven available starter courses.</p>
            <div className="choice-row">
              {languages.map(item => (
                <button className="choice-button" key={item.code} type="button" aria-pressed={lang === item.code} onClick={() => setLang(item.code)}>
                  {item.emblem} {item.label}
                </button>
              ))}
            </div>
            <p>Selected: {language.label}</p>
          </section>
          <section>
            <h2>Appearance</h2>
            <p>Choose a theme. Your choice is saved locally in this browser.</p>
            <div className="choice-row">
              {THEMES.map(([id, label]) => (
                <button className="choice-button" key={id} type="button" aria-pressed={theme === id} onClick={() => setTheme(id)}>{label}</button>
              ))}
            </div>
          </section>
          <section className="lf-ai-settings">
            <h2>Kalam AI provider setup</h2>
            <p>Kalam AI uses Google Gemini only. Your API key stays on the server and is never sent to the browser.</p>
            <div className="actions">
              <a className="button" href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">Get Gemini API key ↗</a>
            </div>
            <p><strong>Keep your keys private.</strong> Add it to <code>next-app/.env.local</code> on your computer, or to your hosting provider's server environment. Do not paste it into this page, chat, GitHub, or any field in the browser.</p>
            <pre className="lf-env-example"><code>{"GEMINI_API_KEY=your_key_here\nGROQ_API_KEY=your_backup_key_here"}</code></pre>
            <p>After saving the file, restart the development server. The tutor uses this key on the server only.</p>
          </section>
          <section className="lf-reminder-settings">
            <h2>Study reminder preference</h2>
            <p>Choose the days and local time you would like to study. This preference is saved in this browser; push/email delivery is not connected yet.</p>
            <label className="lf-reminder-enable"><input type="checkbox" checked={reminders.enabled} onChange={(event)=>setReminders({enabled:event.target.checked})} /> Enable reminder preference</label>
            <label className="lf-reminder-time">Preferred time <input type="time" value={reminders.time} onChange={(event)=>setReminders({time:event.target.value})} disabled={!reminders.enabled} /></label>
            <div className="lf-reminder-days" aria-label="Reminder days">
              {DAYS.map(([label,value])=><button type="button" key={value} disabled={!reminders.enabled} aria-pressed={reminders.days.includes(value)} onClick={()=>toggleDay(value)}>{label}</button>)}
            </div>
          </section>
        </div>
        <div className="actions">
          <Link className="button secondary" href="/dashboard">Dashboard</Link>
          <Link className="button" href="/learn">Browse courses</Link>
        </div>
      </section>
    </main>
  );
}
