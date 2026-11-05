import { useMemo, useState } from "react";
import { dayKey, weekDates } from "@/lib/dates";

const fmt = (n) => Math.round(n).toLocaleString("en-US");

export default function WeeklyChart({ dayXp, goal }) {
  const days = useMemo(() => weekDates(new Date()), []);
  const todayKey = dayKey();
  const [activeKey, setActiveKey] = useState(null);

  const values = days.map((d) => (d.key > todayKey ? null : dayXp[d.key] || 0));
  const past = values.filter((v) => v !== null);
  const weekTotal = past.reduce((sum, v) => sum + v, 0);
  const highest = Math.max(goal, ...past, 0);
  const top = highest + goal * 0.08;
  const daysWithData = past.filter((v) => v > 0).length;
  const average = daysWithData ? weekTotal / daysWithData : 0;

  const todayIndex = days.findIndex((d) => d.key === todayKey);
  const activeIndex = activeKey ? days.findIndex((d) => d.key === activeKey) : todayIndex;
  const activeValue = values[activeIndex];

  const metric =
    activeIndex === todayIndex || activeIndex < 0
      ? weekTotal === 0
        ? "No XP yet this week"
        : `Avg ${fmt(average)} / day`
      : `${days[activeIndex].label} ${fmt(activeValue || 0)} XP`;

  return (
    <article className="dh4-card dh4-chart" style={{ "--dh4-j": 3 }}>
      <div className="dh4-cardhead">
        <h3 className="dh4-h3">XP this week</h3>
        <span className="dh4-avg" aria-live="polite">
          {metric.includes("Avg") ? (
            <>
              Avg <b>{fmt(average)}</b> / day
            </>
          ) : (
            metric
          )}
        </span>
      </div>

      <div className="dh4-plotwrap">
        <div
          className="dh4-plot"
          role="group"
          aria-label={`XP earned each day this week. Weekly total ${weekTotal}.`}
          style={{ "--dh4-goal": `${(goal / top) * 100}%` }}
          onMouseLeave={() => setActiveKey(null)}
        >
          <div className="dh4-goal" aria-hidden="true">
            <span>Goal {goal} XP</span>
          </div>
          {days.map((day, i) => {
            const value = values[i];
            const isFuture = value === null;
            const isToday = day.key === todayKey;
            const isActive = (activeKey ? activeKey === day.key : isToday) && !isFuture;
            return (
              <button
                key={day.key}
                type="button"
                className={`dh4-col ${isFuture ? "is-future" : ""} ${isToday ? "is-today" : ""} ${isActive ? "is-active" : ""}`}
                style={{ "--dh4-i": i }}
                disabled={isFuture}
                tabIndex={isFuture ? -1 : 0}
                onMouseEnter={() => !isFuture && setActiveKey(day.key)}
                onFocus={() => !isFuture && setActiveKey(day.key)}
                onBlur={() => setActiveKey(null)}
                onClick={() => !isFuture && setActiveKey(activeKey === day.key ? null : day.key)}
                aria-label={`${day.label}${isToday ? " (today)" : ""}, ${isFuture ? "no data yet" : `${fmt(value)} XP`}`}
              >
                <span className="dh4-reveal" style={{ "--dh4-h": `${(Math.max(value || 0, value ? 6 : 0) / top) * 100}%` }}>
                  <span className="dh4-fill">
                    <span className="dh4-grad" />
                  </span>
                </span>
                <span className="dh4-day" aria-hidden="true">
                  <span className="dh4-day-name">{day.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
}