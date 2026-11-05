export const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Local calendar day key, YYYY-MM-DD (never UTC — the learner's own day). */
export function dayKey(date = new Date()) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function shiftDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function weekStart(date = new Date()) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const offset = (d.getDay() + 6) % 7; // Monday-first
  d.setDate(d.getDate() - offset);
  return d;
}

/** The Mon → Sun week that contains `date`, each entry with its day key. */
export function weekDates(date = new Date()) {
  const start = weekStart(date);
  return WEEK_LABELS.map((label, i) => {
    const d = shiftDays(start, i);
    return { label, date: d, key: dayKey(d) };
  });
}

export function formatLongDate(date = new Date()) {
  return date.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}