const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function nextOccurrence(reminders, from = new Date()) {
  const [h, m] = reminders.time.split(":").map(Number);
  for (let i = 0; i < 8; i++) {
    const candidate = new Date(from);
    candidate.setDate(candidate.getDate() + i);
    candidate.setHours(h, m, 0, 0);
    if (candidate <= from) continue;
    if (reminders.days.includes(candidate.getDay())) return candidate;
  }
  return null;
}

export function daysUntil(date) {
  const diff = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export function nextReminderDate(reminders) {
  return reminders.enabled ? nextOccurrence(reminders) : null;
}

export function upcomingReminderLabel(reminders) {
  const next = nextReminderDate(reminders);
  if (!next) return "No upcoming reminder.";
  const today = new Date();
  const sameDay = next.toDateString() === today.toDateString();
  return `${sameDay ? "Today" : DAY_NAMES[next.getDay()]} at ${reminders.time}`;
}