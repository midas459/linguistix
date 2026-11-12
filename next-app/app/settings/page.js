"use client";

import Link from "next/link";
import { useLearn } from "../../lib/learn-store";

const THEMES = [
  ["ocean", "Ocean", "Cool teal, glacier blue and deep water"],
  ["forest", "Forest", "Emerald, moss and warm ivory"],
  ["sunset", "Sunset", "Coral, amber and peach"],
  ["lavender", "Lavender", "Violet, lilac and soft plum"],
  ["midnight", "Midnight", "Ink navy, crimson and electric violet"],
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
              {THEMES.map(([id, label, detail]) => (
                <button className="theme-choice" key={id} type="button" aria-pressed={theme === id} onClick={() => setTheme(id)}>
                  <span className={"theme-swatch theme-swatch-" + id} aria-hidden="true" />
                  <span><strong>{label}</strong><small>{detail}</small></span>
                  {theme === id && <span className="theme-selected" aria-label="Selected">✓</span>}
                </button>
              ))}
            </div>
          </section>
          <section className="lf-ai-settings">
            <h2>Kalam AI is included</h2>
            <p>You do not need to create an account with an AI provider, buy an API key, or configure anything. Linguistix connects to Kalam AI through its secure app-managed server connection.</p>
            <p>If Kalam AI is temporarily unavailable, that is a service issue we are responsible for fixing — not something you should have to configure.</p>
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
          <Link className="button" href="/alphabet">Open Alphabet Studio</Link>
        </div>
      </section>
    </main>
  );
}
