import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Check, ChevronDown, Flame, Heart, LogOut, Menu, Moon, Search, Settings, Star, Sun } from "lucide-react";
import ResearchDialog from "@/components/shell/ResearchDialog";
import { useAuth } from "@/lib/AuthContext";
import { useLearn } from "@/lib/learn-store";
import { XP_GOAL } from "@/data/curriculum";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { upcomingReminderLabel } from "@/lib/reminders";

export default function TopBar({ onMenu }) {
  const { user, logout } = useAuth();
  const { language, languages, setLang, progress, todayStats, theme, toggleTheme, reminders, srs, badges, hearts, maxHearts } = useLearn();
  const navigate = useNavigate();
  const [researchOpen, setResearchOpen] = useState(false);

  const dueCards = Object.values(srs).filter((c) => new Date(c.due) <= new Date()).length;
  const nearBadge = badges.find((b) => !b.unlocked && b.ratio >= 0.5);
  const initials = (user?.full_name || user?.email || "Lisan learner")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 px-4 sm:px-6">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Open menu"
          className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
        >
          <Menu className="h-5 w-5" strokeWidth={1.7} />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-border/80 bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
            >
              <span
                className="grid h-6 w-6 place-items-center rounded-full text-[13px] text-white"
                style={{ background: "hsl(var(--lang))" }}
              >
                {language.emblem}
              </span>
              <span className="hidden sm:inline">{language.label}</span>
              <span className="sm:hidden">{language.short}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 rounded-2xl">
            <DropdownMenuLabel className="font-mono-label text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Learning
            </DropdownMenuLabel>
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onSelect={() => setLang(lang.code)}
                className="gap-3 rounded-xl py-2.5"
              >
                <span
                  className="grid h-7 w-7 place-items-center rounded-full text-sm text-white"
                  style={{ background: `hsl(${lang.accent})` }}
                >
                  {lang.emblem}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium">{lang.label}</span>
                  <span className="block text-xs text-muted-foreground">{lang.native}</span>
                </span>
                {lang.code === language.code && <Check className="h-4 w-4 text-[hsl(var(--lang))]" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <span
            title={`${progress.streak}-day streak`}
            className="flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-2.5 py-1.5 text-sm"
          >
            <Flame className="flame-flicker h-4 w-4 text-[hsl(var(--gold))]" strokeWidth={1.9} />
            <span className="font-medium tabular-nums">{progress.streak}</span>
            <span className="hidden font-mono-label text-[11px] uppercase tracking-[0.1em] text-muted-foreground sm:inline">
              day{progress.streak === 1 ? "" : "s"}
            </span>
          </span>

          <span
            title={`${hearts} of ${maxHearts} hearts`}
            className="flex items-center gap-1 rounded-full border border-border/80 bg-card px-2.5 py-1.5 text-sm"
          >
            <Heart className="h-4 w-4 fill-[hsl(var(--chart-4))] text-[hsl(var(--chart-4))]" strokeWidth={1.9} />
            <span className="font-medium tabular-nums">{hearts}</span>
          </span>

          <span className="flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-2.5 py-1.5 text-sm">
            <Star className="h-4 w-4 text-[hsl(var(--chart-3))]" strokeWidth={1.9} />
            <span className="font-medium tabular-nums">{progress.xpTotal}</span>
            <span className="hidden font-mono-label text-[11px] uppercase tracking-[0.1em] text-muted-foreground sm:inline">xp</span>
          </span>

          <button
            type="button"
            onClick={() => setResearchOpen(true)}
            aria-label="Open Lugha Research"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border/80 bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Search className="h-4 w-4" strokeWidth={1.8} />
            <span className="hidden md:inline">Lugha Research</span>
          </button>

          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Notifications"
                className="relative grid h-9 w-9 place-items-center rounded-full border border-border/80 bg-card text-foreground transition-colors hover:bg-accent"
              >
                <Bell className="h-[18px] w-[18px]" strokeWidth={1.7} />
                {dueCards > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[hsl(var(--lang))]" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 rounded-3xl p-5">
              <p className="font-mono-label text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Today</p>
              <ul className="mt-3 space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted">
                    <Star className="h-3.5 w-3.5" />
                  </span>
                  <span>
                    <span className="block font-medium">
                      {todayStats.xp} of your daily XP goal
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {todayStats.xp >= 50 ? "Goal reached — keep going." : `${50 - todayStats.xp} XP left for today.`}
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted">
                    <Bell className="h-3.5 w-3.5" />
                  </span>
                  <span>
                    <span className="block font-medium">
                      {reminders.enabled ? `Reminder at ${reminders.time}` : "No reminder set"}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {reminders.enabled ? upcomingReminderLabel(reminders) : "Set a daily study time in Settings."}
                    </span>
                  </span>
                </li>
                {nearBadge && (
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span>
                      <span className="block font-medium">{nearBadge.name} is close</span>
                      <span className="block text-xs text-muted-foreground">{nearBadge.progressLabel}</span>
                    </span>
                  </li>
                )}
              </ul>
              {dueCards > 0 && (
                <button
                  type="button"
                  onClick={() => navigate({ to: "/flashcards" })}
                  className="mt-4 w-full rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
                >
                  Review {dueCards} card{dueCards === 1 ? "" : "s"} now
                </button>
              )}
            </PopoverContent>
          </Popover>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="grid h-9 w-9 place-items-center rounded-full border border-border/80 bg-card text-foreground transition-colors hover:bg-accent"
          >
            {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" aria-label="Account" className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="h-9 w-9 border border-border/80">
                  <AvatarFallback className="bg-[hsl(var(--lang))] text-xs font-semibold text-white">{initials || "L"}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 rounded-2xl">
              <DropdownMenuLabel className="pb-1 text-sm font-medium">{user?.full_name || "Lisan learner"}</DropdownMenuLabel>
              <p className="px-2 pb-2 text-xs text-muted-foreground">{user?.email}</p>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-xl">
                <Link to="/settings" className="gap-2">
                  <Settings className="h-4 w-4" /> Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => logout()} className={cn("gap-2 rounded-xl text-destructive")}>
                <LogOut className="h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="h-[3px] w-full bg-muted" aria-hidden="true">
        <div
          className="h-full bg-[hsl(var(--gold))] transition-all duration-500"
          style={{ width: `${Math.min(100, Math.round(((todayStats.xp || 0) / XP_GOAL) * 100))}%` }}
        />
      </div>

      <ResearchDialog open={researchOpen} onOpenChange={setResearchOpen} />
    </header>
  );
}