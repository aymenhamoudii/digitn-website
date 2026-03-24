import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get('key');

  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });

  // Use service role to bypass RLS for reading config
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await adminClient.from('admin_config').select('value').eq('key', key).single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ value: data?.value });
}

export async function POST(req: Request) {
  // First verify user is admin using secure server client
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== 'contact@digitn.tech') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json();
  const { key, value } = body;

  // Use service role to bypass RLS for writing config
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await adminClient.from('admin_config').update({ value }).eq('key', key);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
