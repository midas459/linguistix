import { useState } from "react";
import { KANA, KANJI } from "@/data/alphabet";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";
import AudioButton from "@/components/alphabet/AudioButton";
import StrokeCanvas from "@/components/practice/StrokeCanvas";

export default function JapaneseLab() {
  const [script, setScript] = useState("hiragana");
  const [showRomaji, setShowRomaji] = useState(true);
  const [showFurigana, setShowFurigana] = useState(true);
  const [selected, setSelected] = useState(KANJI[0]);

  const kana = KANA[script];

  return (
    <div className="space-y-6">
      <div className="rounded-[26px] border border-border/70 bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono-label text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Syllabaries</p>
            <h3 className="mt-1.5 text-lg font-semibold">46 sounds, two scripts</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-full border border-border p-0.5">
              {[
                { id: "hiragana", label: "ひらがな" },
                { id: "katakana", label: "カタカナ" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setScript(item.id)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                    script === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowRomaji((v) => !v)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                showRomaji ? "border-[hsl(var(--lang))] text-[hsl(var(--lang))]" : "border-border text-muted-foreground",
              )}
            >
              Romaji {showRomaji ? "on" : "off"}
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-10">
          {kana.map((item) => (
            <button
              key={`${script}-${item.kana}`}
              type="button"
              onClick={() => speak(item.kana, "ja-JP")}
              className="rounded-2xl border border-border/70 bg-background px-2 py-2.5 text-center transition-colors hover:border-[hsl(var(--lang))]"
            >
              <span className="japanese block text-2xl leading-none">{item.kana}</span>
              <span
                className={cn(
                  "mt-1.5 block font-mono-label text-[10px] uppercase tracking-[0.08em] text-muted-foreground transition-opacity",
                  showRomaji ? "opacity-100" : "opacity-0",
                )}
              >
                {item.romaji}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Small ゃ ゅ ょ combine with the い-row (きゃ = kya). A small っ doubles the next consonant, and ー lengthens a vowel in katakana.
        </p>
      </div>

      <div className="rounded-[26px] border border-border/70 bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono-label text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Everyday kanji</p>
            <h3 className="mt-1.5 text-lg font-semibold">10 characters to start with</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowFurigana((v) => !v)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              showFurigana ? "border-[hsl(var(--lang))] text-[hsl(var(--lang))]" : "border-border text-muted-foreground",
            )}
          >
            Furigana {showFurigana ? "on" : "off"}
          </button>
        </div>

        <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <div className="grid grid-cols-5 gap-2">
            {KANJI.map((item) => (
              <button
                key={item.char}
                type="button"
                onClick={() => setSelected(item)}
                className={cn(
                  "rounded-2xl border px-1 py-3 text-center transition-colors",
                  selected.char === item.char ? "border-[hsl(var(--lang))] bg-[hsl(var(--lang)/0.08)]" : "border-border/70 bg-background hover:border-border",
                )}
              >
                <span className="japanese block text-2xl leading-none">{item.char}</span>
                <span className="mt-1.5 block text-[10px] text-muted-foreground">{item.meaning.split(",")[0]}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-background p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="japanese text-3xl leading-none">{selected.word}</p>
                  {showFurigana && <p className="mt-1 text-xs text-[hsl(var(--lang))]">{selected.reading}</p>}
                  <p className="mt-1.5 text-sm text-muted-foreground">{selected.translation}</p>
                </div>
                <AudioButton text={selected.word} lang="ja-JP" label={selected.word} />
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 font-mono-label text-[11px]">
                <div className="rounded-xl bg-muted/70 px-2.5 py-2">
                  <dt className="text-muted-foreground">Char</dt>
                  <dd className="japanese mt-0.5 text-base">{selected.char}</dd>
                </div>
                <div className="rounded-xl bg-muted/70 px-2.5 py-2">
                  <dt className="text-muted-foreground">On</dt>
                  <dd className="mt-0.5 text-sm">{selected.on}</dd>
                </div>
                <div className="rounded-xl bg-muted/70 px-2.5 py-2">
                  <dt className="text-muted-foreground">Kun</dt>
                  <dd className="mt-0.5 text-sm">{selected.kun}</dd>
                </div>
              </dl>
            </div>
            <StrokeCanvas glyph={selected.char} lang="ja-JP" guideClass="japanese" audioText={selected.word} />
          </div>
        </div>
      </div>
    </div>
  );
}