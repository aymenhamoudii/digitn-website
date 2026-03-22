// src/app/api/builder/start/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { BRIDGE_URL } from '@/config/platform';
import { checkAndIncrementQuota } from '@/lib/quota';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { projectId, answers } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    // Get project and verify ownership/status
    const { data: project, error: getError } = await supabase
      .from('projects')
      .select('status, user_id, description, created_at')
      .eq('id', projectId)
      .single();

    if (getError || !project || project.user_id !== user.id) {
      return NextResponse.json({ error: 'Project not found or unauthorized', code: 'NOT_FOUND' }, { status: 404 });
    }

    // Idempotency: if already building or ready, return success
    if (project.status === 'building' || project.status === 'ready') {
      return NextResponse.json({ success: true, projectId });
    }

    if (project.status !== 'analyzing' && project.status !== 'failed' && project.status !== 'planning') {
      return NextResponse.json({ error: 'Invalid project status', code: 'INVALID_STATE' }, { status: 400 });
    }

    const { data: userData } = await supabase.from('users').select('tier').eq('id', user.id).maybeSingle();
    const tier = userData?.tier || 'free';

    // Check if analysis was done recently AND there are no answers (meaning it's part of the same original request)
    // If it's a resume after questionnaire (has answers) or a late retry, consume quota
    let shouldConsumeQuota = true;
    if (!answers) {
       const createdTime = new Date(project.created_at).getTime();
       const now = new Date().getTime();
       if (now - createdTime < 5 * 60 * 1000) {
           shouldConsumeQuota = false; // Already consumed in /analyze
       }
    }

    if (shouldConsumeQuota) {
      try {
        await checkAndIncrementQuota(supabase, user.id, tier, 'builder');
      } catch (err: any) {
        if (err.code === 'QUOTA_EXCEEDED') {
          return NextResponse.json(
            { error: 'Builder limit reached. Resets at midnight — or upgrade your plan.', code: 'QUOTA_EXCEEDED' },
            { status: 429 }
          );
        }
        throw err;
      }
    }

    let fullDescription = project.description;
    if (answers) {
      fullDescription = `${project.description}\n\nAdditional Clarifications:\n${answers}`;

      // Save answers to DB
      await supabase
        .from('projects')
        .update({ questionnaire_answers: answers, description: fullDescription })
        .eq('id', projectId);
    }

    // Update status to 'building'
    await supabase
      .from('projects')
      .update({
        status: 'building',
        expires_at: new Date(Date.now() + 15 * 60000).toISOString(),
      })
      .eq('id', projectId);

    // Trigger Bridge Build, pass fullDescription and answers
    const bridgeResponse = await fetch(`${BRIDGE_URL}/build/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BRIDGE_SECRET}`
      },
      body: JSON.stringify({
        projectId,
        planText: fullDescription,
        answers, // passing answers too, just in case bridge needs it directly
        userId: user.id
      })
    });

    if (!bridgeResponse.ok) {
       await supabase.from('projects').update({ status: 'failed' }).eq('id', projectId);
       throw new Error(`Bridge returned ${bridgeResponse.status}`);
    }

    return NextResponse.json({ success: true, projectId });

  } catch (error: any) {
    console.error('Builder start error:', error);
    return NextResponse.json({ error: error.message, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
