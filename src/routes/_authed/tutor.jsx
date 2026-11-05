import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/shell/PageHeader";
import TutorChat from "@/components/tutor/TutorChat";
import { useLearn } from "@/lib/learn-store";

export const Route = createFileRoute("/_authed/tutor")({
  head: () => ({
    meta: [
      { title: "Kalam AI — Lisan" },
      { name: "description", content: "A language tutor that breaks down grammar, builds quizzes and roleplays real conversations." },
    ],
  }),
  component: TutorPage,
});

function TutorPage() {
  const { language } = useLearn();
  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Kalam AI"
        title={`Your ${language.label} tutor`}
        description="Ask for a grammatical breakdown, generate a three-question quiz from your weak points, or practise a real scenario with instant translation."
      />
      <div className="mt-8">
        <TutorChat />
      </div>
    </div>
  );
}