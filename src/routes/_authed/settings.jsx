import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, Check, Palette, RotateCcw, Trash2 } from "lucide-react";
import PageHeader from "@/components/shell/PageHeader";
import ReminderDialog from "@/components/settings/ReminderDialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LANGUAGES } from "@/data/curriculum";
import { LANGUAGE_CATALOG } from "@/data/language-catalog";
import { useLearn } from "@/lib/learn-store";
import { upcomingReminderLabel } from "@/lib/reminders";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Linguistix" },
      { name: "description", content: "Choose your language, theme and daily study reminder." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { lang, setLang, theme, setTheme, reminders, setReminders, resetProgress, progress } = useLearn();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [languageQuery, setLanguageQuery] = useState("");
  const availableCodes = new Set(LANGUAGES.map((item) => item.code));
  const filteredLanguages = LANGUAGE_CATALOG.filter((item) =>
    item.name.toLowerCase().includes(languageQuery.trim().toLowerCase()) || item.code.includes(languageQuery.trim().toLowerCase()),
  );
  const themes = [
    { id: "ocean", name: "Ocean", detail: "Calm teal and sea blue", swatch: "bg-cyan-600" },
    { id: "forest", name: "Forest", detail: "Natural greens", swatch: "bg-green-700" },
    { id: "sunset", name: "Sunset", detail: "Warm orange and amber", swatch: "bg-orange-500" },
    { id: "lavender", name: "Lavender", detail: "Soft violet tones", swatch: "bg-violet-500" },
    { id: "midnight", name: "Midnight", detail: "Deep navy dark mode", swatch: "bg-slate-950" },
  ];

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Settings"
        title="Make the app fit your week"
        description="Your progress, streak and review schedule live on this device."
      />

      <section className="mt-8 rounded-[26px] border border-border/70 bg-card p-5 sm:p-6">
        <h2 className="text-base font-semibold">Language</h2>
        <p className="mt-1 text-sm text-muted-foreground">Each language keeps its own XP, streak and review queue.</p>
        <div className="mt-4">
          <input
            value={languageQuery}
            onChange={(event) => setLanguageQuery(event.target.value)}
            placeholder="Search world languages (name or ISO code)…"
            aria-label="Search languages"
            className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {filteredLanguages.length} languages in the catalogue · Courses are enabled as learning content is published.
          </p>
          <div className="mt-3 grid max-h-[440px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {filteredLanguages.map((item) => {
              const course = LANGUAGES.find((language) => language.code === item.code);
              const enabled = availableCodes.has(item.code);
              return (
                <button
                  key={item.code}
                  type="button"
                  disabled={!enabled}
                  onClick={() => setLang(item.code)}
                  className={cn(
                    "flex items-center justify-between rounded-xl border p-3 text-left transition-colors",
                    enabled ? "border-border hover:bg-accent/50" : "cursor-not-allowed border-border/60 opacity-60",
                    lang === item.code && "border-[hsl(var(--lang))] bg-[hsl(var(--lang)/0.08)]",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground">{item.code.toUpperCase()} · {course?.native || "Course coming soon"}</span>
                  </span>
                  <span className="ml-2 shrink-0 text-xs font-medium text-muted-foreground">
                    {enabled ? (lang === item.code ? "Selected ✓" : "Available") : "Coming soon"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-[26px] border border-border/70 bg-card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Appearance</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Choose one of five custom colour themes. Your choice is saved on this device.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTheme(item.id)}
              aria-pressed={theme === item.id}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                theme === item.id ? "border-[hsl(var(--lang))] bg-[hsl(var(--lang)/0.07)]" : "border-border hover:bg-accent/50",
              )}
            >
              <span className={cn("h-10 w-10 shrink-0 rounded-xl", item.swatch)} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{item.name}</span>
                <span className="block text-xs text-muted-foreground">{item.detail}</span>
              </span>
              {theme === item.id && <Check className="h-4 w-4" style={{ color: "hsl(var(--lang))" }} />}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-[26px] border border-border/70 bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Reminders</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {reminders.enabled
                ? `Next reminder: ${upcomingReminderLabel(reminders)}.`
                : "No reminder yet — a fixed daily time is the easiest way to keep a streak."}
            </p>
          </div>
          <Button className="rounded-full" onClick={() => setDialogOpen(true)}>
            <Bell className="h-4 w-4" />
            {reminders.enabled ? "Edit reminder" : "Set reminder"}
          </Button>
        </div>
        {reminders.enabled && (
          <div className="mt-4 flex flex-wrap gap-2">
            {["M", "T", "W", "T", "F", "S", "S"].map((label, i) => {
              const order = [1, 2, 3, 4, 5, 6, 0];
              const active = reminders.days.includes(order[i]);
              return (
                <span
                  key={`${label}-${i}`}
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-lg border text-xs font-medium",
                    active ? "border-transparent bg-primary text-primary-foreground" : "border-border text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-5 rounded-[26px] border border-border/70 bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Progress</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {progress.xpTotal} XP · {progress.lessons.length} lessons · {progress.cardsTotal} cards reviewed in this language.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="rounded-full text-destructive">
                <RotateCcw className="h-4 w-4" /> Reset progress
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all progress?</AlertDialogTitle>
                <AlertDialogDescription>
                  Every language loses its XP, streak, completed lessons and review schedule. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full">Keep my progress</AlertDialogCancel>
                <AlertDialogAction className="rounded-full" onClick={resetProgress}>
                  Reset everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>

      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Trash2 className="h-3.5 w-3.5" />
        Data is stored in this browser. Clearing site data removes your progress too.
      </p>

      <ReminderDialog open={dialogOpen} onOpenChange={setDialogOpen} reminders={reminders} onSave={setReminders} />
    </div>
  );
}