import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const tier = session.metadata?.tier || 'pro';

        if (!userId) {
          console.error('No client_reference_id in checkout session');
          break;
        }

        // Create subscription record
        await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          provider: 'stripe',
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

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status;

        // Find user by stripe customer ID
        const { data: sub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (sub) {
          await supabaseAdmin.from('subscriptions').update({
            status,
            updated_at: new Date().toISOString(),
          }).eq('stripe_subscription_id', subscription.id);

          // If subscription is no longer active, downgrade user
          if (status !== 'active') {
            await supabaseAdmin.from('users').update({
              tier: 'free',
              updated_at: new Date().toISOString(),
            }).eq('id', sub.user_id);
          }
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        const { data: sub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (sub) {
          // Mark subscription as cancelled
          await supabaseAdmin.from('subscriptions').update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          }).eq('stripe_subscription_id', subscription.id);

          // Downgrade user to free tier
          await supabaseAdmin.from('users').update({
            tier: 'free',
            updated_at: new Date().toISOString(),
          }).eq('id', sub.user_id);
        }

        break;
      }
    }
  } catch (error: any) {
    console.error('Webhook handler error:', error.message);
    return new NextResponse(`Webhook handler error: ${error.message}`, { status: 500 });
  }

  return new NextResponse(null, { status: 200 });
}
