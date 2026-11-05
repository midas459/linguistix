import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BADGES, LANGUAGES, getLanguage } from "@/data/curriculum";
import { dayKey } from "@/lib/dates";

const STORAGE_KEY = "lisan.state.v2";
export const MAX_HEARTS = 5;

export function emptyProgress() {
  return {
    xpTotal: 0,
    cardsTotal: 0,
    minutesTotal: 0,
    lessons: [],
    dayXp: {},
    dayMinutes: {},
    dayCards: {},
    streak: 0,
    lastDay: null,
    activity: [],
    sample: false,
  };
}

/** A clearly-labelled sample week so a brand-new dashboard isn't a dead screen. */
function sampleProgress(lang) {
  const p = emptyProgress();
  const now = Date.now();
  p.sample = true;
  p.streak = 4;
  p.xpTotal = 315;
  p.cardsTotal = 68;
  p.minutesTotal = 41;
  p.lessons = [`${lang}-m1-l1`, `${lang}-m1-l2`];
  [4, 3, 2, 1].forEach((offset, i) => {
    const key = dayKey(new Date(now - offset * 86400000));
    p.dayXp[key] = [40, 62, 28, 55][i];
    p.dayMinutes[key] = [6, 9, 4, 7][i];
    p.dayCards[key] = [9, 14, 6, 11][i];
  });
  p.activity = [
    { id: "seed-2", type: "lesson", title: "Positional shapes", detail: "Alphabet & Script · +20 XP", at: new Date(now - 86400000).toISOString() },
    { id: "seed-1", type: "cards", title: "14 cards reviewed", detail: "Letters deck · +56 XP", at: new Date(now - 20 * 3600000).toISOString() },
    { id: "seed-0", type: "badge", title: "First Step unlocked", detail: "You finished your first lesson", at: new Date(now - 26 * 3600000).toISOString() },
  ];
  return p;
}

function defaultState() {
  return {
    lang: "ar",
    theme: "ocean",
    progress: { ar: sampleProgress("ar"), de: emptyProgress(), ja: emptyProgress() },
    srs: { ar: {}, de: {}, ja: {} },
    reminders: { enabled: false, time: "19:00", days: [1, 2, 3, 4, 5, 6, 0] },
    lastReminderFired: null,
    hearts: MAX_HEARTS,
    heartsDay: null,
  };
}

function loadState() {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const base = defaultState();
    return {
      ...base,
      ...parsed,
      // Migrate the former light/dark preference to the new five-preset system.
      theme: ["ocean", "forest", "sunset", "lavender", "midnight"].includes(parsed.theme)
        ? parsed.theme
        : parsed.theme === "dark" ? "midnight" : "ocean",
      progress: { ...base.progress, ...(parsed.progress || {}) },
      srs: { ...base.srs, ...(parsed.srs || {}) },
      reminders: { ...base.reminders, ...(parsed.reminders || {}) },
    };
  } catch {
    return defaultState();
  }
}

const LearnContext = createContext(null);

export function LearnProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked — the session still works */
    }
  }, [state]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const dark = state.theme === "midnight";
    root.classList.toggle("dark", dark);
    root.dataset.theme = state.theme;
    root.dataset.lang = state.lang;
    root.style.colorScheme = dark ? "dark" : "light";
    const lang = getLanguage(state.lang);
    root.style.setProperty("--lang", dark ? lang.accentDark : lang.accent);
  }, [state.theme, state.lang]);

  const setLang = useCallback((lang) => setState((s) => ({ ...s, lang })), []);
  const setTheme = useCallback((theme) => setState((s) => ({ ...s, theme })), []);
  const toggleTheme = useCallback(() => setState((s) => ({ ...s, theme: s.theme === "midnight" ? "ocean" : "midnight" })), []);
  const setReminders = useCallback(
    (patch) => setState((s) => ({ ...s, reminders: { ...s.reminders, ...patch } })),
    [],
  );

  /** Hearts refill at the start of a new day, Duolingo style. */
  const heartsToday = useCallback((s) => (s.heartsDay === dayKey() ? s.hearts ?? MAX_HEARTS : MAX_HEARTS), []);
  const loseHeart = useCallback(
    () => setState((s) => ({ ...s, heartsDay: dayKey(), hearts: Math.max(0, heartsToday(s) - 1) })),
    [heartsToday],
  );
  const refillHearts = useCallback(() => setState((s) => ({ ...s, heartsDay: dayKey(), hearts: MAX_HEARTS })), []);

  /** Award progress to the active language. Clears sample data on the first real action. */
  const recordStudy = useCallback(({ xp = 0, minutes = 0, cards = 0, activity = null, lessonId = null }) => {
    setState((s) => {
      const lang = s.lang;
      const prev = s.progress[lang] || emptyProgress();
      const base = prev.sample ? emptyProgress() : prev;
      const today = dayKey();
      const yesterday = dayKey(new Date(Date.now() - 86400000));
      const streak = base.lastDay === today ? Math.max(base.streak, 1) : base.lastDay === yesterday ? base.streak + 1 : 1;
      const entry = activity
        ? { ...activity, id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, at: new Date().toISOString() }
        : null;
      const next = {
        ...base,
        sample: false,
        lastDay: today,
        streak,
        xpTotal: base.xpTotal + xp,
        cardsTotal: base.cardsTotal + cards,
        minutesTotal: base.minutesTotal + minutes,
        dayXp: { ...base.dayXp, [today]: (base.dayXp[today] || 0) + xp },
        dayMinutes: { ...base.dayMinutes, [today]: (base.dayMinutes[today] || 0) + minutes },
        dayCards: { ...base.dayCards, [today]: (base.dayCards[today] || 0) + cards },
        lessons: lessonId && !base.lessons.includes(lessonId) ? [...base.lessons, lessonId] : base.lessons,
        activity: entry ? [entry, ...base.activity].slice(0, 14) : base.activity,
      };
      return { ...s, progress: { ...s.progress, [lang]: next } };
    });
  }, []);

  const completeLesson = useCallback(
    (lesson, moduleTitle) => {
      recordStudy({
        xp: 20,
        minutes: 3,
        lessonId: lesson.id,
        activity: { type: "lesson", title: lesson.title, detail: `${moduleTitle} · +20 XP` },
      });
    },
    [recordStudy],
  );

  const rateCard = useCallback(
    (cardId, rating) => {
      const days = { again: 1, hard: 2, good: 4, easy: 7 }[rating] ?? 4;
      setState((s) => {
        const lang = s.lang;
        const bucket = s.srs[lang] || {};
        return {
          ...s,
          srs: {
            ...s.srs,
            [lang]: {
              ...bucket,
              [cardId]: { due: new Date(Date.now() + days * 86400000).toISOString(), interval: days, last: rating },
            },
          },
        };
      });
      recordStudy({ xp: 4, cards: 1, minutes: 1 });
    },
    [recordStudy],
  );

  const resetProgress = useCallback(() => {
    setState((s) => ({
      ...s,
      progress: { ar: emptyProgress(), de: emptyProgress(), ja: emptyProgress() },
      srs: { ar: {}, de: {}, ja: {} },
    }));
  }, []);

  const progress = state.progress[state.lang] || emptyProgress();
  const language = getLanguage(state.lang);

  const badges = useMemo(
    () =>
      BADGES.map((badge) => {
        const value = badge.value(progress, state.progress);
        const unlocked = value >= badge.target;
        return {
          ...badge,
          unlocked,
          value,
          progressLabel: badge.label(progress, state.progress),
          ratio: Math.max(0, Math.min(1, value / badge.target)),
        };
      }),
    [progress, state.progress],
  );

  const today = dayKey();
  const todayStats = {
    xp: progress.dayXp[today] || 0,
    cards: progress.dayCards[today] || 0,
    minutes: progress.dayMinutes[today] || 0,
  };

  const value = {
    ...state,
    language,
    languages: LANGUAGES,
    progress,
    todayStats,
    badges,
    unlockedBadges: badges.filter((b) => b.unlocked),
    setLang,
    toggleTheme,
    setTheme,
    setReminders,
    hearts: heartsToday(state),
    maxHearts: MAX_HEARTS,
    loseHeart,
    refillHearts,
    recordStudy,
    completeLesson,
    rateCard,
    resetProgress,
    srs: state.srs[state.lang] || {},
  };

  return <LearnContext.Provider value={value}>{children}</LearnContext.Provider>;
}

export function useLearn() {
  const ctx = useContext(LearnContext);
  if (!ctx) throw new Error("useLearn must be used inside LearnProvider");
  return ctx;
}