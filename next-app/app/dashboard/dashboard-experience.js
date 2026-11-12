"use client";

import Link from "next/link";
import { useMemo } from "react";
import { MODULES, XP_GOAL, CARDS_GOAL, MINUTES_GOAL } from "../../data/curriculum";
import { dayKey, weekDates, formatLongDate, relativeTime } from "../../lib/dates";
import { useLearn } from "../../lib/learn-store";

const ACTIVITY_ICONS = { lesson: "📘", cards: "🗂️", badge: "🏅" };

export default function DashboardExperience() {
  const { language, lang, progress, todayStats, badges, unlockedBadges } = useLearn();
  const modules = MODULES[lang] || [];
  const allLessons = modules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, module })));
  const next = allLessons.find((lesson) => !progress.lessons.includes(lesson.id)) || allLessons[allLessons.length - 1];
  const completed = allLessons.filter((lesson) => progress.lessons.includes(lesson.id)).length;
  const week = useMemo(() => weekDates(), []);
  const today = dayKey();
  const weekXp = week.reduce((sum, day) => sum + (day.key <= today ? progress.dayXp[day.key] || 0 : 0), 0);
  const maxDayXp = Math.max(XP_GOAL, ...week.map((day) => progress.dayXp[day.key] || 0));
  const goalPercent = Math.min(100, Math.round((todayStats.xp / XP_GOAL) * 100));
  const title = todayStats.xp >= XP_GOAL
    ? "Daily goal reached. Keep your momentum."
    : todayStats.xp > 0
      ? "You're making progress today."
      : progress.xpTotal > 0
        ? "Ready to pick up where you left off?"
        : "Your language journey starts here.";

  return (
    <main className="lf-dashboard">
      <section className="lf-welcome">
        <div>
          <p className="lf-eyebrow">{formatLongDate()} · {language.native}</p>
          <h1>{title}</h1>
          <p className="lf-subtitle">A little practice every day builds lasting fluency.</p>
          <div className="lf-welcome-tags">
            <span>{language.emblem} {language.label}</span>
            {progress.sample && <span className="lf-preview-tag">Sample progress preview</span>}
          </div>
        </div>
        <Link className="button lf-resume" href={next ? `/learn/${lang}/${next.id}` : "/learn"}>
          {completed ? "Continue learning" : "Start your first lesson"} <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="lf-stats" aria-label="Learning statistics">
        <article className="lf-stat"><span className="lf-stat-icon">⭐</span><p>Total experience</p><strong>{progress.xpTotal.toLocaleString()} <small>XP</small></strong><span>{todayStats.xp} XP earned today</span></article>
        <article className="lf-stat"><span className="lf-stat-icon">🔥</span><p>Learning streak</p><strong>{progress.streak} <small>days</small></strong><span>Keep showing up daily</span></article>
        <article className="lf-stat"><span className="lf-stat-icon">🧠</span><p>Cards reviewed</p><strong>{progress.cardsTotal.toLocaleString()}</strong><span>{todayStats.cards} reviewed today</span></article>
        <article className="lf-stat"><span className="lf-stat-icon">⏱️</span><p>Practice time</p><strong>{progress.minutesTotal} <small>min</small></strong><span>{todayStats.minutes} minutes today</span></article>
      </section>

      <section className="lf-dashboard-grid">
        <article className="lf-card lf-daily">
          <div className="lf-card-heading"><div><p className="lf-eyebrow">Daily goals</p><h2>Small steps add up</h2></div><span className="lf-goal-ring" style={{ "--goal": `${goalPercent}%` }}>{goalPercent}%</span></div>
          <div className="lf-goal-row"><div><strong>Experience points</strong><span>{todayStats.xp} / {XP_GOAL} XP</span></div><div className="lf-track"><span style={{width:`${Math.min(100,todayStats.xp/XP_GOAL*100)}%`}} /></div></div>
          <div className="lf-goal-row"><div><strong>Flashcards</strong><span>{todayStats.cards} / {CARDS_GOAL}</span></div><div className="lf-track"><span style={{width:`${Math.min(100,todayStats.cards/CARDS_GOAL*100)}%`}} /></div></div>
          <div className="lf-goal-row"><div><strong>Practice minutes</strong><span>{todayStats.minutes} / {MINUTES_GOAL} min</span></div><div className="lf-track"><span style={{width:`${Math.min(100,todayStats.minutes/MINUTES_GOAL*100)}%`}} /></div></div>
        </article>

        <article className="lf-card lf-week">
          <div className="lf-card-heading"><div><p className="lf-eyebrow">Your activity</p><h2>This week</h2></div><strong className="lf-week-total">{weekXp} <small>XP</small></strong></div>
          <div className="lf-chart" role="img" aria-label={`Weekly XP: ${week.map(day=>day.label+" "+(progress.dayXp[day.key]||0)).join(", ")}`}>
            {week.map((day) => {
              const value = day.key <= today ? progress.dayXp[day.key] || 0 : 0;
              return <div className="lf-chart-day" key={day.key}><span className="lf-chart-value">{value || ""}</span><div className="lf-chart-track"><span style={{height:`${Math.max(value ? 5 : 0, value/maxDayXp*100)}%`}} /></div><span className="lf-chart-label">{day.label}</span></div>;
            })}
          </div>
        </article>
      </section>

      <section className="lf-section">
        <div className="lf-section-heading"><div><p className="lf-eyebrow">Your curriculum</p><h2>Learning path</h2><p>{completed} of {allLessons.length} lessons completed</p></div><Link href="/learn">Browse courses →</Link></div>
        <div className="lf-path">
          {modules.map((module,index) => {
            const done = module.lessons.filter((lesson)=>progress.lessons.includes(lesson.id)).length;
            return <article className="lf-module" key={module.id}>
              <div className="lf-module-top"><span className="lf-module-number">{done===module.lessons.length?"✓":String(index+1).padStart(2,"0")}</span><div><p className="lf-eyebrow">Unit {index+1} · {done}/{module.lessons.length} lessons</p><h3>{module.title}</h3><p>{module.summary}</p></div></div>
              <div className="lf-module-progress"><span style={{width:`${done/module.lessons.length*100}%`}} /></div>
              <ul>{module.lessons.map((lesson,li)=>{
                const isDone=progress.lessons.includes(lesson.id);
                const previousDone=li===0 || progress.lessons.includes(module.lessons[li-1].id);
                const locked=!isDone&&!previousDone;
                return <li key={lesson.id}><span className={isDone?"lf-lesson-check done":"lf-lesson-check"}>{isDone?"✓":locked?"·":String(li+1)}</span><Link aria-disabled={locked} tabIndex={locked?-1:0} href={`/learn/${lang}/${lesson.id}`} className={locked?"is-locked":""}><span>{lesson.title}</span><small>{lesson.subtitle}</small></Link><span className="lf-lesson-xp">{isDone?"Completed":"+20 XP"}</span></li>;
              })}</ul>
            </article>;
          })}
        </div>
      </section>

      <section className="lf-section">
        <div className="lf-section-heading"><div><p className="lf-eyebrow">Milestones</p><h2>Achievements</h2><p>{unlockedBadges.length} of {badges.length} unlocked</p></div></div>
        <div className="lf-badges">{badges.slice(0,8).map((badge)=><article className={badge.unlocked?"lf-badge unlocked":"lf-badge"} key={badge.id}><span>{badge.unlocked?"🏅":"🔒"}</span><strong>{badge.name}</strong><small>{badge.unlocked?"Unlocked":badge.progressLabel}</small><div className="lf-track"><span style={{width:`${badge.ratio*100}%`}} /></div></article>)}</div>
      </section>

      <section className="lf-section">
        <div className="lf-section-heading"><div><p className="lf-eyebrow">Your latest work</p><h2>Recent activity</h2></div></div>
        <div className="lf-card lf-activity">
          {progress.activity.length ? progress.activity.slice(0,6).map((item)=><div className="lf-activity-item" key={item.id}><span>{ACTIVITY_ICONS[item.type]||"•"}</span><div><strong>{item.title}</strong><small>{item.detail}</small></div><time>{relativeTime(item.at)}</time></div>) : <p className="lf-empty">Complete a lesson or review a flashcard and your activity will appear here.</p>}
        </div>
      </section>

      <section className="lf-quick-links">
        <Link href="/flashcards">🗂️ Review flashcards <span>→</span></Link>
        <Link href="/alphabet">🔤 Explore every letter <span>→</span></Link>
        <Link href="/pronunciation">🔊 Practise pronunciation <span>→</span></Link>
        <Link href="/settings">⚙ Personalise your learning <span>→</span></Link>
      </section>
      <p className="lf-storage-note">Progress is currently saved in this browser. Account-based cloud sync is not enabled yet.</p>
    </main>
  );
}
