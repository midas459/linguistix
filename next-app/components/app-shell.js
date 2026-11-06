"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLearn } from "../lib/learn-store";

const NAV = [
  { href: "/learn", label: "Learn map", icon: "⌂" },
  { href: "/pronunciation", label: "Pronunciation lab", icon: "◉" },
  { href: "/flashcards", label: "Flashcards", icon: "▤" },
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/reset-password"];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const { language, languages, lang, setLang, progress, hearts, maxHearts, theme, toggleTheme, badges, unlockedBadges } = useLearn();
  const [menuOpen, setMenuOpen] = useState(false);
  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/auth/");
  if (isPublic) return children;

  const navigation = (
    <>
      <Link className="app-brand" href="/learn" onClick={() => setMenuOpen(false)}>
        <span className="app-brand-mark">{language.emblem}</span>
        <span><strong>Linguistix</strong><small>{language.label}</small></span>
      </Link>
      <nav className="app-nav" aria-label="Main navigation">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/learn" && pathname.startsWith(item.href + "/"));
          return <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={active ? "app-nav-link active" : "app-nav-link"} aria-current={active ? "page" : undefined}>
            <span className="app-nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span>
          </Link>;
        })}
      </nav>
      <section className="app-sidebar-progress" aria-label="Learning progress">
        <span className="app-sidebar-kicker">Your progress</span>
        <strong>{progress.xpTotal.toLocaleString()} XP</strong>
        <small>{progress.lessons.length} lessons · {unlockedBadges.length}/{badges.length} badges</small>
        <div className="app-progress-track"><span style={{ width: `${badges.length ? (unlockedBadges.length / badges.length) * 100 : 0}%` }} /></div>
      </section>
    </>
  );

  return <div className="app-shell">
    <aside className="app-sidebar">{navigation}</aside>
    <div className="app-workspace">
      <header className="app-topbar">
        <button className="app-menu-button" type="button" aria-label="Open navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>☰</button>
        <label className="app-language-select"><span className="sr-only">Learning language</span>
          <select value={lang} onChange={(event) => setLang(event.target.value)}>
            {languages.map((item) => <option key={item.code} value={item.code}>{item.emblem} {item.label}</option>)}
          </select>
        </label>
        <div className="app-topbar-spacer" />
        <span className="app-stat-pill" title="Current streak">🔥 {progress.streak}</span>
        <span className="app-stat-pill" title="Available hearts">♥ {hearts}/{maxHearts}</span>
        <span className="app-stat-pill app-xp-pill">★ {progress.xpTotal} XP</span>
        <button className="app-theme-button" type="button" onClick={toggleTheme} aria-label={theme === "midnight" ? "Switch to ocean theme" : "Switch to midnight theme"}>{theme === "midnight" ? "☀" : "☾"}</button>
      </header>
      <div className="app-page-content">{children}</div>
    </div>
    {menuOpen && <div className="app-mobile-backdrop" role="presentation" onClick={() => setMenuOpen(false)}>
      <aside className="app-mobile-drawer" aria-label="Mobile navigation" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="app-drawer-close" onClick={() => setMenuOpen(false)} aria-label="Close navigation">×</button>
        {navigation}
      </aside>
    </div>}
  </div>;
}
