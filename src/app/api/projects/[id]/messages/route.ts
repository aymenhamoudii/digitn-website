import { NextResponse } from 'next/server';
import { getUserProfile, listProjectMessages } from '@/lib/api/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUserProfile();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;

    const messages = await listProjectMessages(projectId);

    if (messages === null) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}