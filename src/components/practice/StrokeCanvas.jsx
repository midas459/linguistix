import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Eraser, Eye, EyeOff, PenTool, Volume2 } from "lucide-react";
import { buildTargetMask, gradeStroke } from "@/lib/grade-stroke";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";

const FEEDBACK = (score) => {
  if (score >= 85) return { label: "Excellent", tone: "text-[hsl(var(--chart-2))]" };
  if (score >= 65) return { label: "Good shape", tone: "text-[hsl(var(--chart-3))]" };
  if (score >= 40) return { label: "Getting there", tone: "text-[hsl(var(--chart-1))]" };
  return { label: "Try again", tone: "text-destructive" };
};

/** Handwriting pad: ghost guide, Qalam pen, and a 0–100% accuracy grade. */
export default function StrokeCanvas({ glyph, lang = "ar-SA", guideClass = "", audioText }) {
  const canvasRef = useRef(null);
  const guideRef = useRef(null);
  const targetRef = useRef(null);
  const drawing = useRef(false);
  const lastPoint = useRef(null);
  const inkColor = useRef("hsl(160 74% 34%)");

  const [inked, setInked] = useState(false);
  const [hints, setHints] = useState(true);
  const [qalam, setQalam] = useState(true);
  const [mark, setMark] = useState(null);

  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const side = rect.width > 40 ? rect.width : 320;
    canvas.width = Math.round(side * dpr);
    canvas.height = Math.round(side * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const hue = window.getComputedStyle(document.documentElement).getPropertyValue("--lang").trim();
    inkColor.current = hue ? `hsl(${hue})` : "#0f766e";
    ctx.strokeStyle = inkColor.current;
    const font = guideRef.current ? window.getComputedStyle(guideRef.current).fontFamily : "sans-serif";
    targetRef.current = buildTargetMask(canvas, glyph, font);
  }, [glyph]);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setInked(false);
    setMark(null);
  }, []);

  useEffect(() => {
    setup();
    clear();
    const onResize = () => {
      setup();
      clear();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setup, clear]);

  const point = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const start = (event) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drawing.current = true;
    lastPoint.current = point(event);
    setInked(true);
    setMark(null);
  };

  const move = (event) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const to = point(event);
    const from = lastPoint.current || to;
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    ctx.strokeStyle = inkColor.current;
    ctx.lineWidth = qalam ? Math.max(1.8, 8.5 - dist * 0.5) : 5.5;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    lastPoint.current = to;
  };

  const end = () => {
    drawing.current = false;
    lastPoint.current = null;
  };

  const grade = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!targetRef.current) {
      const font = guideRef.current ? window.getComputedStyle(guideRef.current).fontFamily : "sans-serif";
      targetRef.current = buildTargetMask(canvas, glyph, font);
    }
    setMark(gradeStroke(canvas, targetRef.current));
  };

  const feedback = mark && !mark.empty ? FEEDBACK(mark.score) : null;

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-[26px] border border-border bg-card">
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70">
          <span className="absolute inset-x-6 top-1/2 border-t border-dashed border-border" />
          <span className="absolute inset-y-6 left-1/2 border-l border-dashed border-border" />
        </span>
        <span
          ref={guideRef}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 grid select-none place-items-center text-[7rem] leading-none transition-opacity duration-200 sm:text-[8.5rem]",
            guideClass,
            hints ? "text-foreground/15 opacity-100" : "opacity-0",
          )}
        >
          {glyph}
        </span>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full cursor-crosshair touch-none"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          aria-label={`Handwriting pad for ${glyph}`}
        />
        {mark && (
          <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-background/90 px-3 py-1.5 shadow-sm backdrop-blur">
            {mark.empty ? (
              <span className="font-mono-label text-[11px] text-muted-foreground">Draw over the guide first</span>
            ) : (
              <span className={cn("font-mono-label text-[11px] font-medium", feedback.tone)}>
                {mark.score}% · {feedback.label}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setHints((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
        >
          {hints ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {hints ? "Hide hint" : "Show hint"}
        </button>
        <button
          type="button"
          onClick={() => setQalam((v) => !v)}
          aria-pressed={qalam}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            qalam ? "border-[hsl(var(--lang))] text-[hsl(var(--lang))]" : "border-border hover:bg-accent",
          )}
        >
          <PenTool className="h-3.5 w-3.5" /> Qalam
        </button>
        <button
          type="button"
          onClick={() => speak(audioText || glyph, lang)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
        >
          <Volume2 className="h-3.5 w-3.5" /> Listen
        </button>
        <button
          type="button"
          onClick={clear}
          disabled={!inked}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-40"
        >
          <Eraser className="h-3.5 w-3.5" /> Clear
        </button>
        <button
          type="button"
          onClick={grade}
          disabled={!inked}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Check className="h-3.5 w-3.5" /> Grade
        </button>
      </div>
    </div>
  );
}