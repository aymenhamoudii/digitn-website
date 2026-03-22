import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { checkAndIncrementQuota } from '@/lib/quota';
import { BRIDGE_URL } from '@/config/platform';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const projectId = params.id;
    const { message } = await req.json();

    if (!message || !projectId) {
      return NextResponse.json({ error: 'Missing message or projectId' }, { status: 400 });
    }

    // 1. Check ownership and status
    const { data: project, error: getError } = await supabase
      .from('projects')
      .select('status, user_id')
      .eq('id', projectId)
      .single();

    if (getError || !project || project.user_id !== user.id) {
      return NextResponse.json({ error: 'Project not found or unauthorized', code: 'NOT_FOUND' }, { status: 404 });
    }

    if (project.status !== 'ready') {
      return NextResponse.json({ error: 'Project is not ready for modifications', code: 'PROJECT_NOT_READY' }, { status: 400 });
    }

    // 2. Check Quota
    const { data: userData } = await supabase.from('users').select('tier').eq('id', user.id).maybeSingle();
    const tier = userData?.tier || 'free';

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

    // 3. Save user message to history
    await supabase.from('builder_chat_messages').insert({
        project_id: projectId,
        role: 'user',
        content: message
    });

    // 4. Proxy to Bridge as SSE
    const bridgeUrl = `${BRIDGE_URL}/builder/chat/${projectId}`;
    const response = await fetch(bridgeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BRIDGE_SECRET}`
      },
      body: JSON.stringify({
        projectId,
        message,
        userId: user.id
      })
    });

    if (!response.ok) {
       console.error("Bridge Chat Proxy Error:", await response.text());
       return NextResponse.json({ error: 'Bridge error', code: 'INTERNAL_ERROR'}, { status: 500 });
    }

    // Instead of streaming proxy in Next.js which is complex, we just pipe the body
    return new Response(response.body, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        }
    });

  } catch (error: any) {
    console.error('Builder chat proxy error:', error);
    return NextResponse.json({ error: error.message, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
