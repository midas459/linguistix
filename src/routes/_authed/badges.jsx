import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/shell/PageHeader";
import BadgeIcon from "@/components/badges/BadgeIcon";
import { useLearn } from "@/lib/learn-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/badges")({
  head: () => ({
    meta: [
      { title: "Badges — Lisan" },
      { name: "description", content: "Every milestone in your language journey and how close you are to each one." },
    ],
  }),
  component: BadgesPage,
});

function BadgesPage() {
  const { badges, unlockedBadges } = useLearn();

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Achievements"
        title="Milestones, not trophies"
        description="Each badge marks a real threshold in the work — a module finished, a week held, a hundred cards behind you."
        actions={
          <span className="font-mono-label text-xs text-muted-foreground">
            {unlockedBadges.length} of {badges.length} unlocked
          </span>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((badge) => (
          <article
            key={badge.id}
            className={cn(
              "flex flex-col rounded-[26px] border p-5",
              badge.unlocked ? "border-transparent bg-card" : "border-dashed border-border bg-card/40",
            )}
            style={badge.unlocked ? { boxShadow: "inset 0 0 0 1px hsl(var(--lang) / 0.3)" } : undefined}
          >
            <div className="flex items-start justify-between">
              <span
                className={cn(
                  "grid h-12 w-12 place-items-center rounded-2xl",
                  badge.unlocked ? "text-white" : "bg-muted text-muted-foreground",
                )}
                style={badge.unlocked ? { background: "hsl(var(--lang))" } : undefined}
              >
                <BadgeIcon name={badge.icon} className="h-5 w-5" />
              </span>
              <span className="font-mono-label text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {badge.unlocked ? "Unlocked" : "In progress"}
              </span>
            </div>
            <h2 className="mt-4 text-base font-semibold">{badge.name}</h2>
            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{badge.description}</p>
            <div className="mt-4">
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${badge.ratio * 100}%`, background: "hsl(var(--lang))" }}
                />
              </div>
              <p className="mt-2 font-mono-label text-[11px] text-muted-foreground">{badge.progressLabel}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}