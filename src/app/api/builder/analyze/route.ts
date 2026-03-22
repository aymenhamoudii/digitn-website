import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAndIncrementQuota } from '@/lib/quota';
import { BRIDGE_URL } from '@/config/platform';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { name, description, stack } = await req.json();

    if (!name || !description || !stack) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Idempotency check: Look for existing 'analyzing' project in last 5 minutes
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: existingProjects } = await supabase
      .from('projects')
      .select('id, analysis_result')
      .eq('user_id', user.id)
      .eq('name', name)
      .eq('status', 'analyzing')
      .gte('created_at', fiveMinsAgo);

    if (existingProjects && existingProjects.length > 0) {
      // Return existing analysis result if available, otherwise just the ID
      const existing = existingProjects[0];
      const result = existing.analysis_result || { ready: true }; // Assume ready if analysis not complete yet
      return NextResponse.json({ ...result, projectId: existing.id });
    }

    // Check active project limit
    const { data: userData } = await supabase.from('users').select('tier').eq('id', user.id).maybeSingle();
    const tier = userData?.tier || 'free';

    const maxProjects = tier === 'plus' ? 9999 : tier === 'pro' ? 3 : 1;

    const { count: activeCount } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['analyzing', 'planning', 'building', 'ready']);

    if ((activeCount || 0) >= maxProjects) {
      return NextResponse.json(
        { error: `You've reached your active project limit (${maxProjects}). Delete or wait for a project to expire.`, code: 'PROJECT_LIMIT' },
        { status: 429 }
      );
    }

    // Check and consume Quota
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

    // Create project record with 'analyzing' status
    const { data: project, error: dbError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name,
        description,
        type: stack,
        status: 'analyzing'
      })
      .select('id')
      .single();

    if (dbError || !project) {
      console.error('DB Error creating project:', dbError);
      return NextResponse.json({ error: 'Failed to create project', code: 'INTERNAL_ERROR' }, { status: 500 });
    }

    // Call Bridge /builder/analyze
    const bridgeResponse = await fetch(`${BRIDGE_URL}/builder/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BRIDGE_SECRET}`
      },
      body: JSON.stringify({
        description,
        stack,
        userId: user.id
      })
    });

    if (!bridgeResponse.ok) {
      console.error('Bridge analysis failed:', await bridgeResponse.text());
      return NextResponse.json({ ready: true, projectId: project.id });
    }

    const result = await bridgeResponse.json();

    // Store analysis result
    await supabase
      .from('projects')
      .update({ analysis_result: result })
      .eq('id', project.id);

    return NextResponse.json({ ...result, projectId: project.id });

  } catch (error: any) {
    console.error('Analyze route error:', error);
    return NextResponse.json({ error: error.message, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
