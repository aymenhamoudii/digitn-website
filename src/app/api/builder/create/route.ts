import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, planText, conversationId } = body;

    // 1. Quota Check (Same logic as chat)
    const today = new Date().toISOString().split('T')[0];
    const { data: userData } = await supabase.from('users').select('tier').eq('id', user.id).single();
    const limit = userData?.tier === 'free' ? 10 : userData?.tier === 'pro' ? 50 : 9999;

    let { data: quota } = await supabase.from('usage_quotas').select('*').eq('user_id', user.id).eq('date', today).single();
    if (!quota) {
      const { data: newQuota } = await supabase.from('usage_quotas').insert({ user_id: user.id, date: today, requests_used: 0, requests_limit: limit }).select().single();
      quota = newQuota;
    }

    if (quota!.requests_used >= quota!.requests_limit) {
      return NextResponse.json({ error: 'Quota exceeded', code: 'QUOTA_EXCEEDED' }, { status: 429 });
    }

    await supabase.from('usage_quotas').update({ requests_used: quota!.requests_used + 1 }).eq('id', quota!.id);

    // 2. Create DB Project Record
    // Set expiry: 15 minutes from now for ALL tiers
    const expiresAt = new Date(Date.now() + 15 * 60000).toISOString();

    const { data: project, error: dbErr } = await supabase.from('projects').insert({
      user_id: user.id,
      conversation_id: conversationId,
      name: name || 'Untitled Project',
      status: 'building',
      expires_at: expiresAt
    }).select().single();

    if (dbErr) throw dbErr;

    // 3. Trigger Bridge Async Build
    const bridgeUrl = process.env.BRIDGE_URL || 'http://127.0.0.1:3001';

    // We don't await the result of the stream, just the acknowledgement
    await fetch(`${bridgeUrl}/build/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BRIDGE_SECRET}`,
      },
      body: JSON.stringify({
        projectId: project.id,
        planText,
        userId: user.id
      }),
    });

    return NextResponse.json({ projectId: project.id });

  } catch (error) {
    console.error('Build trigger error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
