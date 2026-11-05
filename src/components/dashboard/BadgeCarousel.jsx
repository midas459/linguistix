import { Link } from "@tanstack/react-router";
import { ArrowRight, Lock } from "lucide-react";
import BadgeIcon from "@/components/badges/BadgeIcon";
import { useLearn } from "@/lib/learn-store";
import { cn } from "@/lib/utils";

export default function BadgeCarousel() {
  const { badges, unlockedBadges } = useLearn();

  return (
    <section className="mx-auto w-full max-w-[1240px] px-4 pt-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono-label text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Achievements</p>
          <h2 className="mt-2 font-display text-2xl leading-tight tracking-tight sm:text-3xl">Milestones along the way</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono-label text-xs text-muted-foreground">
            {unlockedBadges.length} / {badges.length} unlocked
          </span>
          <Link to="/badges" className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
            All badges <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="scrollbar-none -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {badges.map((badge) => (
          <article
            key={badge.id}
            className={cn(
              "w-[260px] shrink-0 snap-start rounded-[24px] border p-5 transition-colors sm:w-[280px]",
              badge.unlocked ? "border-transparent bg-card" : "border-dashed border-border bg-card/40",
            )}
            style={badge.unlocked ? { boxShadow: "inset 0 0 0 1px hsl(var(--lang) / 0.28)" } : undefined}
          >
            <div className="flex items-start justify-between">
              <span
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-2xl",
                  badge.unlocked ? "text-white" : "bg-muted text-muted-foreground",
                )}
                style={badge.unlocked ? { background: "hsl(var(--lang))" } : undefined}
              >
                {badge.unlocked ? <BadgeIcon name={badge.icon} /> : <Lock className="h-4 w-4" strokeWidth={1.8} />}
              </span>
              <span className="font-mono-label text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {badge.unlocked ? "Unlocked" : badge.progressLabel}
              </span>
            </div>
            <h3 className="mt-4 text-base font-semibold leading-snug">{badge.name}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{badge.description}</p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${badge.ratio * 100}%`, background: "hsl(var(--lang))" }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}