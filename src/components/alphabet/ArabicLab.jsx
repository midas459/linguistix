import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ARABIC_LETTERS, HARAKAT } from "@/data/alphabet";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";
import AudioButton from "@/components/alphabet/AudioButton";
import StrokeCanvas from "@/components/practice/StrokeCanvas";

const FORMS = [
  { key: "iso", label: "Isolated" },
  { key: "ini", label: "Initial" },
  { key: "med", label: "Medial" },
  { key: "fin", label: "Final" },
];

export default function ArabicLab() {
  const [selected, setSelected] = useState(0);
  const [harakat, setHarakat] = useState(false);
  const [vowel, setVowel] = useState(0);
  const [traceForm, setTraceForm] = useState("iso");

  const letter = ARABIC_LETTERS[selected];
  const mark = HARAKAT[vowel];
  const voiced = harakat ? `${letter.iso}${mark.mark}` : letter.iso;

  return (
    <div className="space-y-6">
      <div className="rounded-[26px] border border-border/70 bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono-label text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Positional forms</p>
            <h3 className="mt-1.5 text-lg font-semibold">
              {letter.name} <span className="font-mono-label text-sm font-normal text-muted-foreground">/ {letter.translit} /</span>
            </h3>
          </div>
          <div className="flex items-center gap-2.5 rounded-full border border-border px-3.5 py-1.5">
            <Switch id="harakat-overlay" checked={harakat} onCheckedChange={setHarakat} />
            <Label htmlFor="harakat-overlay" className="cursor-pointer text-sm">
              Harakat overlay
            </Label>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {FORMS.map((form) => (
                <button
                  key={form.key}
                  type="button"
                  onClick={() => speak(`${letter[form.key]}${harakat ? mark.mark : ""}`, "ar-SA")}
                  className="group rounded-2xl border border-border/80 bg-background px-3 py-4 text-center transition-colors hover:border-[hsl(var(--lang))]"
                >
                  <span dir="rtl" className="arabic block text-[2.6rem] leading-none">
                    {letter[form.key]}
                    {harakat && <span>{mark.mark}</span>}
                  </span>
                  <span className="mt-2 block font-mono-label text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                    {form.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-muted/60 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {letter.join
                  ? "Joins on both sides — the shape changes in the middle of a word."
                  : "A non-joining letter: it never connects to the letter after it."}
              </p>
              <AudioButton text={letter.iso} lang="ar-SA" label={letter.name} />
            </div>

            <div className="mt-4">
              <p className="font-mono-label text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Short vowels</p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {HARAKAT.map((h, i) => (
                  <button
                    key={h.name}
                    type="button"
                    onClick={() => {
                      setVowel(i);
                      setHarakat(true);
                      speak(`${letter.iso}${h.mark}`, "ar-SA");
                    }}
                    className={cn(
                      "rounded-2xl border px-3 py-2.5 text-left transition-colors",
                      vowel === i && harakat ? "border-[hsl(var(--lang))] bg-[hsl(var(--lang)/0.08)]" : "border-border/80 hover:bg-accent/60",
                    )}
                  >
                    <span className="flex items-baseline justify-between">
                      <span dir="rtl" className="arabic text-xl leading-none">
                        {letter.iso}
                        {h.mark}
                      </span>
                      <span className="font-mono-label text-[11px] text-muted-foreground">{h.sound}</span>
                    </span>
                    <span className="mt-1.5 block text-xs font-medium">{h.name}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{mark.hint}.</p>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-mono-label text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Handwriting pad</p>
              <div className="flex rounded-full border border-border p-0.5">
                {FORMS.map((form) => (
                  <button
                    key={form.key}
                    type="button"
                    onClick={() => setTraceForm(form.key)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                      traceForm === form.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {form.label.slice(0, 4)}
                  </button>
                ))}
              </div>
            </div>
            <StrokeCanvas
              glyph={traceForm === "iso" ? voiced : letter[traceForm]}
              audioText={traceForm === "iso" ? voiced : letter[traceForm]}
              guideClass="arabic"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-end justify-between">
          <h3 className="text-base font-semibold">All 28 letters</h3>
          <p className="font-mono-label text-[11px] text-muted-foreground">Tap a letter to open it above</p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-7">
          {ARABIC_LETTERS.map((item, i) => (
            <button
              key={item.name}
              type="button"
              onClick={() => setSelected(i)}
              className={cn(
                "rounded-2xl border px-2 py-3 text-center transition-colors",
                i === selected
                  ? "border-[hsl(var(--lang))] bg-[hsl(var(--lang)/0.08)]"
                  : "border-border/70 bg-card hover:border-border",
              )}
            >
              <span dir="rtl" className="arabic block text-2xl leading-none">
                {item.iso}
                {harakat && <span>{mark.mark}</span>}
              </span>
              <span className="mt-1.5 block truncate font-mono-label text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                {item.translit}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}