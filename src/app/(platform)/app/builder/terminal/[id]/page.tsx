import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import TerminalChat from '@/components/builder/TerminalChat';

export default async function TerminalPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, type, user_id, status, description, questionnaire_answers')
    .eq('id', params.id)
    .single();

  if (!project || project.user_id !== user.id) {
    notFound();
  }

  // Fetch chat history
  const { data: history } = await supabase
    .from('builder_chat_messages')
    .select('role, content, created_at')
    .eq('project_id', project.id)
    .order('created_at', { ascending: true });

  return (
    <div className="w-full max-w-7xl mx-auto pb-8 px-4 lg:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-serif text-[var(--text-primary)]">Project Workspace</h1>
        <p className="text-[var(--text-secondary)]">Watch DIGITN AI build your project, then chat to modify it.</p>
      </div>

      <TerminalChat
        projectId={project.id}
        projectName={project.name}
        initialStatus={project.status}
        projectType={project.type}
        projectDescription={project.description}
        questionnaireAnswers={project.questionnaire_answers}
        history={history || []}
      />
    </div>
  );
}