import { NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { konnectAPI } from '@/lib/payments/konnect';

export async function POST(req: Request) {
  try {
    const { provider, planId, userId } = await req.json();

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
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings?canceled=true`,
        client_reference_id: userId,
      });

      return NextResponse.json({ url: session.url });
    } else if (provider === 'konnect') {
      const session = await konnectAPI.createPayment({ planId, userId });
      return NextResponse.json({ url: session.checkoutUrl });
    }

    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
