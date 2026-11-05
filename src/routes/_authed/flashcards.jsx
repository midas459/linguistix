import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import PageHeader from "@/components/shell/PageHeader";
import Flashcard from "@/components/flashcards/Flashcard";
import { Button } from "@/components/ui/button";
import { CARD_CATEGORIES, FLASHCARDS } from "@/data/cards";
import { useLearn } from "@/lib/learn-store";
import { cn } from "@/lib/utils";

const RATINGS = [
  { id: "again", label: "Again", days: "1d", tone: "border-[hsl(var(--chart-1)/0.45)] hover:bg-[hsl(var(--chart-1)/0.1)]" },
  { id: "hard", label: "Hard", days: "2d", tone: "border-[hsl(var(--chart-3)/0.45)] hover:bg-[hsl(var(--chart-3)/0.1)]" },
  { id: "good", label: "Good", days: "4d", tone: "border-[hsl(var(--chart-2)/0.45)] hover:bg-[hsl(var(--chart-2)/0.1)]" },
  { id: "easy", label: "Easy", days: "7d", tone: "border-[hsl(var(--chart-4)/0.45)] hover:bg-[hsl(var(--chart-4)/0.1)]" },
];

export const Route = createFileRoute("/_authed/flashcards")({
  head: () => ({
    meta: [
      { title: "Flashcards — Lisan" },
      { name: "description", content: "Spaced repetition decks for letters, verbs, sentences and expressions." },
    ],
  }),
  component: FlashcardsPage,
});

function FlashcardsPage() {
  const { lang, srs, rateCard, progress } = useLearn();
  const [category, setCategory] = useState("all");
  const [session, setSession] = useState(0);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const all = FLASHCARDS[lang] || [];
  const deck = useMemo(() => (category === "all" ? all : all.filter((c) => c.category === category)), [all, category]);
  const queue = useMemo(
    () => deck.filter((card) => !srs[card.id] || new Date(srs[card.id].due) <= new Date()),
    // a fresh session (or filter) snapshots what is due right now
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deck, session, lang],
  );

  const card = deck.find((c) => c.id === queue[index]);
  const total = queue.length;
  const finished = index >= total;

  const rate = (rating) => {
    if (!card) return;
    rateCard(card.id, rating);
    setFlipped(false);
    setIndex((i) => i + 1);
  };

  const restart = () => {
    setSession((s) => s + 1);
    setIndex(0);
    setFlipped(false);
  };

  return (
    <div className="mx-auto w-full max-w-[880px] px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow="Flashcards"
        title="Spaced repetition, one card at a time"
        description="Rate honestly — the interval you pick decides when this card comes back. Every review banks 4 XP."
        actions={
          <span className="font-mono-label text-xs text-muted-foreground">
            {progress.cardsTotal} cards reviewed all time
          </span>
        }
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {[{ id: "all", label: "All" }, ...CARD_CATEGORIES].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setCategory(item.id);
              setIndex(0);
              setFlipped(false);
            }}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              category === item.id
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {total === 0 ? (
          <div className="rounded-[28px] border border-dashed border-border bg-card/50 p-10 text-center">
            <p className="text-lg font-medium">Nothing due in this deck</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Every card here is scheduled for later. Try another category, or come back when your next review is due.
            </p>
            <Button variant="outline" className="mt-5 rounded-full" onClick={restart}>
              <RotateCcw className="h-4 w-4" /> Check again
            </Button>
          </div>
        ) : finished ? (
          <div className="rounded-[28px] border border-border/70 bg-card p-10 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full" style={{ background: "hsl(var(--lang) / 0.14)" }}>
              <Sparkles className="h-5 w-5" style={{ color: "hsl(var(--lang))" }} />
            </span>
            <p className="mt-4 text-lg font-medium">{total} cards reviewed</p>
            <p className="mt-2 text-sm text-muted-foreground">+{total * 4} XP banked. Your next reviews are scheduled.</p>
            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <Button className="rounded-full" onClick={restart}>
                <RotateCcw className="h-4 w-4" /> Study again
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/">
                  Back to the map <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="font-mono-label text-xs text-muted-foreground">
                Card {index + 1} of {total}
              </p>
              <p className="font-mono-label text-xs text-muted-foreground">{category === "all" ? "All decks" : "Filtered deck"}</p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(index / total) * 100}%`, background: "hsl(var(--lang))" }}
              />
            </div>

            <div className="mt-5">
              <Flashcard card={card} lang={lang} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
            </div>

            {flipped ? (
              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {RATINGS.map((rating) => (
                  <button
                    key={rating.id}
                    type="button"
                    onClick={() => rate(rating.id)}
                    className={cn(
                      "rounded-2xl border bg-card px-3 py-3 text-center transition-colors",
                      rating.tone,
                    )}
                  >
                    <span className="block text-sm font-medium">{rating.label}</span>
                    <span className="mt-0.5 block font-mono-label text-[11px] text-muted-foreground">{rating.days}</span>
                  </button>
                ))}
              </div>
            ) : (
              <Button className="mt-5 h-12 w-full rounded-2xl" onClick={() => setFlipped(true)}>
                Reveal the answer
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default FlashcardsPage;