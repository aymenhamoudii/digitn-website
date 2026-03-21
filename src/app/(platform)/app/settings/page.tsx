'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  const handleSubscribe = async (provider: 'stripe' | 'konnect') => {
    try {
      setLoading(true);
      const res = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          planId: provider === 'stripe' ? 'price_pro_monthly' : 'plan_pro_monthly',
          userId: 'user_123', // In real app, get from auth context
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> Your subscription is active.</span>
        </div>
      )}

      {canceled && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Canceled!</strong>
          <span className="block sm:inline"> Checkout was canceled.</span>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Subscription Plan</h2>
        <p className="text-gray-600 mb-6">Upgrade to Pro for advanced features.</p>

        <div className="flex gap-4">
          <button
            onClick={() => handleSubscribe('stripe')}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Subscribe with Stripe'}
          </button>

          <button
            onClick={() => handleSubscribe('konnect')}
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Subscribe with Konnect'}
          </button>
        </div>
      </div>
    </div>
  );
}
