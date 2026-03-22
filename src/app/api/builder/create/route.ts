import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAndIncrementQuota } from '@/lib/quota';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, description, stack } = body;

    // 1. Builder quota check (separate from chat)
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

    // 2. Check active project limit
    const { data: tierData } = await supabase.from('users').select('tier').eq('id', user.id).single();
    const maxProjects = tierData?.tier === 'plus' ? 9999 : tierData?.tier === 'pro' ? 3 : 1;

    const { count: activeCount } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['planning', 'building', 'ready']);

    if ((activeCount || 0) >= maxProjects) {
      return NextResponse.json(
        { error: `You've reached your active project limit (${maxProjects}). Delete or wait for a project to expire.`, code: 'PROJECT_LIMIT' },
        { status: 429 }
      );
    }

    // 3. Create conversation for this project's planning chat
    const { data: conv } = await supabase.from('conversations')
      .insert({
        user_id: user.id,
        mode: 'builder',
        title: name || description?.substring(0, 40) || 'New Project',
      })
      .select().single();

    // 4. Create project record (status: planning — not building yet)
    const { data: project, error: dbErr } = await supabase.from('projects').insert({
      user_id: user.id,
      conversation_id: conv?.id,
      name: name || description?.substring(0, 40) || 'Untitled Project',
      description: description || '',
      type: stack || 'website',
      status: 'planning',
    }).select().single();

    if (dbErr) throw dbErr;

    return NextResponse.json({ projectId: project.id, conversationId: conv?.id });

  } catch (error) {
    console.error('Build create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
