import { ArrowRight, Flame, Sparkles } from "lucide-react";
import { formatLongDate, dayKey, weekDates } from "@/lib/dates";
import { CARDS_GOAL, MINUTES_GOAL, XP_GOAL } from "@/data/curriculum";
import { useLearn } from "@/lib/learn-store";
import WeeklyChart from "@/components/dashboard/WeeklyChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { GroupedTicks, RadialGauge, TickStrip } from "@/components/dashboard/TickInstruments";
import "@/styles/dashboard.css";

export default function DashboardHero({ onResume, resumeLabel }) {
  const { progress, todayStats, language } = useLearn();
  const today = new Date();
  const week = weekDates(today);
  const weekXp = week.reduce((sum, d) => sum + (d.key > dayKey(today) ? 0 : progress.dayXp[d.key] || 0), 0);

  let title = "Your first lesson is waiting";
  if (todayStats.xp >= XP_GOAL) title = "Daily goal reached — that's the habit";
  else if (todayStats.xp > 0) title = "Today, you're on track";
  else if (weekXp > 0) title = "No XP yet today — pick up where you left off";

  return (
    <section className="dh4-section" aria-label="Your progress">
      <div className="dh4-bg" aria-hidden="true" />

      <div className="dh4-stage">
        <header className="dh4-head dh4-enter-head">
          <div>
            <p className="dh4-date">{formatLongDate(today)}</p>
            <h2 className="dh4-title">{title}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono-label text-[11px] uppercase tracking-[0.12em]"
                style={{ background: "hsl(var(--lang) / 0.12)", color: "hsl(var(--lang))" }}
              >
                <Sparkles className="h-3 w-3" /> {language.label}
              </span>
              {progress.sample && (
                <span className="rounded-full border border-dashed border-border px-2.5 py-1 font-mono-label text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  Preview data
                </span>
              )}
            </div>
          </div>
          <div className="dh4-head-actions">
            <span className="dh4-streak">
              <Flame className="h-4 w-4" strokeWidth={1.9} style={{ color: "hsl(var(--chart-1))" }} />
              {progress.streak}-day streak
            </span>
            <button type="button" className="dh4-resume" onClick={onResume}>
              {resumeLabel}
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </header>

        <div className="dh4-cards">
          <div className="dh4-kpis">
            <article className="dh4-kpi dh4-kpi--steps" style={{ "--dh4-j": 0 }}>
              <div className="dh4-kpi-body">
                <div className="dh4-copy">
                  <p className="dh4-label">Daily XP</p>
                  <p className="dh4-num">
                    {todayStats.xp}
                    <small>/ {XP_GOAL}</small>
                  </p>
                  <p className="dh4-note">
                    {todayStats.xp >= XP_GOAL
                      ? "Goal complete for today"
                      : `${XP_GOAL - todayStats.xp} XP left for today`}
                  </p>
                </div>
                <RadialGauge value={todayStats.xp} goal={XP_GOAL} />
              </div>
            </article>

            <article className="dh4-kpi dh4-kpi--cal" style={{ "--dh4-j": 1 }}>
              <div className="dh4-kpi-body dh4-copy">
                <p className="dh4-label">Cards reviewed</p>
                <p className="dh4-num">
                  {todayStats.cards}
                  <small>/ {CARDS_GOAL}</small>
                </p>
                <TickStrip value={todayStats.cards} goal={CARDS_GOAL} />
                <p className="dh4-note">
                  {todayStats.cards >= CARDS_GOAL
                    ? "Daily deck cleared"
                    : `${CARDS_GOAL - todayStats.cards} cards to go`}
                </p>
              </div>
            </article>

            <article className="dh4-kpi dh4-kpi--act" style={{ "--dh4-j": 2 }}>
              <div className="dh4-kpi-body dh4-copy">
                <p className="dh4-label">Practice time</p>
                <p className="dh4-num">
                  {todayStats.minutes}
                  <small>min</small>
                </p>
                <GroupedTicks value={todayStats.minutes} total={MINUTES_GOAL} />
                <p className="dh4-note">of {MINUTES_GOAL} min goal</p>
              </div>
            </article>
          </div>

          <div className="dh4-main">
            <WeeklyChart dayXp={progress.dayXp} goal={XP_GOAL} />
            <RecentActivity activity={progress.activity} />
          </div>
        </div>
      </div>
    </section>
  );
}