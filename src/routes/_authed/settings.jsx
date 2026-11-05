import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, Check, Moon, RotateCcw, Sun, Trash2 } from "lucide-react";
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
import { useLearn } from "@/lib/learn-store";
import { upcomingReminderLabel } from "@/lib/reminders";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Lisan" },
      { name: "description", content: "Choose your language, theme and daily study reminder." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { lang, setLang, theme, toggleTheme, reminders, setReminders, resetProgress, progress } = useLearn();
  const [dialogOpen, setDialogOpen] = useState(false);

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
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              type="button"
              onClick={() => setLang(language.code)}
              className={cn(
                "rounded-2xl border p-4 text-left transition-colors",
                lang === language.code ? "border-[hsl(var(--lang))] bg-[hsl(var(--lang)/0.06)]" : "border-border hover:bg-accent/50",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className="grid h-9 w-9 place-items-center rounded-full text-sm text-white"
                  style={{ background: `hsl(${language.accent})` }}
                >
                  {language.emblem}
                </span>
                {lang === language.code && <Check className="h-4 w-4" style={{ color: "hsl(var(--lang))" }} />}
              </div>
              <p className="mt-3 text-sm font-medium">{language.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{language.native}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-[26px] border border-border/70 bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Appearance</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Currently using the {theme === "dark" ? "dark" : "light"} theme.
            </p>
          </div>
          <Button variant="outline" className="rounded-full" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            Switch to {theme === "dark" ? "light" : "dark"}
          </Button>
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