import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Heart, X } from "lucide-react";
import ChoiceGrid from "@/components/lesson/ChoiceGrid";
import WordBankScreen from "@/components/lesson/WordBankScreen";
import { buildScreens } from "@/data/lessons";
import { useLearn } from "@/lib/learn-store";
import { cn } from "@/lib/utils";

export default function LessonPlayer({ module, lesson }) {
  const { lang, hearts, maxHearts, loseHeart, refillHearts, recordStudy } = useLearn();
  const lessonIndex = Math.max(0, module.lessons.findIndex((l) => l.id === lesson.id));
  const screens = useMemo(() => buildScreens(lang, module.id, lessonIndex), [lang, module.id, lessonIndex]);

  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("idle");
  const [correct, setCorrect] = useState(false);
  const [xp, setXp] = useState(0);
  const [right, setRight] = useState(0);
  const [done, setDone] = useState(false);

  const screen = screens[index];
  const progress = screens.length ? ((index + (status === "answered" ? 1 : 0)) / screens.length) * 100 : 0;

  if (!screens.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl">This lesson has no screens yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">Pick another lesson from the learning path.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const isAnswerReady = screen.kind === "wordbank" ? value.length > 0 : Boolean(value);

  const check = () => {
    if (!isAnswerReady || status === "answered") return;
    const ok =
      screen.kind === "wordbank" ? value.join(" ") === screen.answer.join(" ") : value === screen.correct;
    setCorrect(ok);
    setStatus("answered");
    if (ok) {
      setRight((n) => n + 1);
      setXp((n) => n + 5);
    } else {
      loseHeart();
    }
  };

  const advance = () => {
    if (index + 1 >= screens.length) {
      recordStudy({
        xp: 20 + xp,
        minutes: 3,
        lessonId: lesson.id,
        activity: { type: "lesson", title: lesson.title, detail: `${module.title} · +${20 + xp} XP` },
      });
      setDone(true);
      return;
    }
    setIndex((n) => n + 1);
    setValue("");
    setStatus("idle");
    setCorrect(false);
  };

  if (done) {
    const total = screens.length;
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-12 text-center sm:px-6">
        <p className="font-mono-label text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Lesson complete</p>
        <h1 className="mt-2 font-display text-4xl leading-tight">{lesson.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{module.title}</p>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="rounded-3xl border border-border/70 bg-card px-3 py-5">
            <p className="font-display text-3xl">{right}/{total}</p>
            <p className="mt-1 font-mono-label text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Correct</p>
          </div>
          <div className="rounded-3xl border border-border/70 bg-card px-3 py-5">
            <p className="font-display text-3xl text-[hsl(var(--chart-1))]">+{20 + xp}</p>
            <p className="mt-1 font-mono-label text-[10px] uppercase tracking-[0.12em] text-muted-foreground">XP</p>
          </div>
          <div className="rounded-3xl border border-border/70 bg-card px-3 py-5">
            <p className="font-display text-3xl text-[hsl(var(--chart-4))]">
              {Math.round((right / total) * 100)}%
            </p>
            <p className="mt-1 font-mono-label text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Accuracy</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <Link
            to="/"
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground"
          >
            Back to dashboard
          </Link>
          <Link
            to="/flashcards"
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-border text-sm font-medium hover:bg-accent"
          >
            Review the deck <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-center gap-3">
        <Link
          to="/"
          aria-label="Leave the lesson"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono-label text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {module.title}
          </p>
          <p className="truncate text-sm font-medium">{lesson.title}</p>
        </div>
        <div className="flex items-center gap-0.5" aria-label={`${hearts} of ${maxHearts} hearts left`}>
          {Array.from({ length: maxHearts }).map((_, i) => (
            <Heart
              key={i}
              className={cn(
                "h-4 w-4",
                i < hearts ? "fill-[hsl(var(--chart-4))] text-[hsl(var(--chart-4))]" : "text-border",
              )}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-[hsl(var(--lang))] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {hearts === 0 && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive">Out of hearts — refill to keep going.</p>
          <button
            type="button"
            onClick={refillHearts}
            className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            Refill hearts
          </button>
        </div>
      )}

      <div className="mt-6">
        <p className="font-mono-label text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {screen.title} · {index + 1} / {screens.length}
        </p>
        <div className="mt-3">
          {screen.kind === "wordbank" ? (
            <WordBankScreen screen={screen} value={value ? value.split(" ") : []} onChange={(words) => setValue(words.join(" "))} locked={status === "answered"} lang={lang} />
          ) : (
            <ChoiceGrid screen={screen} value={value} onChange={setValue} locked={status === "answered"} lang={lang} />
          )}
        </div>
      </div>

      {status === "answered" && (
        <div
          className={cn(
            "mt-5 rounded-2xl border px-4 py-3",
            correct
              ? "border-[hsl(var(--chart-2)/0.45)] bg-[hsl(var(--chart-2)/0.08)]"
              : "border-destructive/40 bg-destructive/5",
          )}
        >
          <p className={cn("flex items-center gap-2 text-sm font-semibold", correct ? "text-[hsl(var(--chart-2))]" : "text-destructive")}>
            {correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {correct ? "Correct" : "Correct answer"}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{screen.note}</p>
          {screen.kind === "wordbank" && !correct && (
            <p className="mt-1 text-sm font-medium">{screen.answer.join(" ")}</p>
          )}
        </div>
      )}

      <div className="mt-6">
        {status === "answered" ? (
          <button
            type="button"
            onClick={advance}
            className="h-12 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {index + 1 >= screens.length ? "Finish lesson" : "Continue"}
          </button>
        ) : (
          <button
            type="button"
            onClick={check}
            disabled={!isAnswerReady || hearts === 0}
            className="h-12 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Check
          </button>
        )}
      </div>
    </div>
  );
}