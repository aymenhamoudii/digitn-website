import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [usersRes, proRes, plusRes] = await Promise.all([
    adminClient.from('users').select('*', { count: 'exact', head: true }),
    adminClient.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'pro'),
    adminClient.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'plus')
  ]);

  return NextResponse.json({
    users: usersRes.count || 0,
    pro: proRes.count || 0,
    plus: plusRes.count || 0
  });
}