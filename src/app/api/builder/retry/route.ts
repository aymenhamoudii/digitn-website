import { NextResponse } from 'next/server';
import { getUserProfile, getProject, updateProject, listProjects, createProject, checkAndConsumeQuota, deleteProject } from '@/lib/api/server';
import { BRIDGE_URL } from '@/config/platform';

export async function POST(req: Request) {
  try {
    const user = await getUserProfile();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { projectId } = await req.json();
    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    const original = await getProject(projectId);
    if (!original || original.user !== user.id) {
      return NextResponse.json({ error: 'Project not found or unauthorized', code: 'NOT_FOUND' }, { status: 404 });
    }

    if (original.status === 'ready') {
      return NextResponse.json({ error: 'This project has already completed successfully. Please refresh the page.', code: 'ALREADY_READY' }, { status: 400 });
    }

    if (!['failed', 'building', 'analyzing', 'planning'].includes(original.status)) {
      return NextResponse.json({ error: 'Only failed or stuck projects can be retried', code: 'INVALID_STATE' }, { status: 400 });
    }

    const tier = user.tier || 'free';
    const maxProjects = tier === 'plus' ? 9999 : tier === 'pro' ? 3 : 1;

    const projects = await listProjects();
    const activeCount = (projects || []).filter((p: any) =>
      ['analyzing', 'planning', 'building', 'ready'].includes(p.status) && p.id !== projectId
    ).length;

    if (activeCount >= maxProjects) {
      return NextResponse.json({
        error: `Active project limit reached (${maxProjects}). Delete a project first.`,
        code: 'PROJECT_LIMIT',
      }, { status: 429 });
    }

    // Check quota via server-side (sends token)
    const quotaResult = await checkAndConsumeQuota('builder');
    if (!quotaResult?.allowed) {
      return NextResponse.json({
        error: 'Builder limit reached. Resets at midnight — or upgrade your plan.',
        code: 'QUOTA_EXCEEDED',
      }, { status: 429 });
    }

    const newProject = await createProject({
      name: original.name,
      description: original.description,
      stack: original.stack,
      type: original.type,
      questionnaire_answers: original.questionnaire_answers,
      status: 'building',
    });

    if (!newProject) {
      return NextResponse.json({ error: 'Failed to create new project', code: 'INTERNAL_ERROR' }, { status: 500 });
    }

    // Clean up old bridge files
    try {
      await fetch(`${BRIDGE_URL}/build/${projectId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${process.env.BRIDGE_SECRET}` },
      });
    } catch (fileErr) {
      console.warn('Bridge file deletion failed (non-fatal):', fileErr);
    }

    // Delete old failed project
    const deleted = await deleteProject(projectId);
    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete old project', code: 'INTERNAL_ERROR' }, { status: 500 });
    }

    let planText = original.stack ? `Stack: ${original.stack}\n\n${original.description}` : original.description;
    if (original.questionnaire_answers) {
      planText = `${planText}\n\nAdditional Clarifications:\n${original.questionnaire_answers}`;
    }

    try {
      const bridgeResponse = await fetch(`${BRIDGE_URL}/build/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.BRIDGE_SECRET}`,
        },
        body: JSON.stringify({
          projectId: newProject.id,
          planText,
          userId: user.id,
          userTier: user.tier,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!bridgeResponse.ok) {
        await updateProject(newProject.id, { status: 'failed' });
        console.error('Bridge retry failed:', bridgeResponse.status);
        return NextResponse.json(
          { error: 'Build service error. Try again.', code: 'BRIDGE_ERROR' },
          { status: 502 }
        );
      }
    } catch (bridgeErr: any) {
      console.error('Bridge unreachable (retry):', bridgeErr.message);
      await updateProject(newProject.id, { status: 'failed' });
      return NextResponse.json(
        { error: 'Build service temporarily unavailable. Please try again.', code: 'BRIDGE_UNAVAILABLE' },
        { status: 503 }
      );
    }

    return NextResponse.json({ newProjectId: newProject.id });
  } catch (error: any) {
    console.error('Retry build error:', error);
    return NextResponse.json({ error: error.message, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
