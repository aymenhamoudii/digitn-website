import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify ownership
    const { data: project } = await supabase.from('projects').select('id').eq('id', params.id).eq('user_id', user.id).single();
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const bridgeUrl = process.env.BRIDGE_URL || 'http://127.0.0.1:3001';

    const response = await fetch(`${bridgeUrl}/build/stream/${params.id}`, {
      headers: {
        'Authorization': `Bearer ${process.env.BRIDGE_SECRET}`,
      }
    });

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Stream failed' }, { status: 500 });
  }
}
