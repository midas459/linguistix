import { useState } from "react";
import { GERMAN_CASES, GERMAN_LETTERS, GERMAN_NOUNS, GERMAN_SPECIALS } from "@/data/alphabet";
import AudioButton from "@/components/alphabet/AudioButton";
import StrokeCanvas from "@/components/practice/StrokeCanvas";
import { cn } from "@/lib/utils";

const GENDER_STYLES = {
  m: "border-[hsl(var(--chart-1)/0.4)] bg-[hsl(var(--chart-1)/0.09)] text-[hsl(var(--chart-1))]",
  f: "border-[hsl(var(--chart-4)/0.4)] bg-[hsl(var(--chart-4)/0.09)] text-[hsl(var(--chart-4))]",
  n: "border-[hsl(var(--chart-2)/0.4)] bg-[hsl(var(--chart-2)/0.09)] text-[hsl(var(--chart-2))]",
};

export default function GermanLab() {
  const [trace, setTrace] = useState(GERMAN_SPECIALS[0]);

  return (
    <div className="space-y-6">
      <div className="rounded-[26px] border border-border/70 bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono-label text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Alphabet</p>
            <h3 className="mt-1.5 text-lg font-semibold">26 letters and their German names</h3>
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
            Say the example word, not the English letter name — that's what German ears expect.
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
          {GERMAN_LETTERS.map((item) => (
            <div key={item.letter} className="group rounded-2xl border border-border/70 bg-background p-3">
              <div className="flex items-start justify-between">
                <span className="text-2xl font-medium leading-none">{item.letter}</span>
                <AudioButton text={item.example} lang="de-DE" label={item.example} />
              </div>
              <p className="mt-2 font-mono-label text-[11px] text-muted-foreground">/{item.name}/</p>
              <p className="mt-0.5 truncate text-sm font-medium">{item.example}</p>
              <p className="truncate text-xs text-muted-foreground">{item.meaning}</p>
              {item.note && <p className="mt-1 text-[11px] leading-snug text-[hsl(var(--lang))]">{item.note}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[26px] border border-border/70 bg-card p-5 sm:p-6">
        <p className="font-mono-label text-[11px] uppercase tracking-[0.16em] text-muted-foreground">The four extras</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {GERMAN_SPECIALS.map((item) => (
            <div key={item.letter} className="rounded-2xl border border-border/70 bg-background p-4">
              <div className="flex items-start justify-between">
                <span className="text-3xl font-medium leading-none">{item.letter}</span>
                <AudioButton text={item.example} lang="de-DE" label={item.example} />
              </div>
              <p className="mt-2 text-sm font-medium">{item.example}</p>
              <p className="text-xs text-muted-foreground">{item.meaning}</p>
              <p className="mt-2 text-[11px] leading-snug text-muted-foreground">{item.hint}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[26px] border border-border/70 bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono-label text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Handwriting pad</p>
            <h3 className="mt-1.5 text-lg font-semibold">Umlauts and ß</h3>
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
            Both dots sit on the same level, above the letter body — and ß is one unbroken stroke.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {GERMAN_SPECIALS.map((item) => (
            <button
              key={item.letter}
              type="button"
              onClick={() => setTrace(item)}
              className={cn(
                "rounded-2xl border px-3.5 py-2 text-lg font-medium transition-colors",
                trace.letter === item.letter
                  ? "border-[hsl(var(--lang))] bg-[hsl(var(--lang)/0.08)]"
                  : "border-border/70 hover:border-border",
              )}
            >
              {item.letter}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <StrokeCanvas glyph={trace.letter} lang="de-DE" guideClass="" audioText={trace.example} />
          <div className="rounded-2xl border border-border/70 bg-background p-4">
            <p className="font-mono-label text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{trace.name}</p>
            <p className="mt-1 text-2xl font-medium">{trace.example}</p>
            <p className="text-sm text-muted-foreground">{trace.meaning}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{trace.hint}.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[26px] border border-border/70 bg-card p-5 sm:p-6">
          <p className="font-mono-label text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Gender colour code</p>
          <p className="mt-2 text-sm text-muted-foreground">Learn the article with the noun — gender is never guessed at.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { g: "m", label: "der · masculine" },
              { g: "f", label: "die · feminine" },
              { g: "n", label: "das · neuter" },
            ].map((item) => (
              <span key={item.g} className={cn("rounded-full border px-3 py-1 font-mono-label text-[11px]", GENDER_STYLES[item.g])}>
                {item.label}
              </span>
            ))}
          </div>
          <ul className="mt-4 space-y-2">
            {GERMAN_NOUNS.map((noun) => (
              <li
                key={noun.noun}
                className={cn("flex items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5", GENDER_STYLES[noun.gender])}
              >
                <span className="flex items-center gap-3">
                  <AudioButton text={`${noun.article} ${noun.noun}`} lang="de-DE" label={noun.noun} />
                  <span>
                    <span className="block text-sm font-medium">
                      {noun.article} {noun.noun}
                    </span>
                    <span className="block text-xs opacity-80">
                      plural: {noun.plural} · {noun.meaning}
                    </span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[26px] border border-border/70 bg-card p-5 sm:p-6">
          <p className="font-mono-label text-[11px] uppercase tracking-[0.16em] text-muted-foreground">The four cases</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left font-mono-label text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  <th className="py-2 pr-2 font-normal">Case</th>
                  <th className="py-2 pr-2 font-normal">der</th>
                  <th className="py-2 pr-2 font-normal">die</th>
                  <th className="py-2 pr-2 font-normal">das</th>
                  <th className="py-2 font-normal">die (pl)</th>
                </tr>
              </thead>
              <tbody>
                {GERMAN_CASES.map((row) => (
                  <tr key={row.case} className="border-t border-border/60 align-top">
                    <td className="py-2.5 pr-2">
                      <span className="block font-medium">{row.case}</span>
                      <span className="block text-[11px] text-muted-foreground">{row.role}</span>
                    </td>
                    <td className="py-2.5 pr-2 font-medium">{row.m}</td>
                    <td className="py-2.5 pr-2 font-medium">{row.f}</td>
                    <td className="py-2.5 pr-2 font-medium">{row.n}</td>
                    <td className="py-2.5 font-medium">{row.pl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 space-y-2">
            {GERMAN_CASES.slice(0, 3).map((row) => (
              <div key={row.example} className="flex items-center justify-between gap-3 rounded-2xl bg-muted/60 px-3.5 py-2.5">
                <p className="text-sm">{row.example}</p>
                <AudioButton text={row.example} lang="de-DE" label={row.example} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}