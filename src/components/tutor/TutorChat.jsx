import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Languages, Lightbulb, Loader2, ListChecks, MessagesSquare, Send } from "lucide-react";
import { askTutor } from "@/lib/server-fns";
import { useLearn } from "@/lib/learn-store";
import { cn } from "@/lib/utils";
import QuizCard from "@/components/tutor/QuizCard";

const MODES = [
  { id: "breakdown", label: "Breakdown", icon: Lightbulb },
  { id: "quiz", label: "Mini quiz", icon: ListChecks },
  { id: "roleplay", label: "Roleplay", icon: MessagesSquare },
];

const SCENARIOS = {
  ar: ["Ordering at a café", "Introducing yourself", "Asking for directions"],
  de: ["Im Restaurant bestellen", "Sich vorstellen", "Nach dem Weg fragen"],
  ja: ["喫茶店で注文", "自己紹介", "道をたずねる"],
};

const STARTERS = {
  ar: "Let's start with a sentence: أَنا طالِب. Break it down for me.",
  de: "Let's start with a sentence: Der Mann ist Lehrer. Break it down for me.",
  ja: "Let's start with a sentence: 私は学生です。Break it down for me.",
};

export default function TutorChat() {
  const { lang, language } = useLearn();
  const ask = useServerFn(askTutor);
  const [mode, setMode] = useState("breakdown");
  const [scenario, setScenario] = useState(SCENARIOS.ar[0]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    setMessages([]);
    setInput("");
    setError("");
    setScenario(SCENARIOS[lang]?.[0] ?? SCENARIOS.ar[0]);
  }, [lang]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  const send = async (text) => {
    const value = text.trim();
    if (!value || busy) return;
    const history = messages.slice(-8).map((m) => ({ role: m.role, content: m.text }));
    setMessages((prev) => [...prev, { role: "user", text: value }]);
    setInput("");
    setBusy(true);
    setError("");
    try {
      const data = await ask({
        data: { language: lang, mode, message: value, history, scenario: mode === "roleplay" ? scenario : undefined },
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply || "Let me try that again — ask me once more.", translation: data.translation, quiz: data.quiz },
      ]);
    } catch (err) {
      setError(
        err?.message === "Kalam AI is not configured. Add GEMINI_API_KEY as a Base44 server secret."
          ? err.message
          : "Kalam AI couldn't answer just now. Try sending that again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      <div className="flex min-h-[560px] flex-col rounded-[26px] border border-border/70 bg-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/70 p-3 sm:p-4">
          <div className="flex rounded-full bg-muted p-0.5">
            {MODES.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    mode === item.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" /> {item.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setShowTranslation((v) => !v)}
            className={cn(
              "ml-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              showTranslation ? "border-[hsl(var(--lang))] text-[hsl(var(--lang))]" : "border-border text-muted-foreground",
            )}
          >
            <Languages className="h-3.5 w-3.5" /> Translation {showTranslation ? "on" : "off"}
          </button>
        </div>

        {mode === "roleplay" && (
          <div className="flex flex-wrap gap-2 border-b border-border/70 px-3 py-2.5 sm:px-4">
            {(SCENARIOS[lang] ?? []).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setScenario(item)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  scenario === item ? "border-[hsl(var(--lang))] bg-[hsl(var(--lang)/0.08)] text-foreground" : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {messages.length === 0 && (
            <div className="rounded-2xl bg-muted/50 p-4">
              <p className="text-sm font-medium">Kalam AI · {language.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {mode === "quiz"
                  ? "Tell me what you've been studying and I'll build you three questions on the weakest part of it."
                  : mode === "roleplay"
                    ? `We're playing: ${scenario}. Start whenever you're ready — I'll answer in ${language.label} and correct gently.`
                    : "Paste a sentence, a word, or a root and I'll take it apart with you."}
              </p>
              <button
                type="button"
                onClick={() => send(STARTERS[lang] ?? STARTERS.ar)}
                className="mt-3 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
              >
                Start with an example
              </button>
            </div>
          )}

          {messages.map((message, i) => (
            <div key={i} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-relaxed",
                  message.role === "user" ? "bg-primary text-primary-foreground" : "border border-border/70 bg-background",
                )}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                {message.role === "assistant" && showTranslation && message.translation && (
                  <p className="mt-2 border-t border-border/60 pt-2 text-xs italic text-muted-foreground">{message.translation}</p>
                )}
                {message.role === "assistant" && <QuizCard quiz={message.quiz} />}
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Kalam AI is thinking…
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2 border-t border-border/70 p-3 sm:p-4"
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder={mode === "quiz" ? "What are you working on?" : "Write in the language you're learning…"}
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send message"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-primary-foreground disabled:opacity-40"
            style={{ background: "hsl(var(--foreground))" }}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      <aside className="space-y-4">
        <div className="rounded-[26px] border border-border/70 bg-card p-5">
          <p className="font-mono-label text-[11px] uppercase tracking-[0.16em] text-muted-foreground">This tutor knows</p>
          <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
            {(language.code === "ar"
              ? ["28 letters and their four shapes", "Harakat and root families", "Nominal sentences without “to be”"]
              : language.code === "de"
                ? ["Umlauts, ß and German sound rules", "der / die / das and the four cases", "Verb conjugation and word order"]
                : ["Hiragana, katakana and romaji", "Particles は が を に で", "Plain vs ます verb forms"]
            ).map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "hsl(var(--lang))" }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[26px] border border-border/70 bg-card p-5">
          <p className="font-mono-label text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Modes</p>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="font-medium">Breakdown</dt>
              <dd className="text-muted-foreground">Word-by-word grammar on anything you paste.</dd>
            </div>
            <div>
              <dt className="font-medium">Mini quiz</dt>
              <dd className="text-muted-foreground">Three questions on your weakest points.</dd>
            </div>
            <div>
              <dt className="font-medium">Roleplay</dt>
              <dd className="text-muted-foreground">Live scenarios with instant translation.</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
}