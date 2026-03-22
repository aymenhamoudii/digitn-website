'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get('payment');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
      }
    });
  }, []);

  const handleSubscribe = async (provider: 'stripe' | 'konnect') => {
    if (!userId) {
      console.error('User not authenticated');
      return;
    }

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
          userId,
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

      {paymentStatus === 'success' && (
        <div
          className="border px-4 py-3 rounded relative mb-6"
          style={{ backgroundColor: 'var(--success-bg, #d1fae5)', borderColor: 'var(--success-border, #34d399)', color: 'var(--success-text, #065f46)' }}
        >
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> Your subscription is active.</span>
        </div>
      )}

      {paymentStatus === 'failed' && (
        <div
          className="border px-4 py-3 rounded relative mb-6"
          style={{ backgroundColor: 'var(--error-bg, #fee2e2)', borderColor: 'var(--error-border, #f87171)', color: 'var(--error-text, #991b1b)' }}
        >
          <strong className="font-bold">Payment Failed!</strong>
          <span className="block sm:inline"> Please try again.</span>
        </div>
      )}

      <div
        className="shadow rounded-lg p-6"
        style={{ backgroundColor: 'var(--card-bg, #ffffff)' }}
      >
        <h2 className="text-xl font-semibold mb-4">Subscription Plan</h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary, #6b7280)' }}>
          Upgrade to Pro for advanced features.
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => handleSubscribe('stripe')}
            disabled={loading || !userId}
            className="text-white px-6 py-2 rounded-md disabled:opacity-50 transition-colors"
            style={{ backgroundColor: 'var(--accent, #2563eb)' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            {loading ? 'Processing...' : 'Subscribe with Stripe'}
          </button>

          <button
            onClick={() => handleSubscribe('konnect')}
            disabled={loading || !userId}
            className="text-white px-6 py-2 rounded-md disabled:opacity-50 transition-colors"
            style={{ backgroundColor: 'var(--accent-secondary, #7c3aed)' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            {loading ? 'Processing...' : 'Subscribe with Konnect'}
          </button>
        </div>
      </div>
    </div>
  );
}
