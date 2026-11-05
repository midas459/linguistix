import { useState } from "react";
import { Check } from "lucide-react";

export default function QuizCard({ quiz }) {
  const [shown, setShown] = useState({});

  if (!quiz?.length) return null;

  return (
    <div className="mt-3 space-y-2.5">
      {quiz.map((item, i) => (
        <div key={item.question} className="rounded-2xl border border-border/80 bg-background p-3.5">
          <p className="text-sm font-medium leading-relaxed">
            {i + 1}. {item.question}
          </p>
          {shown[i] ? (
            <p className="mt-2 flex items-start gap-2 text-sm text-[hsl(var(--lang))]">
              <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.4} />
              {item.answer}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setShown((s) => ({ ...s, [i]: true }))}
              className="mt-2 rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors hover:bg-accent"
            >
              Show answer
            </button>
          )}
        </div>
      ))}
    </div>
  );
}