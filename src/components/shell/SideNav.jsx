import { Link, useLocation } from "@tanstack/react-router";
import { Award, Layers, Map, MessageCircle, Settings, Type } from "lucide-react";
import { useLearn } from "@/lib/learn-store";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { to: "/", label: "Learn Map", icon: Map, hint: "Your path" },
  { to: "/alphabet", label: "Alphabet Lab", icon: Type, hint: "Scripts & sounds" },
  { to: "/flashcards", label: "Flashcards", icon: Layers, hint: "Spaced repetition" },
  { to: "/tutor", label: "Kalam AI", icon: MessageCircle, hint: "Tutor & roleplay" },
  { to: "/badges", label: "Badges", icon: Award, hint: "Achievements" },
  { to: "/settings", label: "Settings", icon: Settings, hint: "Reminders & theme" },
];

export default function SideNav({ onNavigate }) {
  const { pathname } = useLocation();
  const { language, progress, unlockedBadges, badges } = useLearn();

  return (
    <div className="flex h-full flex-col gap-8 px-5 py-6">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-3">
        <span
          className="grid h-10 w-10 place-items-center rounded-2xl text-lg font-semibold text-white"
          style={{ background: "hsl(var(--lang))", fontFamily: "var(--font-display)" }}
        >
          {language.emblem}
        </span>
        <span className="min-w-0">
          <span className="block font-display text-xl leading-none tracking-tight">Lisan</span>
          <span className="mt-1 block truncate font-mono-label text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {language.label}
          </span>
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-card text-foreground shadow-sm ring-1 ring-border/70"
                  : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
              )}
            >
              <Icon
                className={cn("h-[18px] w-[18px] shrink-0 transition-colors", active ? "text-[hsl(var(--lang))]" : "")}
                strokeWidth={1.7}
              />
              <span className="flex-1 font-medium">{item.label}</span>
              {active && <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--lang))]" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-border/70 bg-card/70 p-4">
        <p className="font-mono-label text-[11px] uppercase tracking-[0.14em] text-muted-foreground">This language</p>
        <p className="mt-2 font-display text-2xl leading-none">{progress.xpTotal} XP</p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {progress.lessons.length} lessons · {unlockedBadges.length}/{badges.length} badges
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (unlockedBadges.length / badges.length) * 100)}%`, background: "hsl(var(--lang))" }}
          />
        </div>
      </div>
    </div>
  );
}