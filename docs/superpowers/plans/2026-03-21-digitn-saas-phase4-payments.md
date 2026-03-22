# DIGITN SaaS Platform — Phase 4: Payments & Subscriptions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the pricing page and payment gateways (Stripe + Konnect) so users can upgrade their accounts to DIGITN PRO or DIGITN PLUS, unlocking higher daily requests and premium AI models.

**Architecture:**
1. **Frontend:** Pricing page displays plans. Clicking "Upgrade" calls a Next.js API route.
2. **Checkout APIs:** `/api/subscriptions/create` generates a Stripe Checkout Session or Konnect Payment URL.
3. **Webhooks:** `/api/webhooks/stripe` and `/api/webhooks/konnect` listen for successful payments, then update the `subscriptions` and `users` tables in Supabase (upgrading the user's `tier` to 'pro' or 'plus').

**Tech Stack:** Stripe Node.js SDK, Konnect API (fetch), Next.js API Routes, Supabase Server Client

---

## File Structure

### Frontend UI
- Create: `src/app/(platform)/app/settings/page.tsx` — includes billing and plan management
- Create: `src/components/subscription/PricingModal.tsx` — popup for upgrading when quota is hit
- Create: `src/app/(marketing)/tarifs/page.tsx` — public pricing page (redirects to signup if logged out, checkout if logged in)

### API Routes
- Create: `src/app/api/subscriptions/create/route.ts` — creates payment sessions
- Create: `src/app/api/webhooks/stripe/route.ts` — handles Stripe events
- Create: `src/app/api/webhooks/konnect/route.ts` — handles Konnect events

### Utilities
- Create: `src/lib/payments/stripe.ts` — Stripe server initialization
- Create: `src/lib/payments/konnect.ts` — Konnect API helpers

---

## Task 1: Setup Payment Utilities & Dependencies

**Files:**
- Modify: `package.json`
- Create: `src/lib/payments/stripe.ts`
- Create: `src/lib/payments/konnect.ts`

- [ ] **Step 1: Install Stripe SDK**

```bash
npm install stripe
```

- [ ] **Step 2: Create Stripe utility**

Create `src/lib/payments/stripe.ts`:
```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Use the latest supported stable version
  appInfo: {
    name: 'DIGITN SaaS',
    version: '1.0.0',
  },
});

export const STRIPE_PRICES = {
  pro: process.env.STRIPE_PRICE_PRO_ID!,
  plus: process.env.STRIPE_PRICE_PLUS_ID!,
};
```

- [ ] **Step 3: Create Konnect utility**

Create `src/lib/payments/konnect.ts`:
```typescript
const KONNECT_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.konnect.network/api/v2'
  : 'https://api.preprod.konnect.network/api/v2';

const KONNECT_KEY = process.env.KONNECT_API_KEY!;

export const KONNECT_PRICES = {
  pro: 29000, // 29 DT (in millimes)
  plus: 79000, // 79 DT (in millimes)
};

export async function createKonnectPayment(userId: string, tier: 'pro' | 'plus', email: string, name: string) {
  const amount = KONNECT_PRICES[tier];

  const response = await fetch(`${KONNECT_URL}/payments/init-payment`, {
    method: 'POST',
    headers: {
      'x-api-key': KONNECT_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      receiverWalletId: process.env.KONNECT_WALLET_ID,
      token: 'TND',
      amount,
      type: 'immediate',
      description: `Abonnement DIGITN ${tier.toUpperCase()}`,
      acceptedPaymentMethods: ['wallet', 'bank_card', 'e-DINAR'],
      lifespan: 30, // 30 minutes
      checkoutForm: true,
      addPaymentFeesToAmount: true,
      firstName: name.split(' ')[0] || 'Client',
      lastName: name.split(' ')[1] || 'DIGITN',
      email: email,
      orderId: `${userId}_${tier}_${Date.now()}`,
      webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/konnect`,
      silentWebhook: true,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings?payment=success`,
      failUrl: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings?payment=failed`,
      theme: 'dark'
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Konnect API Error: ${error}`);
  }

  return response.json();
}
```

- [ ] **Step 4: Update `.env.local` (Local manual step)**
Add these placeholder keys to `.env.local` (user will fill them later):
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_ID=price_...
STRIPE_PRICE_PLUS_ID=price_...

KONNECT_API_KEY=...
KONNECT_WALLET_ID=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/lib/payments/
git commit -m "feat: add stripe and konnect payment utilities"
```

---

## Task 2: Create Checkout API Route

**Files:**
- Create: `src/app/api/subscriptions/create/route.ts`

- [ ] **Step 1: Create checkout endpoint**

Create `src/app/api/subscriptions/create/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe, STRIPE_PRICES } from '@/lib/payments/stripe';
import { createKonnectPayment } from '@/lib/payments/konnect';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { tier, provider } = await req.json();

    if (!['pro', 'plus'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const { data: profile } = await supabase.from('users').select('email, name, stripe_customer_id').eq('id', user.id).single();

    // Handle Stripe Checkout
    if (provider === 'stripe') {
      let customerId = profile?.stripe_customer_id;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: profile?.email || user.email,
          name: profile?.name,
          metadata: { supabase_user_id: user.id },
        });
        customerId = customer.id;

        // Save customer ID
        await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id);
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: STRIPE_PRICES[tier as keyof typeof STRIPE_PRICES], quantity: 1 }],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings?payment=cancelled`,
        metadata: { userId: user.id, tier },
      });

      return NextResponse.json({ url: session.url });
    }

    // Handle Konnect Checkout
    if (provider === 'konnect') {
      const payment = await createKonnectPayment(user.id, tier, profile?.email || user.email!, profile?.name || 'Client');
      return NextResponse.json({ url: payment.payUrl });
    }

    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/subscriptions/
git commit -m "feat: add checkout api for stripe and konnect"
```

---

## Task 3: Create Webhook Handlers

**Files:**
- Create: `src/app/api/webhooks/stripe/route.ts`
- Create: `src/app/api/webhooks/konnect/route.ts`

- [ ] **Step 1: Create Stripe webhook handler**

Create `src/app/api/webhooks/stripe/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { createClient } from '@supabase/supabase-js';

// We need a service role client to update DB securely from webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error: any) {
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  const session = event.data.object as any;

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        // Initial subscription creation
        if (session.mode === 'subscription') {
          const userId = session.metadata.userId;
          const tier = session.metadata.tier;
          const subscriptionId = session.subscription;

          const subscription = await stripe.subscriptions.retrieve(subscriptionId);

          // Insert subscription record
          await supabaseAdmin.from('subscriptions').insert({
            user_id: userId,
            tier: tier,
            status: 'active',
            provider: 'stripe',
            provider_subscription_id: subscriptionId,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          });

          // Upgrade user tier
          await supabaseAdmin.from('users').update({ tier }).eq('id', userId);
        }
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        // Handle cancellations or renewals
        const sub = event.data.object as any;
        const status = sub.status === 'active' ? 'active' : sub.status === 'canceled' ? 'cancelled' : 'past_due';

        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('provider_subscription_id', sub.id)
          .single();

        if (existingSub) {
          await supabaseAdmin.from('subscriptions').update({
            status,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString()
          }).eq('provider_subscription_id', sub.id);

          // If cancelled, downgrade user to free
          if (status === 'cancelled') {
            await supabaseAdmin.from('users').update({ tier: 'free' }).eq('id', existingSub.user_id);
          }
        }
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create Konnect webhook handler**

Create `src/app/api/webhooks/konnect/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // Konnect sends payment_ref and status
    const body = await req.json();
    const { payment_ref, status } = body;

    // Verify payment status with Konnect API
    const KONNECT_URL = process.env.NODE_ENV === 'production'
      ? 'https://api.konnect.network/api/v2'
      : 'https://api.preprod.konnect.network/api/v2';

    const verifyRes = await fetch(`${KONNECT_URL}/payments/${payment_ref}`, {
      headers: { 'x-api-key': process.env.KONNECT_API_KEY! }
    });

    if (!verifyRes.ok) throw new Error('Verification failed');
    const paymentData = await verifyRes.json();

    // Only process completed payments
    if (paymentData.payment.status === 'completed') {
      const orderId = paymentData.payment.orderId;
      // Format: userId_tier_timestamp
      const [userId, tier] = orderId.split('_');

      if (['pro', 'plus'].includes(tier)) {
        // Konnect is usually one-time (monthly access). We'll set it to expire in 30 days.
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        await supabaseAdmin.from('subscriptions').insert({
          user_id: userId,
          tier: tier,
          status: 'active',
          provider: 'konnect',
          provider_subscription_id: payment_ref,
          current_period_end: expiryDate.toISOString(),
        });

        // Upgrade user
        await supabaseAdmin.from('users').update({ tier }).eq('id', userId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Konnect webhook failed:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/webhooks/
git commit -m "feat: add stripe and konnect webhook handlers for tier upgrades"
```

---

## Task 4: Create Settings Page (Billing Management)

**Files:**
- Create: `src/app/(platform)/app/settings/page.tsx`

- [ ] **Step 1: Create the Settings Page**

Create `src/app/(platform)/app/settings/page.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { FiCheck, FiStar, FiZap } from 'react-icons/fi';
import { TIERS, Tier } from '@/config/platform';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
        setProfile(data);
      }
    }
    loadUser();
  }, [supabase]);

  const handleCheckout = async (tier: 'pro' | 'plus', provider: 'stripe' | 'konnect') => {
    setLoading(true);
    try {
      const res = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, provider })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      if (data.url) window.location.href = data.url;

    } catch (err: any) {
      toast.error(err.message || 'Erreur de paiement');
      setLoading(false);
    }
  };

  if (!profile) return <div className="p-8">Chargement...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header title="Paramètres et Facturation" userName={profile.name || user?.email} />

      <div className="p-8 max-w-4xl mx-auto w-full">
        <h2 className="text-xl font-serif text-[var(--text-primary)] mb-6">Mon Abonnement Actuel</h2>

        {/* Current Plan Card */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-6 mb-12">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-1">Plan Actif</p>
              <h3 className="text-2xl font-bold text-[var(--accent)]">{TIERS[profile.tier as Tier].name}</h3>
            </div>
            <div className="text-right">
              <p className="text-sm text-[var(--text-primary)] font-medium">
                {TIERS[profile.tier as Tier].requestsPerDay === 9999 ? 'Illimité' : TIERS[profile.tier as Tier].requestsPerDay} requêtes/jour
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-serif text-[var(--text-primary)] mb-6">Mettre à niveau</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* PRO Tier */}
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-6 flex flex-col hover:border-[var(--accent)] transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <FiZap className="text-[var(--accent)]" />
              <h3 className="text-lg font-bold text-[var(--text-primary)]">DIGITN PRO</h3>
            </div>
            <p className="text-3xl font-serif text-[var(--text-primary)] my-4">29 DT <span className="text-sm text-[var(--text-secondary)] font-sans font-normal">/mois</span></p>

            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><FiCheck className="text-green-500" /> 50 requêtes IA par jour</li>
              <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><FiCheck className="text-green-500" /> Modèles Premium (Claude 3.5 Sonnet)</li>
              <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><FiCheck className="text-green-500" /> 3 projets actifs</li>
              <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><FiCheck className="text-green-500" /> Génération prioritaire</li>
            </ul>

            <div className="space-y-3">
              <button
                onClick={() => handleCheckout('pro', 'konnect')}
                disabled={loading || profile.tier === 'pro' || profile.tier === 'plus'}
                className="w-full py-2.5 bg-yellow-400 text-yellow-900 rounded-md font-medium text-sm hover:bg-yellow-500 disabled:opacity-50 transition-colors"
              >
                Payer avec Carte Tunisienne (Konnect)
              </button>
              <button
                onClick={() => handleCheckout('pro', 'stripe')}
                disabled={loading || profile.tier === 'pro' || profile.tier === 'plus'}
                className="w-full py-2.5 bg-[#635BFF] text-white rounded-md font-medium text-sm hover:bg-[#5249ea] disabled:opacity-50 transition-colors"
              >
                Payer avec Carte Internationale (Stripe)
              </button>
            </div>
          </div>

          {/* PLUS Tier */}
          <div className="bg-[var(--text-primary)] border border-[var(--text-primary)] rounded-xl p-6 flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-[var(--accent)] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Populaire</div>
            <div className="flex items-center gap-2 mb-2">
              <FiStar className="text-[var(--bg-primary)]" />
              <h3 className="text-lg font-bold text-[var(--bg-primary)]">DIGITN PLUS</h3>
            </div>
            <p className="text-3xl font-serif text-[var(--bg-primary)] my-4">79 DT <span className="text-sm text-[var(--bg-secondary)] font-sans font-normal">/mois</span></p>

            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-2 text-sm text-[var(--bg-secondary)]"><FiCheck className="text-green-400" /> Requêtes IA Illimitées</li>
              <li className="flex items-center gap-2 text-sm text-[var(--bg-secondary)]"><FiCheck className="text-green-400" /> Modèles Premium (Claude 3.5 Sonnet)</li>
              <li className="flex items-center gap-2 text-sm text-[var(--bg-secondary)]"><FiCheck className="text-green-400" /> Projets actifs illimités</li>
              <li className="flex items-center gap-2 text-sm text-[var(--bg-secondary)]"><FiCheck className="text-green-400" /> Vitesse de génération maximale</li>
            </ul>

            <div className="space-y-3">
              <button
                onClick={() => handleCheckout('plus', 'konnect')}
                disabled={loading || profile.tier === 'plus'}
                className="w-full py-2.5 bg-yellow-400 text-yellow-900 rounded-md font-medium text-sm hover:bg-yellow-500 disabled:opacity-50 transition-colors"
              >
                Payer avec Carte Tunisienne (Konnect)
              </button>
              <button
                onClick={() => handleCheckout('plus', 'stripe')}
                disabled={loading || profile.tier === 'plus'}
                className="w-full py-2.5 bg-[#635BFF] text-white rounded-md font-medium text-sm hover:bg-[#5249ea] disabled:opacity-50 transition-colors"
              >
                Payer avec Carte Internationale (Stripe)
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(platform\)/app/settings/
git commit -m "feat: add settings page with payment options for Stripe and Konnect"
```

---

## Verification

After completing all tasks:
- [ ] Ensure `npm install stripe` succeeded
- [ ] Run `npm run build` to verify there are no TypeScript errors

Which approach do you prefer to execute this plan?
1. Subagent-Driven (I dispatch fresh agents)
2. Inline Execution