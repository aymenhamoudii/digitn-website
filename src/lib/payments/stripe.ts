import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_to_fix_build', {
  apiVersion: '2026-02-25.clover',
  appInfo: {
    name: 'DIGITN PRO',
    version: '1.0.0',
  },
});
