import { Link, createFileRoute } from "@tanstack/react-router";
import LessonPlayer from "@/components/lesson/LessonPlayer";
import { MODULES } from "@/data/curriculum";
import { useLearn } from "@/lib/learn-store";

export const Route = createFileRoute("/_authed/lesson/$lessonId")({
  head: () => ({
    meta: [{ title: "Lesson — Linguistix" }],
  }),
  component: LessonRoute,
});

function LessonRoute() {
  const { lessonId } = Route.useParams();
  const { lang } = useLearn();
  const modules = MODULES[lang] || MODULES.ar;
  const found = modules
    .map((module) => ({ module, lesson: module.lessons.find((l) => l.id === lessonId) }))
    .find((row) => row.lesson);

  if (!found) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl">That lesson isn’t in this language’s path</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Switch language in the top bar, or pick a lesson from the dashboard.
        </p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return <LessonPlayer module={found.module} lesson={found.lesson} />;
}