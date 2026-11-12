"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLearn } from "../lib/learn-store";
import ResearchPanel from "./research-panel";
import FeatureIcon from "./feature-icon";
import { createClient as createSupabaseClient } from "../lib/supabase/client";

const NAV = [
  { href: "/learn", label: "Learn map", icon: "compass" },
  { href: "/tutor", label: "Kalam AI tutor", icon: "message" },
  { href: "/pronunciation", label: "Pronunciation lab", icon: "audio" },
  { href: "/alphabet", label: "Alphabet studio", icon: "alphabet" },
  { href: "/improve", label: "Language improvement", icon: "edit" },
  { href: "/flashcards", label: "Flashcards", icon: "cards" },
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/reset-password"];
const THEMES = ["ocean", "forest", "sunset", "lavender", "midnight", "sakura", "royal", "obsidian"];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, languages, lang, setLang, progress, hearts, maxHearts, theme, setTheme, badges, unlockedBadges } = useLearn();
  const [menuOpen, setMenuOpen] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [appInstalled, setAppInstalled] = useState(false);
  const [installHelp, setInstallHelp] = useState(false);
  const showInstall = pathname === "/dashboard" && !appInstalled;
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/auth/");

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true) setAppInstalled(true);
    function onBeforeInstallPrompt(event) { event.preventDefault(); setInstallPrompt(event); }
    function onInstalled() { setAppInstalled(true); setInstallPrompt(null); setInstallHelp(false); }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function installApp() {
    if (!installPrompt) { setInstallHelp(true); return; }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice?.outcome === "accepted") { setAppInstalled(true); setInstallHelp(false); }
    setInstallPrompt(null);
  }

  useEffect(() => {
    if (!menuOpen) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [menuOpen]);

  if (isPublic) return children;

  async function signOut() {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  function cycleTheme() {
    const currentIndex = THEMES.indexOf(theme);
    setTheme(THEMES[(currentIndex + 1) % THEMES.length]);
  }

  const navigation = (
    <>
      <Link className="app-brand" href="/learn" onClick={() => setMenuOpen(false)}>
        <span className="app-brand-mark"><img src="/icon.svg" alt="" /></span>
        <span><strong>Linguistix</strong><small>{language.label}</small></span>
      </Link>
      <nav className="app-nav" aria-label="Main navigation">
        {NAV.map((item) => {
          const active = item.href === "/learn"
            ? pathname === item.href || pathname.startsWith("/learn/")
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={active ? "app-nav-link active" : "app-nav-link"} aria-current={active ? "page" : undefined}>
            <span className="app-nav-icon"><FeatureIcon name={item.icon} size={19} /></span><span>{item.label}</span>
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
        <button ref={menuButtonRef} className="app-menu-button" type="button" aria-label="Open navigation" aria-expanded={menuOpen} aria-controls="app-mobile-drawer" onClick={() => setMenuOpen(true)}><FeatureIcon name="menu" size={19} /></button>
        <label className="app-language-select"><span className="sr-only">Learning language</span>
          <select value={lang} onChange={(event) => setLang(event.target.value)}>
            {languages.map((item) => <option key={item.code} value={item.code}>{item.emblem} {item.label}</option>)}
          </select>
        </label>
        <div className="app-topbar-spacer" />
        <span className="app-stat-pill" title="Current streak"><FeatureIcon name="flame" size={15} /> {progress.streak}</span>
        <span className="app-stat-pill" title="Available hearts"><FeatureIcon name="heart" size={15} /> {hearts}/{maxHearts}</span>
        <span className="app-stat-pill app-xp-pill"><FeatureIcon name="star" size={15} /> {progress.xpTotal} XP</span>
        <button className="app-research-button" type="button" onClick={() => setResearchOpen(true)} aria-label="Open Lugha Research"><FeatureIcon name="search" size={16} /> <span>Research</span></button>
        {showInstall && <button className="app-install-button" type="button" onClick={installApp}><FeatureIcon name="download" size={16} /> <span>Download app</span></button>}
        <button className="app-signout-button" type="button" onClick={signOut}>Sign out</button>
        <button className="app-theme-button" type="button" onClick={cycleTheme} aria-label={`Change theme; current theme is ${theme}`} title={`Current theme: ${theme}. Activate to cycle themes.`}><FeatureIcon name={theme === "midnight" || theme === "obsidian" ? "sun" : "moon"} size={17} /></button>
      </header>
      {installHelp && showInstall && <div className="app-install-help" role="status">To install Linguistix, use your browser menu and choose “Install app” or “Add to Home Screen”.</div>}
      <div className="app-page-content">{children}</div>
    </div>
    <ResearchPanel open={researchOpen} onClose={() => setResearchOpen(false)} />
    {menuOpen && <div className="app-mobile-backdrop" role="presentation" onClick={() => setMenuOpen(false)}>
      <aside id="app-mobile-drawer" className="app-mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile navigation" onClick={(event) => event.stopPropagation()}>
        <button ref={closeButtonRef} type="button" className="app-drawer-close" onClick={() => setMenuOpen(false)} aria-label="Close navigation">×</button>
        {navigation}
      </aside>
    </div>}
  </div>;
}
