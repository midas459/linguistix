import { useMemo, useState } from "react";
import { Search, Volume2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FLASHCARDS } from "@/data/cards";
import { LANGUAGES } from "@/data/curriculum";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";

/** Lugha Research — search every deck in every language at once. */
export default function ResearchDialog({ open, onOpenChange }) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return LANGUAGES.flatMap((language) =>
      (FLASHCARDS[language.code] || [])
        .filter((card) =>
          [card.front, card.frontSub, card.translit, card.meaning, card.breakdown, card.example, card.exampleMeaning]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(q),
        )
        .map((card) => ({ card, language })),
    ).filter((row) => scope === "all" || row.language.code === scope);
  }, [query, scope]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Lugha Research</DialogTitle>
          <DialogDescription>
            Search letters, roots, grammar notes and example sentences across all three languages.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try ك-ت-ب, umlaut, の or “please”"
            className="h-11 rounded-full pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[{ code: "all", label: "All languages" }, ...LANGUAGES].map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => setScope(item.code)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                scope === item.code
                  ? "border-[hsl(var(--lang))] bg-[hsl(var(--lang)/0.1)] text-[hsl(var(--lang))]"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              {item.label || item.short}
            </button>
          ))}
        </div>

        <div className="max-h-[46vh] space-y-2 overflow-y-auto pr-1">
          {query.trim() === "" && (
            <p className="rounded-2xl bg-muted/60 px-4 py-6 text-center text-sm text-muted-foreground">
              Type a letter, a root or an English word to research it.
            </p>
          )}
          {query.trim() !== "" && results.length === 0 && (
            <p className="rounded-2xl bg-muted/60 px-4 py-6 text-center text-sm text-muted-foreground">
              Nothing in the decks matches “{query}” yet.
            </p>
          )}
          {results.map(({ card, language }) => (
            <div key={`${language.code}-${card.id}`} className="rounded-2xl border border-border/70 bg-card p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-lg font-medium leading-tight",
                      language.code === "ar" && "arabic",
                      language.code === "ja" && "japanese",
                    )}
                  >
                    {card.front}
                    <span className="ml-2 font-mono-label text-[11px] font-normal text-muted-foreground">
                      {card.translit}
                    </span>
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{card.meaning}</p>
                </div>
                <button
                  type="button"
                  onClick={() => speak(card.front, language.speech)}
                  aria-label={`Hear ${card.front}`}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{card.breakdown}</p>
              {card.example && (
                <p className="mt-1.5 text-xs text-[hsl(var(--lang))]">
                  {card.example} — {card.exampleMeaning}
                </p>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}