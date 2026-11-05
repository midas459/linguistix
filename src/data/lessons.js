import { FLASHCARDS } from "@/data/cards";

/**
 * One authored task set per unit. The lesson player mixes these with audio
 * cards from the flashcard deck, so every lesson has six graded screens.
 */
export const LESSON_TASKS = {
  ar: {
    "ar-m1": {
      matrix: {
        prompt: "Drop the root ك-ت-ب onto the pattern فَعَلَ. Which word comes out?",
        root: ["ك", "ت", "ب"],
        pattern: ["فَ", "عَ", "لَ"],
        tiles: [
          { id: "kataba", label: "كَتَبَ", sub: "kataba · he wrote" },
          { id: "kitab", label: "كِتاب", sub: "kitāb · book" },
          { id: "maktab", label: "مَكتَب", sub: "maktab · desk" },
        ],
        correct: "kataba",
        note: "فَعَلَ is the plain past-tense template every root can wear.",
      },
      vowel: {
        prompt: "Which harakat turns بـ into a short “a”?",
        stem: "بـ",
        tiles: [
          { id: "fathah", label: "بَ", sub: "fathah · a", audio: "بَ" },
          { id: "kasrah", label: "بِ", sub: "kasrah · i", audio: "بِ" },
          { id: "dammah", label: "بُ", sub: "dammah · u", audio: "بُ" },
          { id: "sukun", label: "بْ", sub: "sukūn · none", audio: "بْ" },
        ],
        correct: "fathah",
        note: "Fathah, dammah and sukūn sit above; kasrah goes below the letter.",
      },
      position: {
        prompt: "In بَيت (house), which shape does ب take?",
        stem: "بَيت",
        tiles: [
          { id: "ini", label: "بـ", sub: "initial" },
          { id: "med", label: "ـبـ", sub: "medial" },
          { id: "fin", label: "ـب", sub: "final" },
          { id: "iso", label: "ب", sub: "isolated" },
        ],
        correct: "ini",
        note: "ب opens the word, so it takes its initial shape and joins forward.",
      },
      wordbank: {
        prompt: "Say it in Arabic.",
        translation: "I am a student.",
        tiles: ["أنا", "طالب", "هو", "كِتاب"],
        answer: ["أنا", "طالب"],
        note: "There is no word for “am” — subject then predicate is enough.",
      },
    },
    "ar-m2": {
      matrix: {
        prompt: "Which word does د-ر-س make on the pattern مَفعَلة?",
        root: ["د", "ر", "س"],
        pattern: ["مَ", "فْ", "عَ", "لَة"],
        tiles: [
          { id: "madrasa", label: "مَدرَسة", sub: "madrasa · school" },
          { id: "darasa", label: "دَرَسَ", sub: "darasa · he studied" },
          { id: "mudarris", label: "مُدَرِّس", sub: "mudarris · teacher" },
        ],
        correct: "madrasa",
        note: "مَفعَلة is the “place of” pattern: the place of studying.",
      },
      vowel: {
        prompt: "You are speaking to a man. Which form do you write?",
        stem: "أنت",
        tiles: [
          { id: "anta", label: "أنتَ", sub: "anta · to a man", audio: "أنتَ" },
          { id: "anti", label: "أنتِ", sub: "anti · to a woman", audio: "أنتِ" },
          { id: "antum", label: "أنتم", sub: "antum · to a group", audio: "أنتم" },
        ],
        correct: "anta",
        note: "The final vowel carries the gender: -a for him, -i for her.",
      },
      position: {
        prompt: "In هِيَ (she), which shape does ي take?",
        stem: "هِيَ",
        tiles: [
          { id: "ini", label: "يـ", sub: "initial" },
          { id: "med", label: "ـيـ", sub: "medial" },
          { id: "fin", label: "ـي", sub: "final" },
          { id: "iso", label: "ي", sub: "isolated" },
        ],
        correct: "fin",
        note: "The word ends on ي, so it takes the final shape.",
      },
      wordbank: {
        prompt: "Say it in Arabic.",
        translation: "She is a doctor.",
        tiles: ["هي", "طبيبة", "أنا", "طالب"],
        answer: ["هي", "طبيبة"],
        note: "The predicate stays indefinite — no ال on طبيبة.",
      },
    },
    "ar-m3": {
      matrix: {
        prompt: "Which word does ك-ت-ب make on the pattern مَفعَلة?",
        root: ["ك", "ت", "ب"],
        pattern: ["مَ", "فْ", "عَ", "لَة"],
        tiles: [
          { id: "maktaba", label: "مَكتَبة", sub: "maktaba · library" },
          { id: "katib", label: "كاتِب", sub: "kātib · writer" },
          { id: "maktub", label: "مَكتوب", sub: "maktūb · written" },
        ],
        correct: "maktaba",
        note: "One root, four patterns: كَتَبَ، كاتِب، كِتاب، مَكتَبة.",
      },
      vowel: {
        prompt: "Which present-tense form means “he writes”?",
        stem: "ـكتب",
        tiles: [
          { id: "yaktubu", label: "يَكتُبُ", sub: "yaktubu · he writes", audio: "يَكتب" },
          { id: "taktubu", label: "تَكتُبُ", sub: "taktubu · she writes", audio: "تَكتب" },
          { id: "aktubu", label: "أَكتُبُ", sub: "aktubu · I write", audio: "أكتب" },
        ],
        correct: "yaktubu",
        note: "The prefix marks the person: يـ he, تـ she, أ I.",
      },
      position: {
        prompt: "In كِتاب (book), which shape does ك take?",
        stem: "كِتاب",
        tiles: [
          { id: "ini", label: "كـ", sub: "initial" },
          { id: "med", label: "ـكـ", sub: "medial" },
          { id: "fin", label: "ـك", sub: "final" },
          { id: "iso", label: "ك", sub: "isolated" },
        ],
        correct: "ini",
        note: "Initial ك keeps its little inner stroke and joins to the left.",
      },
      wordbank: {
        prompt: "Say it in Arabic.",
        translation: "The boy wrote the lesson.",
        tiles: ["كَتَبَ", "الوَلَدُ", "الدَرسَ", "البِنتُ"],
        answer: ["كَتَبَ", "الوَلَدُ", "الدَرسَ"],
        note: "Verb first, then subject, then object.",
      },
    },
    "ar-m4": {
      matrix: {
        prompt: "Which word uses the فاعِل pattern — the one who does?",
        root: ["ك", "ت", "ب"],
        pattern: ["فا", "عِ", "ل"],
        tiles: [
          { id: "katib", label: "كاتِب", sub: "kātib · writer" },
          { id: "maktub", label: "مَكتوب", sub: "maktūb · written" },
          { id: "kitab", label: "كِتاب", sub: "kitāb · book" },
        ],
        correct: "katib",
        note: "فاعِل names the doer; مَفعول names the one it is done to.",
      },
      vowel: {
        prompt: "Which spelling is the feminine “student”?",
        stem: "طالبـ",
        tiles: [
          { id: "taliba", label: "طالِبَة", sub: "ṭāliba · f. student", audio: "طالبة" },
          { id: "talib", label: "طالِب", sub: "ṭālib · m. student", audio: "طالب" },
          { id: "talibun", label: "طالِبون", sub: "ṭālibūn · m. plural", audio: "طالبون" },
        ],
        correct: "taliba",
        note: "Tāʾ marbūṭah (ة) marks the feminine — silent, but it changes the word.",
      },
      position: {
        prompt: "In كِتابي (my book), which shape does ب take?",
        stem: "كِتابي",
        tiles: [
          { id: "ini", label: "بـ", sub: "initial" },
          { id: "med", label: "ـبـ", sub: "medial" },
          { id: "fin", label: "ـب", sub: "final" },
          { id: "iso", label: "ب", sub: "isolated" },
        ],
        correct: "med",
        note: "With the suffix ـي attached, ب sits in the middle.",
      },
      wordbank: {
        prompt: "Say it in Arabic.",
        translation: "My book is new.",
        tiles: ["كِتابي", "جَديد", "قَديم", "هُوَ"],
        answer: ["كِتابي", "جَديد"],
        note: "ـي on كِتاب means “my”; no “is” is needed.",
      },
    },
  },
  de: {
    "de-m1": {
      matrix: {
        prompt: "stehen takes a prefix. Which verb means “to understand”?",
        root: ["steh", "en"],
        pattern: ["ver-", "auf-", "be-"],
        tiles: [
          { id: "verstehen", label: "verstehen", sub: "to understand" },
          { id: "aufstehen", label: "aufstehen", sub: "to get up" },
          { id: "bestehen", label: "bestehen", sub: "to pass / exist" },
        ],
        correct: "verstehen",
        note: "The prefix steers the meaning; the stem stays put.",
      },
      vowel: {
        prompt: "Which is the plural of Apfel (apple)?",
        stem: "Apfel",
        tiles: [
          { id: "aepfel", label: "Äpfel", sub: "umlaut + -", audio: "Äpfel" },
          { id: "apfeln", label: "Apfeln", sub: "no umlaut", audio: "Apfeln" },
          { id: "apfels", label: "Apfels", sub: "-s plural", audio: "Apfels" },
        ],
        correct: "aepfel",
        note: "Many one-syllable masculines pluralise with an umlaut alone.",
      },
      position: {
        prompt: "Where does the umlaut sit in schön (beautiful)?",
        stem: "schön",
        tiles: [
          { id: "oe", label: "ö", sub: "o + umlaut" },
          { id: "o", label: "o", sub: "plain o" },
          { id: "ue", label: "ü", sub: "u + umlaut" },
        ],
        correct: "oe",
        note: "The two dots over o front the vowel — lips rounded, tongue forward.",
      },
      wordbank: {
        prompt: "Say it in German.",
        translation: "My name is Anna.",
        tiles: ["Ich", "heiße", "Anna", "bin"],
        answer: ["Ich", "heiße", "Anna"],
        note: "heißen = to be called; no “am” in this sentence.",
      },
    },
    "de-m2": {
      matrix: {
        prompt: "Which article belongs to Mädchen (girl)?",
        root: ["Mädchen"],
        pattern: ["der", "die", "das"],
        tiles: [
          { id: "das", label: "das", sub: "neuter" },
          { id: "die", label: "die", sub: "feminine" },
          { id: "der", label: "der", sub: "masculine" },
        ],
        correct: "das",
        note: "Every noun in -chen is neuter, however feminine the meaning.",
      },
      vowel: {
        prompt: "Which is the plural of die Frau?",
        stem: "die Frau",
        tiles: [
          { id: "frauen", label: "die Frauen", sub: "-n plural", audio: "die Frauen" },
          { id: "fraus", label: "die Fraus", sub: "-s plural", audio: "die Fraus" },
          { id: "fräue", label: "die Fräue", sub: "umlaut", audio: "die Fräue" },
        ],
        correct: "frauen",
        note: "Feminines in -e almost always add -n.",
      },
      position: {
        prompt: "Nouns ending in -ung take which article?",
        stem: "-ung",
        tiles: [
          { id: "die", label: "die", sub: "feminine" },
          { id: "der", label: "der", sub: "masculine" },
          { id: "das", label: "das", sub: "neuter" },
        ],
        correct: "die",
        note: "-ung, -heit and -keit are all die.",
      },
      wordbank: {
        prompt: "Say it in German.",
        translation: "The child is small.",
        tiles: ["Das", "Kind", "ist", "klein"],
        answer: ["Das", "Kind", "ist", "klein"],
        note: "German always needs its “is”.",
      },
    },
    "de-m3": {
      matrix: {
        prompt: "machen — which form goes with du?",
        root: ["mach", "en"],
        pattern: ["du", "er", "wir"],
        tiles: [
          { id: "machst", label: "machst", sub: "du machst" },
          { id: "macht", label: "macht", sub: "er macht" },
          { id: "machen", label: "machen", sub: "wir machen" },
        ],
        correct: "machst",
        note: "Stem + st for du, stem + t for er/sie/es.",
      },
      vowel: {
        prompt: "sprechen — which form goes with du?",
        stem: "du ___",
        tiles: [
          { id: "sprichst", label: "sprichst", sub: "e → i", audio: "du sprichst" },
          { id: "sprechst", label: "sprechst", sub: "no vowel change", audio: "du sprechst" },
          { id: "spricht", label: "spricht", sub: "that is er", audio: "er spricht" },
        ],
        correct: "sprichst",
        note: "Strong verbs change e → i in du and er/sie/es only.",
      },
      position: {
        prompt: "sein — which form goes with er?",
        stem: "er ___",
        tiles: [
          { id: "ist", label: "ist", sub: "er ist" },
          { id: "bist", label: "bist", sub: "du bist" },
          { id: "bin", label: "bin", sub: "ich bin" },
        ],
        correct: "ist",
        note: "bin · bist · ist · sind · seid · sind — learn it as a chant.",
      },
      wordbank: {
        prompt: "Say it in German.",
        translation: "I have a dog.",
        tiles: ["Ich", "habe", "einen", "Hund"],
        answer: ["Ich", "habe", "einen", "Hund"],
        note: "Hund is masculine, and haben takes the accusative: einen.",
      },
    },
    "de-m4": {
      matrix: {
        prompt: "Ich sehe ___ Mann. Which article?",
        root: ["sehen", "Mann"],
        pattern: ["der", "den", "dem"],
        tiles: [
          { id: "den", label: "den", sub: "accusative" },
          { id: "der", label: "der", sub: "nominative" },
          { id: "dem", label: "dem", sub: "dative" },
        ],
        correct: "den",
        note: "The direct object takes the accusative — masculine only changes.",
      },
      vowel: {
        prompt: "Er sieht ___. Which pronoun means “me”?",
        stem: "Er sieht",
        tiles: [
          { id: "mich", label: "mich", sub: "accusative me" },
          { id: "ich", label: "ich", sub: "nominative I" },
          { id: "mir", label: "mir", sub: "dative me" },
        ],
        correct: "mich",
        note: "ich → mich, du → dich, er → ihn.",
      },
      position: {
        prompt: "der → ___ in the masculine accusative.",
        stem: "der Mann",
        tiles: [
          { id: "den", label: "den", sub: "masculine acc." },
          { id: "die", label: "die", sub: "feminine acc." },
          { id: "das", label: "das", sub: "neuter acc." },
        ],
        correct: "den",
        note: "Only the masculine article moves in the accusative.",
      },
      wordbank: {
        prompt: "Say it in German.",
        translation: "I see the dog.",
        tiles: ["Ich", "sehe", "den", "Hund"],
        answer: ["Ich", "sehe", "den", "Hund"],
        note: "der Hund becomes den Hund as the object.",
      },
    },
  },
  ja: {
    "ja-m1": {
      matrix: {
        prompt: "木 (tree) + 木 (tree) makes which kanji?",
        root: ["木", "木"],
        pattern: ["+", "="],
        tiles: [
          { id: "hayashi", label: "林", sub: "hayashi · grove" },
          { id: "mori", label: "森", sub: "mori · forest" },
          { id: "hon", label: "本", sub: "hon · book" },
        ],
        correct: "hayashi",
        note: "Two trees make a grove, three make a forest: 林 → 森.",
      },
      vowel: {
        prompt: "か takes a dakuten (゛). What does it become?",
        stem: "か + ゛",
        tiles: [
          { id: "ga", label: "が", sub: "ga", audio: "が" },
          { id: "pa", label: "ぱ", sub: "pa (handakuten)", audio: "ぱ" },
          { id: "za", label: "ざ", sub: "za", audio: "ざ" },
        ],
        correct: "ga",
        note: "Two dots voice k → g; a little circle gives the p-row.",
      },
      position: {
        prompt: "Which katakana matches あ?",
        stem: "あ → ___",
        tiles: [
          { id: "a", label: "ア", sub: "a" },
          { id: "ka", label: "カ", sub: "ka" },
          { id: "ma", label: "マ", sub: "ma" },
        ],
        correct: "a",
        note: "Same sound, different script — katakana is for loanwords.",
      },
      wordbank: {
        prompt: "Say it in Japanese.",
        translation: "I am a student.",
        tiles: ["私", "は", "学生", "です", "か"],
        answer: ["私", "は", "学生", "です"],
        note: "は marks the topic, です closes the sentence politely.",
      },
    },
    "ja-m2": {
      matrix: {
        prompt: "Which particle links two nouns — 私___本 = my book?",
        root: ["私", "本"],
        pattern: ["は", "の", "を"],
        tiles: [
          { id: "no", label: "の", sub: "no · possession" },
          { id: "wa", label: "は", sub: "wa · topic" },
          { id: "wo", label: "を", sub: "o · object" },
        ],
        correct: "no",
        note: "の glues one noun to the next, like 's or “of”.",
      },
      vowel: {
        prompt: "As a particle, は is read…",
        stem: "は",
        tiles: [
          { id: "wa", label: "wa", sub: "as a particle", audio: "私は" },
          { id: "ha", label: "ha", sub: "as a normal syllable", audio: "は" },
          { id: "ho", label: "ho", sub: "no", audio: "ほ" },
        ],
        correct: "wa",
        note: "Same kana, special reading: 私は = watashi wa.",
      },
      position: {
        prompt: "Which particle marks the topic of the sentence?",
        stem: "___ がくせい です",
        tiles: [
          { id: "wa", label: "は", sub: "topic" },
          { id: "wo", label: "を", sub: "object" },
          { id: "ni", label: "に", sub: "destination" },
        ],
        correct: "wa",
        note: "は says “as for …”, が identifies who does it.",
      },
      wordbank: {
        prompt: "Say it in Japanese.",
        translation: "This is water.",
        tiles: ["これ", "は", "水", "です"],
        answer: ["これ", "は", "水", "です"],
        note: "これ = this, 水 = water.",
      },
    },
    "ja-m3": {
      matrix: {
        prompt: "食べる belongs to which verb class?",
        root: ["食べ", "る"],
        pattern: ["type"],
        tiles: [
          { id: "ru", label: "ru-verb", sub: "ichidan" },
          { id: "u", label: "u-verb", sub: "godan" },
          { id: "irr", label: "irregular", sub: "する / くる" },
        ],
        correct: "ru",
        note: "食べる drops る and adds ます: 食べます.",
      },
      vowel: {
        prompt: "What is the polite form of 飲む (to drink)?",
        stem: "飲む → ___",
        tiles: [
          { id: "nomimasu", label: "飲みます", sub: "nomimasu", audio: "飲みます" },
          { id: "nomumasu", label: "飲むます", sub: "nomumasu", audio: "飲むます" },
          { id: "nomimasen", label: "飲みません", sub: "negative", audio: "飲みません" },
        ],
        correct: "nomimasu",
        note: "u-verbs take the i-row before ます: mu → mi.",
      },
      position: {
        prompt: "What is the plain form of 行きます?",
        stem: "行きます → ___",
        tiles: [
          { id: "iku", label: "行く", sub: "plain present" },
          { id: "iki", label: "行き", sub: "stem only" },
          { id: "itte", label: "行って", sub: "te-form" },
        ],
        correct: "iku",
        note: "Plain form is the dictionary form — the one in the dictionary.",
      },
      wordbank: {
        prompt: "Say it in Japanese.",
        translation: "I eat sushi.",
        tiles: ["すし", "を", "食べます"],
        answer: ["すし", "を", "食べます"],
        note: "を marks what is eaten.",
      },
    },
    "ja-m4": {
      matrix: {
        prompt: "Which particle marks the direct object?",
        root: ["ごはん", "食べます"],
        pattern: ["を", "に", "で"],
        tiles: [
          { id: "wo", label: "を", sub: "o · object" },
          { id: "ni", label: "に", sub: "ni · destination" },
          { id: "de", label: "で", sub: "de · place of action" },
        ],
        correct: "wo",
        note: "を is read “o” and only ever marks an object.",
      },
      vowel: {
        prompt: "図書館 ___ 勉強します — study at the library.",
        stem: "図書館 ___ 勉強します",
        tiles: [
          { id: "de", label: "で", sub: "place of action" },
          { id: "ni", label: "に", sub: "destination" },
          { id: "wo", label: "を", sub: "object" },
        ],
        correct: "de",
        note: "で marks where the action happens; に marks where something is.",
      },
      position: {
        prompt: "日本 ___ 行きます — go to Japan.",
        stem: "日本 ___ 行きます",
        tiles: [
          { id: "ni", label: "に", sub: "destination" },
          { id: "de", label: "で", sub: "place of action" },
          { id: "wo", label: "を", sub: "object" },
        ],
        correct: "ni",
        note: "に also marks a point in time: 七時に起きます.",
      },
      wordbank: {
        prompt: "Say it in Japanese.",
        translation: "I go to school.",
        tiles: ["学校", "に", "行きます"],
        answer: ["学校", "に", "行きます"],
        note: "Destination takes に, and the verb lands last.",
      },
    },
  },
};

function audioScreen(cards, index, key) {
  if (!cards.length) return null;
  const card = cards[index % cards.length];
  const decoys = cards.filter((c) => c.id !== card.id);
  const picks = [0, 1, 2].map((n) => decoys[(index + n * 3) % decoys.length]).filter(Boolean);
  const options = [card, ...picks].map((c) => ({ id: c.id, label: c.meaning }));
  return {
    kind: "audio",
    key,
    title: "Listen & choose",
    prompt: "Play the audio, then pick what it means.",
    audio: card.example || card.front,
    audioLangHint: card.translit,
    tiles: options.sort((a, b) => a.id.localeCompare(b.id)),
    correct: card.id,
    note: `${card.front} — ${card.translit}`,
  };
}

/** Six graded screens per lesson, in a fixed pedagogical order. */
export function buildScreens(lang, moduleId, lessonIndex) {
  const tasks = LESSON_TASKS[lang]?.[moduleId];
  if (!tasks) return [];
  const cards = FLASHCARDS[lang] || [];
  const screens = [
    { kind: "matrix", key: "matrix", title: "Root & pattern", ...tasks.matrix },
    { kind: "vowel", key: "vowel", title: "Vowel puzzle", ...tasks.vowel },
    { kind: "position", key: "position", title: "In position", ...tasks.position },
    audioScreen(cards, lessonIndex, "audio-a"),
    audioScreen(cards, lessonIndex + 4, "audio-b"),
    { kind: "wordbank", key: "wordbank", title: "Build the sentence", ...tasks.wordbank },
  ];
  return screens.filter(Boolean);
}