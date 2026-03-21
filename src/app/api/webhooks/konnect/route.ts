import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Validate Konnect signature/webhook here

    if (data.status === 'completed') {
      console.log('Konnect payment successful for user:', data.userId);
      // Update user subscription status in DB here
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Konnect webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
