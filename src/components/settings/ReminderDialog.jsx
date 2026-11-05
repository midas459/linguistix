import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const DAYS = [
  { id: 1, label: "M" },
  { id: 2, label: "T" },
  { id: 3, label: "W" },
  { id: 4, label: "T" },
  { id: 5, label: "F" },
  { id: 6, label: "S" },
  { id: 0, label: "S" },
];

export default function ReminderDialog({ open, onOpenChange, reminders, onSave }) {
  const [time, setTime] = useState(reminders.time);
  const [days, setDays] = useState(reminders.days);
  const [enabled, setEnabled] = useState(reminders.enabled);
  const [permission, setPermission] = useState("default");

  useEffect(() => {
    if (open) {
      setTime(reminders.time);
      setDays(reminders.days);
      setEnabled(reminders.enabled);
      if (typeof window !== "undefined" && "Notification" in window) setPermission(Notification.permission);
    }
  }, [open, reminders]);

  const askPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const toggleDay = (id) =>
    setDays((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Study reminder</DialogTitle>
          <DialogDescription>
            A daily nudge at the time you actually have free. It stays on this device.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Daily reminder</p>
              <p className="text-xs text-muted-foreground">{enabled ? `On at ${time}` : "Currently off"}</p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <div>
            <label htmlFor="reminder-time" className="font-mono-label text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Time
            </label>
            <Input
              id="reminder-time"
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="mt-2 h-11 rounded-xl"
            />
          </div>

          <div>
            <p className="font-mono-label text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Days</p>
            <div className="mt-2 flex gap-1.5">
              {DAYS.map((day, i) => (
                <button
                  key={`${day.id}-${i}`}
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  aria-pressed={days.includes(day.id)}
                  aria-label={["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day.id]}
                  className={cn(
                    "h-9 flex-1 rounded-xl border text-xs font-medium transition-colors",
                    days.includes(day.id)
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {permission !== "granted" && (
            <button
              type="button"
              onClick={askPermission}
              className="flex w-full items-center gap-3 rounded-2xl bg-muted px-4 py-3 text-left"
            >
              <Bell className="h-4 w-4 shrink-0" />
              <span className="text-xs leading-relaxed text-muted-foreground">
                Allow browser notifications so the reminder can reach you even when this tab is in the background.
              </span>
            </button>
          )}
        </div>

        <DialogFooter className="mt-2 gap-2 sm:gap-2">
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="rounded-full"
            onClick={() => {
              onSave({ time, days, enabled });
              onOpenChange(false);
            }}
          >
            Save reminder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}