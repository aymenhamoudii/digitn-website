import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAndIncrementQuota } from '@/lib/quota'

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 1. Check & Update Quota
    const { data: userData } = await supabase.from('users').select('tier').eq('id', user.id).maybeSingle()
    const tier = userData?.tier || 'free'

    try {
      await checkAndIncrementQuota(supabase, user.id, tier, 'chat')
    } catch (err: any) {
      if (err.code === 'QUOTA_EXCEEDED') {
        return NextResponse.json({ error: 'Quota exceeded', code: 'QUOTA_EXCEEDED' }, { status: 429 })
      }
      throw err
    }

    // 2. Forward to Bridge Server
    const body = await req.json();

    const bridgeUrl = process.env.BRIDGE_URL || 'http://127.0.0.1:3001';

    const response = await fetch(`${bridgeUrl}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BRIDGE_SECRET}`,
      },
      body: JSON.stringify({
        ...body,
        userId: user.id
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown bridge error');
      console.error('Bridge error:', response.status, errText);
      throw new Error(`Bridge error: ${response.status}`);
    }

    // 3. Return stream to client
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Chat proxy error:', error?.message || error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
