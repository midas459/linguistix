import { CARD_CATEGORIES } from "@/data/cards";
import AudioButton from "@/components/alphabet/AudioButton";
import { LANGUAGES } from "@/data/curriculum";
import { cn } from "@/lib/utils";

const SCRIPT_CLASS = { ar: "arabic", ja: "japanese", de: "", en: "" };

export default function Flashcard({ card, lang, flipped, onFlip }) {
  const language = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
  const category = CARD_CATEGORIES.find((c) => c.id === card.category)?.label ?? "";
  const scriptClass = SCRIPT_CLASS[lang] ?? "";

  return (
    <div className="[perspective:1600px]">
      <div
        role="button"
        tabIndex={0}
        onClick={onFlip}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onFlip();
          }
        }}
        aria-label={flipped ? "Show the front of the card" : "Reveal the back of the card"}
        className={cn(
          "relative w-full cursor-pointer rounded-[28px] border border-border/70 bg-card p-6 outline-none transition-transform duration-500 [transform-style:preserve-3d] focus-visible:ring-2 focus-visible:ring-ring sm:p-8",
          flipped && "[transform:rotateY(180deg)]",
        )}
        style={{ minHeight: 380 }}
      >
        {/* front */}
        <div className="flex min-h-[320px] flex-col [backface-visibility:hidden]">
          <div className="flex items-start justify-between gap-3">
            <span className="rounded-full bg-muted px-2.5 py-1 font-mono-label text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {category}
            </span>
            <AudioButton text={card.front} lang={language.speech} label={card.front} />
          </div>
          <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
            <p dir={lang === "ar" ? "rtl" : "ltr"} className={cn("text-[3.2rem] font-medium leading-tight sm:text-[4rem]", scriptClass)}>
              {card.front}
            </p>
            <p className="mt-3 font-mono-label text-xs uppercase tracking-[0.14em] text-muted-foreground">{card.frontSub}</p>
          </div>
          <p className="text-center font-mono-label text-[11px] text-muted-foreground">Tap to reveal</p>
        </div>

        {/* back */}
        <div className="absolute inset-0 flex flex-col gap-4 rounded-[28px] bg-card p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono-label text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{card.translit}</p>
              <p className="mt-1.5 text-xl font-medium leading-snug">{card.meaning}</p>
            </div>
            <AudioButton text={card.front} lang={language.speech} label={card.front} />
          </div>

          <div className="rounded-2xl bg-muted/60 px-3.5 py-2.5">
            <p className="font-mono-label text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Breakdown</p>
            <p className="mt-1 text-sm leading-relaxed">{card.breakdown}</p>
          </div>

          <div className="mt-auto rounded-2xl border border-border/70 px-3.5 py-3">
            <p className="font-mono-label text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Example</p>
            <p dir={lang === "ar" ? "rtl" : "ltr"} className={cn("mt-1 text-lg leading-relaxed", scriptClass)}>
              {card.example}
            </p>
            <p className="mt-1 font-mono-label text-xs text-muted-foreground">{card.exampleTranslit}</p>
            <p className="mt-1 text-sm">{card.exampleMeaning}</p>
          </div>
        </div>
      </div>
    </div>
  );
}