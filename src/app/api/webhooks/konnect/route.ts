import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const KONNECT_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.konnect.network/api/v2'
  : 'https://api.preprod.konnect.network/api/v2';

const KONNECT_KEY = process.env.KONNECT_API_KEY || '';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const paymentRef = data.payment_ref;

    if (!paymentRef) {
      return NextResponse.json({ error: 'Missing payment_ref' }, { status: 400 });
    }

    // Verify payment with Konnect API
    const verifyRes = await fetch(`${KONNECT_URL}/payments/${paymentRef}`, {
      headers: {
        'x-api-key': KONNECT_KEY,
      },
    });

    if (!verifyRes.ok) {
      console.error('Konnect verification failed:', await verifyRes.text());
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    const payment = await verifyRes.json();

    if (payment.payment?.status !== 'completed') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    // Parse orderId format: userId_tier_timestamp
    const orderId = payment.payment?.orderId || '';
    const parts = orderId.split('_');
    if (parts.length < 3) {
      console.error('Invalid orderId format:', orderId);
      return NextResponse.json({ error: 'Invalid order format' }, { status: 400 });
    }

    const userId = parts[0];
    const tier = parts[1];

    // Insert subscription record
    await supabaseAdmin.from('subscriptions').upsert({
      user_id: userId,
      provider: 'konnect',
      konnect_payment_ref: paymentRef,
      tier,
      status: 'active',
      current_period_start: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    // Update user tier
    await supabaseAdmin.from('users').update({
      tier,
      updated_at: new Date().toISOString(),
    }).eq('id', userId);

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Konnect webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
