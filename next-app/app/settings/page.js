"use client";

import Link from "next/link";
import { useLearn } from "../../lib/learn-store";

const THEMES = [
  ["ocean", "Ocean"], ["forest", "Forest"], ["sunset", "Sunset"],
  ["lavender", "Lavender"], ["midnight", "Midnight"],
];

export default function SettingsPage() {
  const { language, languages, lang, setLang, theme, setTheme } = useLearn();

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
        </div>
        <div className="actions">
          <Link className="button secondary" href="/dashboard">Dashboard</Link>
          <Link className="button" href="/learn">Browse courses</Link>
        </div>
      </section>
    </main>
  );
}
