export const LANGUAGES = [
  {
    code: "en", label: "English", short: "English", native: "English", emblem: "A",
    speech: "en-US", dir: "ltr", accent: "205 82% 42%", accentDark: "198 90% 62%",
    blurb: "Build clear everyday English with useful phrases, core grammar and confident conversation.",
  },
  {
    code: "es", label: "Spanish", short: "Spanish", native: "Español", emblem: "Ñ",
    speech: "es-ES", dir: "ltr", accent: "8 78% 48%", accentDark: "18 90% 62%",
    blurb: "Learn practical Spanish greetings, present-tense verbs and everyday conversation.",
  },
  {
    code: "fr", label: "French", short: "French", native: "Français", emblem: "É",
    speech: "fr-FR", dir: "ltr", accent: "224 72% 52%", accentDark: "218 90% 70%",
    blurb: "Build French pronunciation, introductions, articles and useful everyday phrases.",
  },
  {
    code: "pt", label: "Portuguese", short: "Portuguese", native: "Português", emblem: "Ã",
    speech: "pt-PT", dir: "ltr", accent: "150 65% 34%", accentDark: "145 65% 52%",
    blurb: "Start Portuguese with greetings, pronunciation, core verbs and practical phrases.",
  },
  {
    code: "ar",
    label: "Arabic (MSA)",
    short: "Arabic",
    native: "العربية",
    emblem: "ع",
    speech: "ar-SA",
    dir: "rtl",
    accent: "160 74% 30%",
    accentDark: "158 70% 46%",
    blurb: "28 letters, four shapes, harakat and the three-letter root system.",
  },
  {
    code: "de",
    label: "German",
    short: "German",
    native: "Deutsch",
    emblem: "ß",
    speech: "de-DE",
    dir: "ltr",
    accent: "32 88% 40%",
    accentDark: "43 94% 58%",
    blurb: "Umlauts, noun gender, four cases and word order that clicks.",
  },
  {
    code: "ja",
    label: "Japanese",
    short: "Japanese",
    native: "日本語",
    emblem: "あ",
    speech: "ja-JP",
    dir: "ltr",
    accent: "258 60% 50%",
    accentDark: "262 74% 72%",
    blurb: "Hiragana, katakana, everyday kanji and the particles that bind them.",
  },
];

export const getLanguage = (code) => LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];

export const XP_GOAL = 50;
export const CARDS_GOAL = 20;
export const MINUTES_GOAL = 15;

export const MODULES = {
  en: [
    { id: "en-m1", title: "Everyday Greetings & Introductions", subtitle: "English A1 · Unit 1", summary: "Greet people, introduce yourself and ask simple questions.", lessons: [
      { id: "en-m1-l1", title: "Hello and goodbye", subtitle: "Greetings and polite expressions", points: ["Hello / Hi are common greetings", "Good morning is used earlier in the day", "Goodbye / See you later close a conversation"] },
      { id: "en-m1-l2", title: "Introducing yourself", subtitle: "I am… / My name is…", points: ["My name is Ana = I am called Ana", "I am from Kenya describes your origin", "Nice to meet you is a polite response"] },
      { id: "en-m1-l3", title: "Simple questions", subtitle: "What, where and how", points: ["What is your name? asks for a name", "Where are you from? asks about origin", "How are you? asks about wellbeing"] },
    ] },
    { id: "en-m2", title: "People, Pronouns & Be", subtitle: "English A1 · Unit 2", summary: "Use personal pronouns and the verb be in simple sentences.", lessons: [
      { id: "en-m2-l1", title: "Personal pronouns", subtitle: "I, you, he, she, it, we, they", points: ["I and we include the speaker", "He, she and it refer to singular subjects", "They refers to people or things in the plural"] },
      { id: "en-m2-l2", title: "The verb be", subtitle: "am, is and are", points: ["I am; you are; he or she is", "We are; they are", "The negative adds not: I am not"] },
      { id: "en-m2-l3", title: "Articles and nouns", subtitle: "a, an and the", points: ["Use a before a consonant sound", "Use an before a vowel sound", "The points to something specific"] },
    ] },
  ],
  es: [
    { id: "es-m1", title: "Saludos y presentaciones", subtitle: "Español A1 · Unidad 1", summary: "Greet people and introduce yourself in Spanish.", lessons: [
      { id: "es-m1-l1", title: "Saludos básicos", subtitle: "Hola, buenos días, adiós", points: ["Hola means hello", "Buenos días means good morning", "Buenas tardes / noches fit afternoon and evening"] },
      { id: "es-m1-l2", title: "Presentarte", subtitle: "Me llamo… / Soy de…", points: ["Me llamo Ana = My name is Ana", "Soy de Kenia = I am from Kenya", "Mucho gusto means nice to meet you"] },
      { id: "es-m1-l3", title: "Preguntas sencillas", subtitle: "Qué, dónde and cómo", points: ["¿Cómo te llamas? asks your name", "¿De dónde eres? asks where you are from", "¿Cómo estás? asks how you are"] },
    ] },
    { id: "es-m2", title: "Pronombres y el verbo ser", subtitle: "Español A1 · Unidad 2", summary: "Use subject pronouns and ser to describe identity and origin.", lessons: [
      { id: "es-m2-l1", title: "Pronombres personales", subtitle: "yo, tú, él, ella, nosotros", points: ["Yo means I and tú means informal you", "Él / ella mean he / she", "Nosotros / nosotras mean we"] },
      { id: "es-m2-l2", title: "El verbo ser", subtitle: "soy, eres, es, somos, son", points: ["Yo soy = I am", "Tú eres = you are; ella es = she is", "Ser describes identity, origin and lasting characteristics"] },
      { id: "es-m2-l3", title: "Artículos y género", subtitle: "el, la, los, las, un, una", points: ["El and la are singular the", "Los and las are plural the", "Nouns are commonly masculine or feminine"] },
    ] },
  ],
  fr: [
    { id: "fr-m1", title: "Salutations et présentations", subtitle: "Français A1 · Unité 1", summary: "Greet people and introduce yourself in French.", lessons: [
      { id: "fr-m1-l1", title: "Salutations", subtitle: "Bonjour, salut, au revoir", points: ["Bonjour is a polite hello and good day", "Salut is informal hello or goodbye", "Au revoir means goodbye"] },
      { id: "fr-m1-l2", title: "Se présenter", subtitle: "Je m'appelle… / Je suis…", points: ["Je m'appelle Léa = My name is Léa", "Je viens du Kenya = I come from Kenya", "Enchanté / enchantée means pleased to meet you"] },
      { id: "fr-m1-l3", title: "Questions simples", subtitle: "Comment, où and quel", points: ["Comment tu t'appelles? asks your name", "Tu viens d'où? asks where you come from", "Comment ça va? asks how it is going"] },
    ] },
    { id: "fr-m2", title: "Pronoms et le verbe être", subtitle: "Français A1 · Unité 2", summary: "Use subject pronouns and être for identity and descriptions.", lessons: [
      { id: "fr-m2-l1", title: "Pronoms personnels", subtitle: "je, tu, il, elle, nous, vous, ils", points: ["Je means I; tu is informal you", "Il / elle mean he / she", "Vous is formal or plural you"] },
      { id: "fr-m2-l2", title: "Le verbe être", subtitle: "suis, es, est, sommes, êtes, sont", points: ["Je suis = I am", "Tu es / elle est = you are / she is", "Être describes identity, state and characteristics"] },
      { id: "fr-m2-l3", title: "Articles et noms", subtitle: "un, une, le, la, les", points: ["Un is masculine and une is feminine", "Le / la are singular the", "Les is plural the for all genders"] },
    ] },
  ],
  pt: [
    { id: "pt-m1", title: "Saudações e apresentações", subtitle: "Português A1 · Unidade 1", summary: "Greet people and introduce yourself in Portuguese.", lessons: [
      { id: "pt-m1-l1", title: "Saudações básicas", subtitle: "Olá, bom dia, adeus", points: ["Olá means hello", "Bom dia means good morning", "Boa tarde / boa noite are afternoon / evening greetings"] },
      { id: "pt-m1-l2", title: "Apresentar-se", subtitle: "Chamo-me… / Eu sou…", points: ["Chamo-me Ana = My name is Ana", "Sou do Quénia = I am from Kenya", "Muito prazer means nice to meet you"] },
      { id: "pt-m1-l3", title: "Perguntas simples", subtitle: "Como, onde and qual", points: ["Como te chamas? asks your name", "De onde és? asks where you are from", "Como estás? asks how you are"] },
    ] },
    { id: "pt-m2", title: "Pronomes e o verbo ser", subtitle: "Português A1 · Unidade 2", summary: "Use subject pronouns and ser to describe identity and origin.", lessons: [
      { id: "pt-m2-l1", title: "Pronomes pessoais", subtitle: "eu, tu, ele, ela, nós, vocês", points: ["Eu means I; tu is informal you", "Ele / ela mean he / she", "Nós means we"] },
      { id: "pt-m2-l2", title: "O verbo ser", subtitle: "sou, és, é, somos, são", points: ["Eu sou = I am", "Tu és / ela é = you are / she is", "Ser describes identity, origin and lasting characteristics"] },
      { id: "pt-m2-l3", title: "Artigos e género", subtitle: "o, a, os, as, um, uma", points: ["O / a are singular the", "Os / as are plural the", "Nouns are commonly masculine or feminine"] },
    ] },
  ],
  ar: [
    {
      id: "ar-m1",
      title: "Letter Shapes & Harakat",
      subtitle: "Alif Baa · Unit 1",
      summary: "Every letter in its positional shapes, then the short vowels that voice them.",
      lessons: [
        { id: "ar-m1-l1", title: "Positional shapes", subtitle: "Isolated, initial, medial, final", points: ["ب ت ث share one body and differ by dots", "A letter changes shape when it joins", "Six letters never join to the left"] },
        { id: "ar-m1-l2", title: "Harakat", subtitle: "Fathah, kasrah, dammah, sukun", points: ["Fathah is a short a — بَ", "Kasrah is a short i — بِ", "Sukun closes the syllable — بْ"] },
        { id: "ar-m1-l3", title: "Shaddah & long vowels", subtitle: "Gemination and ا و ي", points: ["Shaddah doubles the consonant", "ا after fathah gives long ā", "و and ي lengthen u and i"] },
      ],
    },
    {
      id: "ar-m2",
      title: "Nominal Sentences & Pronouns",
      subtitle: "Alif Baa · Unit 2",
      summary: "أنا، أنتَ، هو — and the equational sentence that needs no verb.",
      lessons: [
        { id: "ar-m2-l1", title: "Detached pronouns", subtitle: "أنا أنتَ أنتِ هو هي", points: ["أنتَ for a man, أنتِ for a woman", "هو / هي for he and she", "نحن covers we"] },
        { id: "ar-m2-l2", title: "Equational sentence", subtitle: "Subject + predicate", points: ["Present tense drops “is”", "أنا طالب = I am a student", "هو من أمريكا = he is from America"] },
        { id: "ar-m2-l3", title: "Negation with ليس", subtitle: "ليس / ليست", points: ["ليس agrees with its subject", "ليست for feminine subjects", "لستُ = I am not"] },
      ],
    },
    {
      id: "ar-m3",
      title: "3-Letter Root System",
      subtitle: "Alif Baa · Unit 3",
      summary: "One root, many words: ك-ت-ب gives kataba, yaktubu and kitāb.",
      lessons: [
        { id: "ar-m3-l1", title: "The K-T-B family", subtitle: "ك-ت-ب → كاتب / كتاب / مكتبة", points: ["Most roots carry three letters", "ك-ت-ب gives the writing words", "Patterns shape the meaning"] },
        { id: "ar-m3-l2", title: "Past tense", subtitle: "كَتَبَ and its endings", points: ["هو كتب = he wrote", "هم كتبوا adds ـوا", "أنتِ كتبتِ adds ـتِ"] },
        { id: "ar-m3-l3", title: "Present tense", subtitle: "يكتب — أ / ت / ي / ن", points: ["يكتب = he writes", "تكتب = she writes", "أكتب = I write"] },
      ],
    },
    {
      id: "ar-m4",
      title: "Possessive Suffixes & Gender",
      subtitle: "Mastering Arabic · Unit 4",
      summary: "Tāʾ marbūṭah marks feminine, and suffixes show who owns what.",
      lessons: [
        { id: "ar-m4-l1", title: "Tāʾ marbūṭah", subtitle: "ة and feminine agreement", points: ["ة is written but often silent — طالبة", "Adjectives follow the noun's gender", "Masculine adjectives drop ة"] },
        { id: "ar-m4-l2", title: "Possessive suffixes", subtitle: "ـي ـكَ ـكِ ـهُ ـهَا", points: ["كتابي = my book", "كتابكَ / كتابكِ = your book", "كتابه / كتابها = his / her book"] },
        { id: "ar-m4-l3", title: "Idaafa", subtitle: "كتاب الطالب", points: ["The first noun takes no ال", "Nothing sits between the two nouns", "The second noun is genitive"] },
      ],
    },
  ],
  de: [
    {
      id: "de-m1",
      title: "Alphabet, Umlauts & Pronouns",
      subtitle: "Menschen A1 · Unit 1",
      summary: "Say the letters, round the umlauts, then meet ich, du and er.",
      lessons: [
        { id: "de-m1-l1", title: "A–Z sounds", subtitle: "Letter names", points: ["V sounds like English f", "W sounds like English v", "J sounds like y"] },
        { id: "de-m1-l2", title: "Umlauts & ß", subtitle: "ä ö ü ß", points: ["ä is a fronted a", "ü rounds the lips", "ß follows a long vowel — Straße"] },
        { id: "de-m1-l3", title: "Personal pronouns", subtitle: "ich du er sie es", points: ["ich / du for I and you", "er / sie / es for he, she, it", "Sie (capitalised) is formal you"] },
      ],
    },
    {
      id: "de-m2",
      title: "Noun Genders & Plurals",
      subtitle: "Menschen A1 · Unit 2",
      summary: "der, die, das — and the plural shapes that go with them.",
      lessons: [
        { id: "de-m2-l1", title: "der / die / das", subtitle: "Three genders", points: ["Learn the article with the noun", "der Mann, die Frau, das Kind", "Gender is not biological"] },
        { id: "de-m2-l2", title: "Gender clues", subtitle: "Endings that give it away", points: ["-ung, -heit, -keit are die", "-chen and -lein are das", "Agent nouns in -er are usually der"] },
        { id: "de-m2-l3", title: "Plural forms", subtitle: "-e, -er, -n, -s, umlaut", points: ["die Frau → die Frauen", "das Kind → die Kinder", "Every plural article is die"] },
      ],
    },
    {
      id: "de-m3",
      title: "Present Tense Conjugation",
      subtitle: "Menschen A1 · Unit 3",
      summary: "Regular endings first, then sein and haben — the two you cannot skip.",
      lessons: [
        { id: "de-m3-l1", title: "Regular verbs", subtitle: "machen → ich mache", points: ["Stem + ending", "du -st, er/sie -t", "wir and sie use the infinitive"] },
        { id: "de-m3-l2", title: "sein", subtitle: "bin, bist, ist, sind, seid", points: ["ich bin, du bist", "er ist, wir sind", "sein is irregular all the way"] },
        { id: "de-m3-l3", title: "haben & vowel change", subtitle: "du hast / du sprichst", points: ["ich habe, du hast, er hat", "sprechen → du sprichst", "Only du and er/sie shift the vowel"] },
      ],
    },
    {
      id: "de-m4",
      title: "Nominative vs Accusative",
      subtitle: "Menschen A1 · Unit 4",
      summary: "Only the masculine article moves: der Mann becomes den Mann.",
      lessons: [
        { id: "de-m4-l1", title: "Nominative", subtitle: "The subject case", points: ["der Mann, die Frau, das Kind", "Nominative marks who does", "Plural is always die"] },
        { id: "de-m4-l2", title: "Accusative", subtitle: "den / die / das", points: ["Masculine only: der → den", "ein → einen", "die and das stay the same"] },
        { id: "de-m4-l3", title: "Accusative in use", subtitle: "Ich habe den Schlüssel", points: ["Direct objects take the accusative", "mich / dich for pronouns", "es gibt takes the accusative"] },
      ],
    },
  ],
  ja: [
    {
      id: "ja-m1",
      title: "Hiragana & Katakana Grids",
      subtitle: "Genki I · Unit 1",
      summary: "Both syllabaries, row by row, until the grid reads itself.",
      lessons: [
        { id: "ja-m1-l1", title: "Hiragana あ–の", subtitle: "Vowel, k, s and t rows", points: ["あいうえお is the vowel row", "か row is k-sounds", "Stroke order runs top-left first"] },
        { id: "ja-m1-l2", title: "Hiragana は–ん", subtitle: "Dakuten and handakuten", points: ["が = ga, ぱ = pa", "Small っ doubles a consonant", "ん never starts a word"] },
        { id: "ja-m1-l3", title: "Katakana ア–ン", subtitle: "Loanwords", points: ["Katakana writes foreign words", "シ and ツ differ in stroke direction", "ー lengthens a vowel"] },
      ],
    },
    {
      id: "ja-m2",
      title: "Self-Introductions & Particles",
      subtitle: "Genki I · Unit 2",
      summary: "はじめまして — は marks the topic, の links two nouns.",
      lessons: [
        { id: "ja-m2-l1", title: "Self-introduction", subtitle: "私は…です", points: ["私はマイクです = I am Mike", "はじめまして = nice to meet you", "よろしくお願いします closes"] },
        { id: "ja-m2-l2", title: "は (wa)", subtitle: "The topic marker", points: ["Written ha, read wa as a particle", "It marks what the sentence is about", "私は学生です"] },
        { id: "ja-m2-l3", title: "の (no)", subtitle: "Possession and linking", points: ["私の大学 = my university", "の links two nouns", "日本語の先生 = teacher of Japanese"] },
      ],
    },
    {
      id: "ja-m3",
      title: "Verb Types & Plain vs ます",
      subtitle: "Genki I · Unit 3",
      summary: "ru-verbs and u-verbs, then the polite ます form built from them.",
      lessons: [
        { id: "ja-m3-l1", title: "ru-verbs vs u-verbs", subtitle: "食べる / 飲む", points: ["食べる keeps -e before ます", "飲む takes the i-row before ます", "The dictionary form is the plain form"] },
        { id: "ja-m3-l2", title: "Polite ます", subtitle: "食べます / 飲みます", points: ["Stem + ます for the present", "Negative is ません", "Past is ました / ませんでした"] },
        { id: "ja-m3-l3", title: "Plain form in use", subtitle: "When to drop ます", points: ["行く vs 行きます", "Plain form is used inside clauses", "Plain form is casual speech"] },
      ],
    },
    {
      id: "ja-m4",
      title: "Object & Place Particles",
      subtitle: "Genki I · Unit 4",
      summary: "を marks what you act on, で where you do it, に where you go.",
      lessons: [
        { id: "ja-m4-l1", title: "を (wo)", subtitle: "Direct object", points: ["ごはんを食べます = I eat rice", "を marks the object only", "It is read o, not wo"] },
        { id: "ja-m4-l2", title: "で (de)", subtitle: "Place of action", points: ["図書館で勉強します", "で marks where something happens", "図書館にいます uses に instead"] },
        { id: "ja-m4-l3", title: "に (ni)", subtitle: "Destination and time", points: ["日本に行きます = I go to Japan", "七時に起きます = I get up at seven", "に marks a point in time or space"] },
      ],
    },
  ],
};

export const BADGES = [
  {
    id: "first-step",
    name: "First Step",
    description: "Finish your very first lesson.",
    icon: "sparkles",
    target: 1,
    value: (p) => p.lessons.length,
    label: (p) => `${Math.min(p.lessons.length, 1)} / 1 lesson`,
  },
  {
    id: "alphabet-master",
    name: "Alphabet Master",
    description: "Complete all three Unit 1 lessons in any language.",
    icon: "type",
    target: 3,
    value: (p) => p.lessons.filter((id) => id.includes("-m1-")).length,
    label: (p) => `${Math.min(p.lessons.filter((id) => id.includes("-m1-")).length, 3)} / 3 lessons`,
  },
  {
    id: "streak-7",
    name: "7-Day Streak",
    description: "Study on seven days in a row.",
    icon: "flame",
    target: 7,
    value: (p) => p.streak,
    label: (p) => `${Math.min(p.streak, 7)} / 7 days`,
  },
  {
    id: "streak-30",
    name: "Thirty Days On",
    description: "A full month without missing a day.",
    icon: "calendar",
    target: 30,
    value: (p) => p.streak,
    label: (p) => `${Math.min(p.streak, 30)} / 30 days`,
  },
  {
    id: "verb-conqueror",
    name: "Verb Conqueror",
    description: "Complete all three Unit 3 lessons in any language.",
    icon: "swords",
    target: 3,
    value: (p) => p.lessons.filter((id) => id.includes("-m3-")).length,
    label: (p) => `${Math.min(p.lessons.filter((id) => id.includes("-m3-")).length, 3)} / 3 lessons`,
  },
  {
    id: "polyglot",
    name: "Polyglot Apprentice",
    description: "Earn XP in more than one language.",
    icon: "languages",
    target: 2,
    value: (_p, all) => Object.values(all).filter((x) => x.xpTotal > 0).length,
    label: (_p, all) => `${Math.min(Object.values(all).filter((x) => x.xpTotal > 0).length, 2)} / 2 languages`,
  },
  {
    id: "card-shark",
    name: "Card Shark",
    description: "Review 100 flashcards.",
    icon: "layers",
    target: 100,
    value: (p) => p.cardsTotal,
    label: (p) => `${Math.min(p.cardsTotal, 100)} / 100 cards`,
  },
  {
    id: "xp-500",
    name: "Five Hundred Club",
    description: "Bank 500 XP across all languages.",
    icon: "trophy",
    target: 500,
    value: (_p, all) => Object.values(all).reduce((sum, x) => sum + x.xpTotal, 0),
    label: (_p, all) => `${Math.min(Object.values(all).reduce((sum, x) => sum + x.xpTotal, 0), 500)} / 500 XP`,
  },
];