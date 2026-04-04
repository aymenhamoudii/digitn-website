import { getUserProfile, getProject } from "@/lib/api/server";
import { notFound, redirect } from "next/navigation";
import PresentationStudio from "@/components/builder/PresentationStudio";
import { Header } from "@/components/layout/Header";

export default async function StudioPage({
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

  // If not a presentation, redirect to terminal
  if (project.type !== "presentation") {
    redirect(`/app/builder/terminal/${project.id}`);
  }

  // If still in questionnaire phase, redirect back
  if (project.status === "analyzing" || project.status === "planning") {
    redirect(`/app/builder/questionnaire/${project.id}`);
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <Header title={project.name} />
      <div className="flex-1 px-4 py-4">
        <PresentationStudio
          projectId={project.id}
          projectName={project.name}
          initialStatus={project.status}
          totalSlides={project.total_slides || 0}
          presentationJson={project.presentation_json}
        />
      </div>
    </div>
  );
}
