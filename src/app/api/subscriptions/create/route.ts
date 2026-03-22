import { NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { createKonnectPayment } from '@/lib/payments/konnect';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { provider, planId, userId, tier = 'pro' } = await req.json();

    if (provider === 'stripe') {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: planId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings?payment=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings?payment=failed`,
        client_reference_id: userId,
        metadata: { tier },
      });

      return NextResponse.json({ url: session.url });
    } else if (provider === 'konnect') {
      // Fetch user email/name from Supabase for Konnect checkout
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      const email = user?.email || '';
      const name = user?.full_name || 'Client DIGITN';

      const result = await createKonnectPayment(userId, tier, email, name);
      return NextResponse.json({ url: result.payUrl });
    }

    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
