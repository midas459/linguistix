import { Volume2 } from "lucide-react";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";

export default function AudioButton({ text, lang, label, className }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        speak(text, lang);
      }}
      aria-label={label ? `Play pronunciation of ${label}` : `Play pronunciation of ${text}`}
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-[hsl(var(--lang))] hover:text-[hsl(var(--lang))]",
        className,
      )}
    >
      <Volume2 className="h-4 w-4" strokeWidth={1.8} />
    </button>
  );
}