import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify ownership before deleting
    const { data: conv } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Delete messages first (FK constraint), then conversation
    await supabase.from('messages').delete().eq('conversation_id', params.id);
    await supabase.from('conversations').delete().eq('id', params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete conversation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
