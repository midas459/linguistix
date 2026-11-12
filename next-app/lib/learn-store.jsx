"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BADGES, LANGUAGES, getLanguage } from "@/data/curriculum";
import { dayKey } from "@/lib/dates";

const STORAGE_KEY = "lisan.state.v2";
export const MAX_HEARTS = 5;

export function emptyProgress() {
  return { xpTotal: 0, cardsTotal: 0, minutesTotal: 0, lessons: [], dayXp: {}, dayMinutes: {}, dayCards: {}, streak: 0, lastDay: null, activity: [], sample: false };
}

function defaultState() {
  return {
    lang: "ar", theme: "ocean",
    progress: Object.fromEntries(LANGUAGES.map(({ code }) => [code, emptyProgress()])),
    srs: Object.fromEntries(LANGUAGES.map(({ code }) => [code, {}])),
    reminders: { enabled: false, time: "19:00", days: [1, 2, 3, 4, 5, 6, 0] },
    lastReminderFired: null, hearts: MAX_HEARTS, heartsDay: null,
  };
}

export function normalizeState(parsed) {
  const base = defaultState();
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return base;
  return {
    ...base, ...parsed,
    theme: ["ocean", "forest", "sunset", "lavender", "midnight", "sakura", "royal", "obsidian"].includes(parsed.theme) ? parsed.theme : parsed.theme === "dark" ? "midnight" : "ocean",
    progress: { ...base.progress, ...(parsed.progress || {}) },
    srs: { ...base.srs, ...(parsed.srs || {}) },
    reminders: { ...base.reminders, ...(parsed.reminders || {}) },
  };
}

function loadState() {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeState(JSON.parse(raw)) : defaultState();
  } catch { return defaultState(); }
}

const LearnContext = createContext(null);

export function LearnProvider({ children }) {
  // Matching server/client initial state prevents hydration mismatch; saved state restores on the next frame.
  const [state, setState] = useState(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setState(loadState());
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch { /* storage full or blocked — the session still works */ }
  }, [state, hydrated]);

  useEffect(() => {
    const root = document.documentElement;
    const dark = state.theme === "midnight";
    root.classList.toggle("dark", dark);
    root.dataset.theme = state.theme;
    root.dataset.lang = state.lang;
    root.style.colorScheme = dark ? "dark" : "light";
    const lang = getLanguage(state.lang);
    root.style.setProperty("--lang", dark ? lang.accentDark : lang.accent);
  }, [state.theme, state.lang]);

  const setLang = useCallback((lang) => {
    if (LANGUAGES.some((item) => item.code === lang)) setState((s) => ({ ...s, lang }));
  }, []);
  const setTheme = useCallback((theme) => {
    if (["ocean", "forest", "sunset", "lavender", "midnight", "sakura", "royal", "obsidian"].includes(theme)) setState((s) => ({ ...s, theme }));
  }, []);
  const toggleTheme = useCallback(() => setState((s) => ({ ...s, theme: s.theme === "midnight" ? "ocean" : "midnight" })), []);
  const setReminders = useCallback((patch) => setState((s) => ({ ...s, reminders: { ...s.reminders, ...patch } })), []);

  const heartsToday = useCallback((s) => s.heartsDay === dayKey() ? s.hearts ?? MAX_HEARTS : MAX_HEARTS, []);
  const loseHeart = useCallback(() => setState((s) => ({ ...s, heartsDay: dayKey(), hearts: Math.max(0, heartsToday(s) - 1) })), [heartsToday]);
  const refillHearts = useCallback(() => setState((s) => ({ ...s, heartsDay: dayKey(), hearts: MAX_HEARTS })), []);

  const recordStudy = useCallback(({ xp = 0, minutes = 0, cards = 0, activity = null, lessonId = null }) => {
    setState((s) => {
      const lang = s.lang;
      const prev = s.progress[lang] || emptyProgress();
      const base = prev.sample ? emptyProgress() : prev;
      const today = dayKey();
      const yesterday = dayKey(new Date(Date.now() - 86400000));
      const streak = base.lastDay === today ? Math.max(base.streak, 1) : base.lastDay === yesterday ? base.streak + 1 : 1;
      const entry = activity ? { ...activity, id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, at: new Date().toISOString() } : null;
      const next = {
        ...base, sample: false, lastDay: today, streak,
        xpTotal: base.xpTotal + xp, cardsTotal: base.cardsTotal + cards, minutesTotal: base.minutesTotal + minutes,
        dayXp: { ...base.dayXp, [today]: (base.dayXp[today] || 0) + xp },
        dayMinutes: { ...base.dayMinutes, [today]: (base.dayMinutes[today] || 0) + minutes },
        dayCards: { ...base.dayCards, [today]: (base.dayCards[today] || 0) + cards },
        lessons: lessonId && !base.lessons.includes(lessonId) ? [...base.lessons, lessonId] : base.lessons,
        activity: entry ? [entry, ...base.activity].slice(0, 14) : base.activity,
      };
      return { ...s, progress: { ...s.progress, [lang]: next } };
    });
  }, []);

  const completeLesson = useCallback((lesson, moduleTitle) => recordStudy({
    xp: 20, minutes: 3, lessonId: lesson.id,
    activity: { type: "lesson", title: lesson.title, detail: `${moduleTitle} · +20 XP` },
  }), [recordStudy]);

  const rateCard = useCallback((cardId, rating) => {
    const days = { again: 1, hard: 2, good: 4, easy: 7 }[rating] ?? 4;
    setState((s) => ({
      ...s,
      srs: { ...s.srs, [s.lang]: { ...(s.srs[s.lang] || {}), [cardId]: { due: new Date(Date.now() + days * 86400000).toISOString(), interval: days, last: rating } } },
    }));
    recordStudy({ xp: 4, cards: 1, minutes: 1 });
  }, [recordStudy]);

  const resetProgress = useCallback(() => setState((s) => ({
    ...s,
    progress: Object.fromEntries(LANGUAGES.map(({ code }) => [code, emptyProgress()])),
    srs: Object.fromEntries(LANGUAGES.map(({ code }) => [code, {}])),
  })), []);

  const progress = state.progress[state.lang] || emptyProgress();
  const language = getLanguage(state.lang);
  const badges = useMemo(() => BADGES.map((badge) => {
    const value = badge.value(progress, state.progress);
    return { ...badge, unlocked: value >= badge.target, value, progressLabel: badge.label(progress, state.progress), ratio: Math.max(0, Math.min(1, value / badge.target)) };
  }), [progress, state.progress]);
  const today = dayKey();
  const todayStats = { xp: progress.dayXp[today] || 0, cards: progress.dayCards[today] || 0, minutes: progress.dayMinutes[today] || 0 };

  const replaceState = useCallback((next) => setState(normalizeState(next)), []);
  const resetForAccount = useCallback(() => setState(defaultState()), []);

  const value = {
    ...state, state, hydrated, replaceState, resetForAccount,
    language, languages: LANGUAGES, progress, todayStats, badges,
    unlockedBadges: badges.filter((b) => b.unlocked),
    setLang, toggleTheme, setTheme, setReminders,
    hearts: heartsToday(state), maxHearts: MAX_HEARTS, loseHeart, refillHearts,
    recordStudy, completeLesson, rateCard, resetProgress, srs: state.srs[state.lang] || {},
  };
  return <LearnContext.Provider value={value}>{children}</LearnContext.Provider>;
}

export function useLearn() {
  const ctx = useContext(LearnContext);
  if (!ctx) throw new Error("useLearn must be used inside LearnProvider");
  return ctx;
}
