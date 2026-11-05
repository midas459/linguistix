import { createFileRoute } from "@tanstack/react-router";
import ArabicLab from "@/components/alphabet/ArabicLab";
import GermanLab from "@/components/alphabet/GermanLab";
import JapaneseLab from "@/components/alphabet/JapaneseLab";
import PageHeader from "@/components/shell/PageHeader";
import { useLearn } from "@/lib/learn-store";

export const Route = createFileRoute("/_authed/alphabet")({
  head: () => ({
    meta: [
      { title: "Alphabet Lab — Lisan" },
      { name: "description", content: "Practise Arabic letters by position, German umlauts and cases, or Japanese kana and kanji." },
    ],
  }),
  component: AlphabetPage,
});

const COPY = {
  en: { eyebrow: "Pronunciation Lab", title: "English sounds and spelling patterns", body: "Practise clear vowel sounds, common consonant combinations and word stress. English spelling is not always phonetic, so learn each sound with example words." },
  es: { eyebrow: "Pronunciation Lab", title: "Spanish vowels and clear syllables", body: "Spanish has five steady vowel sounds: a, e, i, o and u. Practise the ñ sound, the soft g and j, and the rhythm of syllable stress." },
  fr: { eyebrow: "Pronunciation Lab", title: "French sounds and accents", body: "Explore é, è and ê, nasal vowel sounds, silent final letters and the links between words in natural French speech." },
  pt: { eyebrow: "Pronunciation Lab", title: "Portuguese sounds and spelling", body: "Practise nasal vowels, ç, ão and common letter combinations. This starter course uses European Portuguese pronunciation examples." },
  ar: {
    eyebrow: "Alphabet Lab",
    title: "Shapes, vowels, and the sound of each letter",
    body: "Every Arabic letter changes shape with its position. Switch on harakat to hear the short vowels, then trace the letter yourself.",
  },
  de: {
    eyebrow: "Alphabet Lab",
    title: "Sounds first, then gender and case",
    body: "Hear each letter through a real word, then learn nouns with their article and watch the four cases change it.",
  },
  ja: {
    eyebrow: "Alphabet Lab",
    title: "Two syllabaries and your first kanji",
    body: "Start with hiragana, switch to katakana for loanwords, then read everyday kanji with furigana over the top.",
  },
};

function AlphabetPage() {
  const { lang } = useLearn();
  const copy = COPY[lang] ?? COPY.ar;

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.body} />
      <div className="mt-8">
        {lang === "ar" && <ArabicLab />}
        {lang === "de" && <GermanLab />}
        {lang === "ja" && <JapaneseLab />}
        {["en", "es", "fr", "pt"].includes(lang) && (
          <div className="rounded-[26px] border border-border/70 bg-card p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Sound guide</p>
            <h2 className="mt-2 text-xl font-semibold">{copy.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{copy.body}</p>
            <p className="mt-5 rounded-xl bg-muted/60 p-4 text-sm">
              Tip: open a lesson and use your device's available speech support to hear the language examples. Pronunciation recordings and interactive tracing can be added in a later course update.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}