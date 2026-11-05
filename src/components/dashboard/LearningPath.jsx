import { Check, ChevronRight, Lock } from "lucide-react";
import { MODULES } from "@/data/curriculum";
import { useLearn } from "@/lib/learn-store";
import { cn } from "@/lib/utils";

export function nextLesson(modules, completed) {
  for (const module of modules) {
    for (const lesson of module.lessons) {
      if (!completed.includes(lesson.id)) return { module, lesson };
    }
  }
  const last = modules[modules.length - 1];
  return { module: last, lesson: last.lessons[last.lessons.length - 1] };
}

export default function LearningPath({ onSelect }) {
  const { lang, progress } = useLearn();
  const modules = MODULES[lang] || MODULES.ar;
  const completed = progress.lessons;
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <section className="mx-auto w-full max-w-[1240px] px-4 pt-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono-label text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Learning path</p>
          <h2 className="mt-2 font-display text-3xl leading-tight tracking-tight sm:text-[2.1rem]">Your route to fluency</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Four modules, each built on the one before it. Finish a lesson to unlock the next step and bank XP.
          </p>
        </div>
        <p className="font-mono-label text-xs text-muted-foreground">
          {completed.filter((id) => modules.some((m) => m.lessons.some((l) => l.id === id))).length} / {totalLessons} lessons done
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {modules.map((module, mi) => {
          const done = module.lessons.filter((l) => completed.includes(l.id)).length;
          const moduleComplete = done === module.lessons.length;
          return (
            <div
              key={module.id}
              className="rounded-[26px] border border-border/70 bg-card p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold",
                      moduleComplete ? "text-white" : "bg-muted text-muted-foreground",
                    )}
                    style={moduleComplete ? { background: "hsl(var(--lang))" } : undefined}
                  >
                    {moduleComplete ? <Check className="h-4 w-4" strokeWidth={2.4} /> : mi + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold leading-snug">{module.title}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{module.summary}</p>
                  </div>
                </div>
                <span className="font-mono-label text-xs text-muted-foreground">
                  {done}/{module.lessons.length}
                </span>
              </div>

              <div className="relative mt-5 space-y-2 md:pl-2">
                <span
                  aria-hidden="true"
                  className="absolute left-[26px] top-2 bottom-2 w-px border-l border-dashed border-border md:left-[30px]"
                />
                {module.lessons.map((lesson, li) => {
                  const isDone = completed.includes(lesson.id);
                  const previousDone = li === 0 || completed.includes(module.lessons[li - 1].id);
                  const locked = !isDone && !previousDone;
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => !locked && onSelect({ module, lesson })}
                      disabled={locked}
                      className={cn(
                        "group relative flex w-full items-center gap-4 rounded-2xl border border-transparent px-3 py-3 text-left transition-colors",
                        locked ? "opacity-55" : "hover:border-border hover:bg-accent/50",
                      )}
                    >
                      <span
                        className={cn(
                          "relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[13px] font-medium",
                          isDone
                            ? "border-transparent text-white"
                            : locked
                              ? "border-border bg-background text-muted-foreground"
                              : "border-[hsl(var(--lang))] bg-background text-[hsl(var(--lang))]",
                        )}
                        style={isDone ? { background: "hsl(var(--lang))" } : undefined}
                      >
                        {isDone ? <Check className="h-4 w-4" strokeWidth={2.6} /> : locked ? <Lock className="h-3.5 w-3.5" /> : li + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{lesson.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">{lesson.subtitle}</span>
                      </span>
                      <span className="hidden font-mono-label text-[11px] text-muted-foreground sm:block">+20 XP</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}