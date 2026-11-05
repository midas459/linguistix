import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Clock, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLearn } from "@/lib/learn-store";

export default function LessonDialog({ selection, onClose }) {
  const { completeLesson, progress } = useLearn();
  const module = selection?.module;
  const lesson = selection?.lesson;
  const done = lesson ? progress.lessons.includes(lesson.id) : false;

  return (
    <Dialog open={!!selection} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg rounded-3xl">
        {lesson && (
          <>
            <DialogHeader>
              <p className="font-mono-label text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{module.title}</p>
              <DialogTitle className="font-display text-2xl leading-tight">{lesson.title}</DialogTitle>
              <DialogDescription className="text-sm">{lesson.subtitle}</DialogDescription>
            </DialogHeader>

            <ul className="mt-2 space-y-2.5">
              {lesson.points.map((point) => (
                <li key={point} className="flex items-start gap-3 rounded-2xl bg-muted/60 px-3.5 py-2.5 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--lang))]" strokeWidth={2.4} />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>

            <div className="mt-1 flex items-center gap-4 font-mono-label text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> 3 min
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> +20 XP
              </span>
            </div>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button asChild className="h-11 flex-1 rounded-full">
                <Link to="/lesson/$lessonId" params={{ lessonId: lesson.id }} onClick={onClose}>
                  Start the lesson <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                className="h-11 rounded-full"
                variant="outline"
                disabled={done}
                onClick={() => {
                  completeLesson(lesson, module.title);
                  onClose();
                }}
              >
                {done ? "Completed" : "Mark complete"}
              </Button>
            </div>
            <Button asChild variant="ghost" className="mt-1 h-9 rounded-full">
              <Link to="/tutor" onClick={onClose}>
                Practise with Kalam AI <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}