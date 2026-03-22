const KONNECT_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.konnect.network/api/v2'
  : 'https://api.preprod.konnect.network/api/v2';

const KONNECT_KEY = process.env.KONNECT_API_KEY || '';

export const KONNECT_PRICES = {
  pro: 29000,  // 29 DT in millimes
  plus: 79000, // 79 DT in millimes
};

export async function createKonnectPayment(userId: string, tier: 'pro' | 'plus', email: string, name: string) {
  const amount = KONNECT_PRICES[tier];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const response = await fetch(`${KONNECT_URL}/payments/init-payment`, {
    method: 'POST',
    headers: {
      'x-api-key': KONNECT_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      receiverWalletId: process.env.KONNECT_WALLET_ID || '',
      token: 'TND',
      amount,
      type: 'immediate',
      description: `Abonnement DIGITN ${tier.toUpperCase()}`,
      acceptedPaymentMethods: ['wallet', 'bank_card', 'e-DINAR'],
      lifespan: 30,
      checkoutForm: true,
      addPaymentFeesToAmount: true,
      firstName: name.split(' ')[0] || 'Client',
      lastName: name.split(' ').slice(1).join(' ') || 'DIGITN',
      email: email,
      orderId: `${userId}_${tier}_${Date.now()}`,
      webhook: `${appUrl}/api/webhooks/konnect`,
      silentWebhook: true,
      successUrl: `${appUrl}/app/settings?payment=success`,
      failUrl: `${appUrl}/app/settings?payment=failed`,
      theme: 'dark'
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Konnect API Error: ${error}`);
  }

  return response.json();
}
