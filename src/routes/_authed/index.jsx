import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import DashboardHero from "@/components/dashboard/DashboardHero";
import LearningPath, { nextLesson } from "@/components/dashboard/LearningPath";
import LessonDialog from "@/components/dashboard/LessonDialog";
import BadgeCarousel from "@/components/dashboard/BadgeCarousel";
import { MODULES } from "@/data/curriculum";
import { useLearn } from "@/lib/learn-store";

export const Route = createFileRoute("/_authed/")({
  head: () => ({
    meta: [
      { title: "Learn — Lisan" },
      { name: "description", content: "Your daily path through Arabic, German or Japanese." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { lang, progress } = useLearn();
  const [selection, setSelection] = useState(null);
  const modules = MODULES[lang] || MODULES.ar;
  const upNext = nextLesson(modules, progress.lessons);

  return (
    <div>
      <DashboardHero
        onResume={() => setSelection(upNext)}
        resumeLabel={progress.lessons.length === 0 ? "Start first lesson" : `Resume · ${upNext.lesson.title}`}
      />
      <LearningPath onSelect={setSelection} />
      <BadgeCarousel />
      <LessonDialog selection={selection} onClose={() => setSelection(null)} />
    </div>
  );
}