import { getUserProfile, getProject, listProjectMessages } from "@/lib/api/server";
import { notFound, redirect } from "next/navigation";
import TerminalChat from "@/components/builder/TerminalChat";

export default async function TerminalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserProfile();

  if (!user) redirect("/auth/login");

  const project = await getProject(id);

  if (!project || project.user !== user.id) {
    notFound();
  }

  const history = await listProjectMessages(id) || [];

  return (
    <div className="w-full max-w-7xl mx-auto pb-8 px-4 lg:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-serif text-[var(--text-primary)]">
          Project Workspace
        </h1>
        <p className="text-[var(--text-secondary)]">
          Watch DIGITN AI build your project, then chat to modify it.
        </p>
      </div>

      <TerminalChat
        projectId={project.id}
        projectName={project.name}
        initialStatus={project.status}
        projectType={project.type || "website"}
        projectStack={project.stack || project.type || "html-css-js"}
        projectDescription={project.description}
        questionnaireAnswers={project.questionnaire_answers}
        history={history}
        initialPhase={project.current_phase}
        initialTask={project.current_task}
        initialPlanContent={project.plan_text || ""}
      />
    </div>
  );
}