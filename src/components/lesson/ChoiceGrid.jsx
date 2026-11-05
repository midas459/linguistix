import { Volume2 } from "lucide-react";
import { speak } from "@/lib/speech";
import { getLanguage } from "@/data/curriculum";
import { cn } from "@/lib/utils";

/**
 * Shared tile-choice screen for the root matrix, vowel puzzle, positional
 * match and audio tasks. The player owns correctness; this only selects.
 */
export default function ChoiceGrid({ screen, value, onChange, locked, lang }) {
  const scriptClass = lang === "ar" ? "arabic" : lang === "ja" ? "japanese" : "";

  return (
    <div>
      <p className="text-lg font-medium leading-snug">{screen.prompt}</p>

      {screen.kind === "matrix" && (
        <div className="mt-5 rounded-3xl border border-border/70 bg-muted/40 p-4">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <div>
              <p className="font-mono-label text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Root</p>
              <div className="mt-1.5 flex gap-1.5">
                {screen.root.map((part, i) => (
                  <span
                    key={`${part}-${i}`}
                    className={cn(
                      "grid h-10 min-w-10 place-items-center rounded-xl bg-background px-2 text-lg font-medium shadow-sm",
                      scriptClass,
                    )}
                  >
                    {part}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              {screen.pattern.map((part, i) => (
                <span
                  key={`${part}-${i}`}
                  className={cn(
                    "rounded-lg border border-dashed border-[hsl(var(--lang)/0.5)] px-2 py-1 text-base text-[hsl(var(--lang))]",
                    scriptClass,
                  )}
                >
                  {part}
                </span>
              ))}
            </div>
            <div className="text-right">
              <p className="font-mono-label text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Result</p>
              <span className="mt-1.5 grid h-10 min-w-10 place-items-center rounded-xl border border-[hsl(var(--lang)/0.45)] px-2 text-lg text-[hsl(var(--lang))]">
                ?
              </span>
            </div>
          </div>
        </div>
      )}

      {screen.kind === "vowel" && (
        <div className="mt-5 flex flex-wrap items-center gap-4 rounded-3xl border border-border/70 bg-muted/40 px-5 py-6">
          <span className={cn("text-5xl leading-none", scriptClass)}>{screen.stem}</span>
          <span className="font-mono-label text-xs text-muted-foreground">
            {value ? `→ ${(screen.tiles.find((t) => t.id === value) || {}).label}` : "choose the missing piece"}
          </span>
        </div>
      )}

      {screen.kind === "position" && (
        <div className="mt-5 rounded-3xl border border-border/70 bg-muted/40 px-5 py-6 text-center">
          <span className={cn("text-4xl leading-none", scriptClass)}>{screen.stem}</span>
        </div>
      )}

      {screen.kind === "audio" && (
        <div className="mt-5 flex flex-col items-center gap-2 rounded-3xl border border-border/70 bg-muted/40 px-5 py-7">
          <button
            type="button"
            onClick={() => speak(screen.audio, getLanguage(lang).speech)}
            className="grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
            aria-label="Play the audio"
          >
            <Volume2 className="h-7 w-7" />
          </button>
          <p className="font-mono-label text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Tap to play</p>
        </div>
      )}

      <div className={cn("mt-4 grid gap-2.5", screen.tiles.length === 4 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3")}>
        {screen.tiles.map((tile) => {
          const active = value === tile.id;
          const isRight = locked && screen.correct === tile.id;
          return (
            <button
              key={tile.id}
              type="button"
              disabled={locked}
              onClick={() => onChange(tile.id)}
              className={cn(
                "rounded-2xl border bg-card px-4 py-3.5 text-left transition-all",
                active && !locked && "border-[hsl(var(--lang))] bg-[hsl(var(--lang)/0.09)] glow-soft",
                isRight && "border-[hsl(var(--chart-2))] bg-[hsl(var(--chart-2)/0.12)]",
                locked && !isRight && "opacity-55",
                !locked && !active && "border-border/80 hover:border-[hsl(var(--lang)/0.5)]",
              )}
            >
              <span className={cn("block text-lg font-medium leading-tight", scriptClass)}>{tile.label}</span>
              {tile.sub && <span className="mt-1 block text-xs text-muted-foreground">{tile.sub}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}