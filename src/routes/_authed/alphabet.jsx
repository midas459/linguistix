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
      </div>
    </div>
  );
}