"use client";

import { useLearn } from "../../lib/learn-store";

export default function DashboardLearningStats() {
  const { language, progress, todayStats, hearts, maxHearts } = useLearn();

  return (
    <>
      <div className="eyebrow">Current course · {language.native}</div>
      <div className="stats-grid">
        <div className="stat-card"><strong>{progress.xpTotal}</strong><span>Total XP</span></div>
        <div className="stat-card"><strong>{progress.streak}</strong><span>Day streak</span></div>
        <div className="stat-card"><strong>{progress.cardsTotal}</strong><span>Cards reviewed</span></div>
        <div className="stat-card"><strong>{hearts}/{maxHearts}</strong><span>Hearts</span></div>
      </div>
      <p>Today: {todayStats.xp} XP · {todayStats.cards} cards · {todayStats.minutes} minutes</p>
      <p><small>Learning progress currently stays in this browser using the existing local storage format. Cloud sync is a later migration step.</small></p>
    </>
  );
}
