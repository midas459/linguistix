/** The three KPI instruments: thin, flat-capped tick marks driven by value / goal. */

export function RadialGauge({ value, goal }) {
  const ticks = 40;
  const pct = goal ? Math.min(1, value / goal) : 0;
  const on = Math.round(pct * ticks);
  const angle = (i) => (i / ticks) * 2 * Math.PI;

  return (
    <div className="dh4-gauge" role="img" aria-label={`${Math.round(pct * 100)}% of daily goal`}>
      <svg viewBox="0 0 144 144" aria-hidden="true">
        {Array.from({ length: ticks }, (_, i) => {
          const a = angle(i);
          const s = Math.sin(a);
          const c = -Math.cos(a);
          return (
            <line
              key={`t${i}`}
              x1={72 + 36.6 * s}
              y1={72 + 36.6 * c}
              x2={72 + 62.7 * s}
              y2={72 + 62.7 * c}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeOpacity={i < on ? 1 : 0.18}
            />
          );
        })}
        {Array.from({ length: ticks / 5 }, (_, k) => {
          const i = k * 5;
          const a = angle(i);
          return (
            <circle
              key={`d${i}`}
              cx={72 + 71.1 * Math.sin(a)}
              cy={72 - 71.1 * Math.cos(a)}
              r="1.3"
              fill="currentColor"
              fillOpacity={i < on ? 1 : 0.18}
            />
          );
        })}
      </svg>
      <span className="dh4-gauge-pct">{Math.round(pct * 100)}%</span>
    </div>
  );
}

export function TickStrip({ value, goal, ticks = 41, markerEvery = 10 }) {
  const pct = goal ? Math.min(1, value / goal) : 0;
  const on = Math.round(pct * ticks);

  return (
    <div className="dh4-strip" role="img" aria-label={`${Math.round(pct * 100)}% of the daily target`}>
      <div className="dh4-ticks">
        {Array.from({ length: ticks }, (_, i) => (
          <span className="dh4-tcell" key={i}>
            {i % markerEvery === 0 && <span className={`dh4-mark ${i >= on ? "is-off" : ""}`} />}
            <span className={`dh4-t ${i >= on ? "is-off" : ""}`} />
          </span>
        ))}
      </div>
    </div>
  );
}

export function GroupedTicks({ value, total = 60, groups = 12, perGroup = 5 }) {
  const lit = Math.min(groups * perGroup, Math.round((value / total) * groups * perGroup));

  return (
    <div className="dh4-groups" role="img" aria-label={`${value} of ${total} minutes`}>
      {Array.from({ length: groups }, (_, g) => (
        <span className="dh4-group" key={g}>
          {Array.from({ length: perGroup }, (_, j) => {
            const index = g * perGroup + j;
            return (
              <span
                key={j}
                className={`dh4-t ${index >= lit ? "is-off" : ""} ${index % 15 === 0 ? "is-major" : ""}`}
              />
            );
          })}
        </span>
      ))}
    </div>
  );
}