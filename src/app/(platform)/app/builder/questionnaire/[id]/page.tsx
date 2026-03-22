import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import QuestionnaireForm from '@/components/builder/QuestionnaireForm';

export default async function QuestionnairePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: project } = await supabase
    .from('projects')
    .select('id, user_id, analysis_result, status')
    .eq('id', params.id)
    .single();

  if (!project || project.user_id !== user.id) {
    notFound();
  }

  // If already building/ready, shouldn't be here
  if (project.status !== 'analyzing' && project.status !== 'planning') {
      redirect(`/app/builder/terminal/${project.id}`);
  }

  // Extract questions from analysis result
  const analysisResult = project.analysis_result as { ready: boolean, questions?: any[] } | null;
  const questions = analysisResult?.questions || [];

  if (questions.length === 0) {
      // Fallback if no questions but somehow ended up here
      redirect(`/app/builder/terminal/${project.id}`);
  }

  return (
    <div className="w-full">
      <QuestionnaireForm projectId={project.id} questions={questions} />
    </div>
  );
}
