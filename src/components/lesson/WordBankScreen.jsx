import { cn } from "@/lib/utils";

/** Word bank: tap a tile into the sentence, tap it again to send it back. */
export default function WordBankScreen({ screen, value = [], onChange, locked, lang }) {
  const scriptClass = lang === "ar" ? "arabic" : lang === "ja" ? "japanese" : "";
  const used = value.reduce((acc, word) => ({ ...acc, [word]: (acc[word] || 0) + 1 }), {});

  const available = screen.tiles.filter((word) => {
    const needed = screen.tiles.filter((w) => w === word).length;
    return (used[word] || 0) < needed;
  });

  return (
    <div>
      <p className="text-lg font-medium leading-snug">{screen.prompt}</p>
      <p className="mt-1 text-sm text-muted-foreground">{screen.translation}</p>

      <div
        dir={lang === "ar" ? "rtl" : "ltr"}
        className={cn(
          "mt-5 flex min-h-20 flex-wrap items-center gap-2 rounded-3xl border border-dashed border-border bg-muted/40 p-3.5",
          value.length === 0 && "justify-center",
        )}
      >
        {value.length === 0 && (
          <span className="font-mono-label text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Tap the words in order
          </span>
        )}
        {value.map((word, i) => (
          <button
            key={`${word}-${i}`}
            type="button"
            disabled={locked}
            onClick={() => onChange(value.filter((_, index) => index !== i))}
            className={cn(
              "rounded-xl border border-[hsl(var(--lang)/0.5)] bg-card px-3 py-2 text-base font-medium",
              scriptClass,
            )}
          >
            {word}
          </button>
        ))}
      </div>

      <div className={cn("mt-3 flex flex-wrap gap-2", lang === "ar" && "justify-end")} dir={lang === "ar" ? "rtl" : "ltr"}>
        {available.map((word, i) => (
          <button
            key={`${word}-${i}`}
            type="button"
            disabled={locked}
            onClick={() => onChange([...value, word])}
            className={cn(
              "rounded-xl border border-border/80 bg-card px-3 py-2 text-base font-medium transition-colors",
              !locked && "hover:border-[hsl(var(--lang)/0.6)] hover:bg-accent",
              scriptClass,
            )}
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
}