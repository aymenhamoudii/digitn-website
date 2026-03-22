'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Skeleton, SkeletonStat } from '@/components/ui/Skeleton';
import {
  FiCheck,
  FiZap,
  FiStar,
  FiCreditCard,
  FiGlobe,
  FiX,
  FiActivity,
  FiFolder,
  FiArrowRight,
} from 'react-icons/fi';

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

type TierKey = 'free' | 'pro' | 'plus';

interface PlanConfig {
  key: TierKey;
  name: string;
  tagline: string;
  priceDT: string;
  priceUSD: string;
  period: string;
  features: string[];
  requestsPerDay: string;
  activeProjects: string;
  aiModels: string;
  popular?: boolean;
  stripePriceId: string;
  konnectPlanId: string;
}

const PLANS: PlanConfig[] = [
  {
    key: 'free',
    name: 'DIGITN FAST',
    tagline: 'Get started for free',
    priceDT: '0',
    priceUSD: '0',
    period: 'Free forever',
    requestsPerDay: '10',
    activeProjects: '1',
    aiModels: 'Standard',
    stripePriceId: '',
    konnectPlanId: '',
    features: [
      '10 requests / day',
      '1 active project',
      'Standard AI models',
      '15-min preview',
      'Community support',
    ],
  },
  {
    key: 'pro',
    name: 'DIGITN PRO',
    tagline: 'For serious builders',
    priceDT: '29',
    priceUSD: '9',
    period: '/month',
    requestsPerDay: '50',
    activeProjects: '3',
    aiModels: 'Premium',
    popular: true,
    stripePriceId: 'price_pro_monthly',
    konnectPlanId: 'plan_pro_monthly',
    features: [
      '50 requests / day',
      '3 active projects',
      'Premium AI models',
      '15-min preview',
      'Priority support',
    ],
  },
  {
    key: 'plus',
    name: 'DIGITN PLUS',
    tagline: 'No limits, full power',
    priceDT: '79',
    priceUSD: '25',
    period: '/month',
    requestsPerDay: 'Unlimited',
    activeProjects: 'Unlimited',
    aiModels: 'Premium',
    stripePriceId: 'price_plus_monthly',
    konnectPlanId: 'plan_plus_monthly',
    features: [
      'Unlimited requests',
      'Unlimited projects',
      'Premium AI models',
      '15-min preview',
      'Dedicated support',
    ],
  },
];

const TIER_ORDER: Record<TierKey, number> = { free: 0, pro: 1, plus: 2 };

const TIER_DISPLAY: Record<TierKey, { label: string; icon: React.ReactNode }> = {
  free: { label: 'DIGITN FAST', icon: <FiZap size={14} /> },
  pro: { label: 'DIGITN PRO', icon: <FiStar size={14} /> },
  plus: { label: 'DIGITN PLUS', icon: <FiStar size={14} /> },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get('payment');

  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [tier, setTier] = useState<TierKey>('free');
  const [requestsUsed, setRequestsUsed] = useState(0);
  const [requestsLimit, setRequestsLimit] = useState(10);
  const [activeProjects, setActiveProjects] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState<TierKey | null>(null);
  const [alertVisible, setAlertVisible] = useState(true);

  /* ---------- Fetch user data ---------- */
  const fetchUserData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUserId(user.id);

    // Fetch tier
    const { data: userData } = await supabase
      .from('users')
      .select('tier')
      .eq('id', user.id)
      .single();

    if (userData?.tier) {
      setTier(userData.tier as TierKey);
    }

    // Fetch today's quota
    const today = new Date().toISOString().split('T')[0];
    const { data: quota } = await supabase
      .from('usage_quotas')
      .select('requests_used, requests_limit')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (quota) {
      setRequestsUsed(quota.requests_used);
      setRequestsLimit(quota.requests_limit);
    }

    // Fetch active projects count
    const { count } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['planning', 'building', 'ready']);

    setActiveProjects(count || 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  /* ---------- Subscribe ---------- */
  const handleSubscribe = async (targetTier: TierKey, provider: 'stripe' | 'konnect') => {
    if (!userId) return;

    const plan = PLANS.find((p) => p.key === targetTier);
    if (!plan) return;

    try {
      setSubscribing(true);
      const res = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          planId: provider === 'stripe' ? plan.stripePriceId : plan.konnectPlanId,
          userId,
          tier: targetTier,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setSubscribing(false);
      setShowPaymentModal(null);
    }
  };

  /* ---------- Quota helpers ---------- */
  const quotaPercentage = requestsLimit > 0
    ? Math.min((requestsUsed / requestsLimit) * 100, 100)
    : 0;

  const isUnlimited = tier === 'plus';

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* --- Page Content --- */}
      <div
        style={{
          padding: '48px 64px',
          maxWidth: '1100px',
        }}
      >
        {/* --- Header --- */}
        <div style={{ marginBottom: '40px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '28px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '6px',
              letterSpacing: '-0.02em',
            }}
          >
            Settings
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              color: 'var(--text-secondary)',
            }}
          >
            Manage your subscription and account
          </p>
        </div>

        {/* --- Payment Status Alerts --- */}
        {paymentStatus && alertVisible && (
          <div
            style={{
              padding: '14px 20px',
              borderRadius: '12px',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              border: `1px solid ${paymentStatus === 'success' ? 'var(--accent)' : 'var(--border-strong)'}`,
              backgroundColor: paymentStatus === 'success'
                ? 'rgba(217, 119, 87, 0.08)'
                : 'rgba(220, 38, 38, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {paymentStatus === 'success' ? (
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FiCheck size={14} color="#fff" />
                </div>
              ) : (
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--border-strong)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FiX size={14} style={{ color: 'var(--text-primary)' }} />
                </div>
              )}
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  {paymentStatus === 'success' ? 'Payment successful' : 'Payment failed'}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    margin: 0,
                  }}
                >
                  {paymentStatus === 'success'
                    ? 'Your subscription is now active. Enjoy your upgraded plan!'
                    : 'Something went wrong with your payment. Please try again.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setAlertVisible(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-tertiary)',
                padding: '4px',
                flexShrink: 0,
              }}
            >
              <FiX size={16} />
            </button>
          </div>
        )}

        {/* --- Current Plan Card --- */}
        {loading ? (
          <div style={{ marginBottom: '40px' }}>
            <SkeletonStat />
          </div>
        ) : (
          <div
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '28px 32px',
              marginBottom: '40px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '20px',
              }}
            >
              {/* Left: Plan info */}
              <div style={{ flex: '1 1 340px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--text-tertiary)',
                      margin: 0,
                    }}
                  >
                    Current plan
                  </p>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 600,
                      fontFamily: 'var(--font-sans)',
                      letterSpacing: '0.04em',
                      backgroundColor: tier === 'free' ? 'var(--bg-secondary)' : 'var(--accent)',
                      color: tier === 'free' ? 'var(--text-secondary)' : '#fff',
                    }}
                  >
                    {TIER_DISPLAY[tier].icon}
                    {TIER_DISPLAY[tier].label}
                  </span>
                </div>

                {/* Quota */}
                <div style={{ marginBottom: '8px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <FiActivity size={13} />
                      Daily requests
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13px',
                        color: 'var(--text-primary)',
                        fontWeight: 500,
                        margin: 0,
                      }}
                    >
                      {isUnlimited ? (
                        <span>{requestsUsed} used</span>
                      ) : (
                        <span>
                          {requestsUsed}{' '}
                          <span style={{ color: 'var(--text-tertiary)' }}>/ {requestsLimit}</span>
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '3px',
                      backgroundColor: 'var(--bg-secondary)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: isUnlimited ? '15%' : `${quotaPercentage}%`,
                        height: '100%',
                        borderRadius: '3px',
                        backgroundColor: quotaPercentage > 85 ? '#e05252' : 'var(--accent)',
                        transition: 'width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      }}
                    />
                  </div>
                  {isUnlimited && (
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        color: 'var(--text-tertiary)',
                        marginTop: '4px',
                      }}
                    >
                      Unlimited plan
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Active projects */}
              <div
                style={{
                  flex: '0 0 auto',
                  textAlign: 'center',
                  padding: '16px 28px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--text-tertiary)',
                    margin: '0 0 4px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <FiFolder size={11} />
                  Active projects
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '28px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    margin: 0,
                    lineHeight: 1.1,
                  }}
                >
                  {activeProjects}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    color: 'var(--text-tertiary)',
                    margin: '2px 0 0 0',
                  }}
                >
                  {tier === 'plus'
                    ? 'Unlimited'
                    : tier === 'pro'
                      ? 'of 3 max'
                      : 'of 1 max'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- Section heading --- */}
        <div style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '20px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '4px',
              letterSpacing: '-0.01em',
            }}
          >
            Choose your plan
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              color: 'var(--text-secondary)',
            }}
          >
            Scale your usage as your needs grow
          </p>
        </div>

        {/* --- Plan Comparison Grid --- */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              alignItems: 'start',
            }}
          >
            {PLANS.map((plan) => {
              const isCurrent = tier === plan.key;
              const isUpgrade = TIER_ORDER[plan.key] > TIER_ORDER[tier];
              const isDowngrade = TIER_ORDER[plan.key] < TIER_ORDER[tier];

              return (
                <div
                  key={plan.key}
                  className={plan.popular ? 'plan-glow' : ''}
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: plan.popular
                      ? '1px solid var(--accent)'
                      : '1px solid var(--border)',
                    borderRadius: '14px',
                    padding: '28px 24px',
                    position: 'relative',
                    transition: 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.35s ease',
                    cursor: isUpgrade ? 'pointer' : 'default',
                    ...(isDowngrade ? { opacity: 0.55 } : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (!isDowngrade) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = plan.popular
                      ? '0 0 0 1px var(--accent), 0 8px 32px -8px rgba(217, 119, 87, 0.2)'
                      : 'none';
                  }}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-11px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'var(--accent)',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-sans)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding: '3px 14px',
                        borderRadius: '20px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Most popular
                    </div>
                  )}

                  {/* Plan name */}
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      margin: '0 0 2px 0',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {plan.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      color: 'var(--text-tertiary)',
                      margin: '0 0 20px 0',
                    }}
                  >
                    {plan.tagline}
                  </p>

                  {/* Price */}
                  <div style={{ marginBottom: '24px' }}>
                    {plan.key === 'free' ? (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '36px',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            lineHeight: 1,
                          }}
                        >
                          Free
                        </span>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-serif)',
                              fontSize: '36px',
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              lineHeight: 1,
                            }}
                          >
                            {plan.priceDT}
                            <span
                              style={{
                                fontSize: '16px',
                                fontWeight: 500,
                                color: 'var(--text-secondary)',
                                marginLeft: '2px',
                              }}
                            >
                              DT
                            </span>
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-sans)',
                              fontSize: '13px',
                              color: 'var(--text-tertiary)',
                            }}
                          >
                            {plan.period}
                          </span>
                        </div>
                        <p
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '12px',
                            color: 'var(--text-tertiary)',
                            margin: '4px 0 0 0',
                          }}
                        >
                          or ${plan.priceUSD} USD {plan.period}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div
                    style={{
                      height: '1px',
                      backgroundColor: 'var(--border)',
                      margin: '0 0 20px 0',
                    }}
                  />

                  {/* Features list */}
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: '0 0 28px 0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '13.5px',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <FiCheck
                          size={14}
                          style={{
                            color: plan.popular ? 'var(--accent)' : 'var(--text-tertiary)',
                            flexShrink: 0,
                          }}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  {isCurrent ? (
                    <div
                      style={{
                        width: '100%',
                        padding: '11px 0',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--text-tertiary)',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      Current plan
                    </div>
                  ) : isUpgrade ? (
                    <button
                      onClick={() => setShowPaymentModal(plan.key)}
                      disabled={subscribing}
                      style={{
                        width: '100%',
                        padding: '11px 0',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: plan.popular ? 'var(--accent)' : '#1e1d1b',
                        color: '#fff',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: subscribing ? 'not-allowed' : 'pointer',
                        opacity: subscribing ? 0.7 : 1,
                        transition: 'all 0.25s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        letterSpacing: '0.02em',
                      }}
                      onMouseEnter={(e) => {
                        if (!subscribing) {
                          e.currentTarget.style.backgroundColor = plan.popular
                            ? 'var(--accent-hover)'
                            : '#2d2c2a';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = plan.popular
                          ? 'var(--accent)'
                          : '#1e1d1b';
                      }}
                    >
                      Upgrade
                      <FiArrowRight size={14} />
                    </button>
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        padding: '11px 0',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'var(--text-tertiary)',
                        backgroundColor: 'transparent',
                        border: '1px solid var(--border)',
                      }}
                    >
                      Included in your plan
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* --- Fine print --- */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            color: 'var(--text-tertiary)',
            marginTop: '24px',
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          All plans include a 15-minute live preview for generated projects. Preview resets when you request changes.
          <br />
          Prices in DT (Tunisian Dinar) for local payments, USD for international cards.
        </p>
      </div>

      {/* --- Payment Method Modal --- */}
      {showPaymentModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => !subscribing && setShowPaymentModal(null)}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Modal card */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '420px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: 'var(--shadow-lg)',
              animation: 'fadeUp 0.25s ease-out',
            }}
          >
            {/* Close */}
            <button
              onClick={() => !subscribing && setShowPaymentModal(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: subscribing ? 'not-allowed' : 'pointer',
                color: 'var(--text-tertiary)',
                padding: '4px',
              }}
            >
              <FiX size={18} />
            </button>

            {/* Header */}
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '20px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
                letterSpacing: '-0.01em',
              }}
            >
              Upgrade to {PLANS.find((p) => p.key === showPaymentModal)?.name}
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginBottom: '28px',
              }}
            >
              Choose your preferred payment method
            </p>

            {/* Payment buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Stripe */}
              <button
                onClick={() => handleSubscribe(showPaymentModal, 'stripe')}
                disabled={subscribing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--card-bg)',
                  cursor: subscribing ? 'not-allowed' : 'pointer',
                  opacity: subscribing ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!subscribing) {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FiCreditCard size={18} style={{ color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
                    {subscribing ? 'Processing...' : 'International card'}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px',
                      color: 'var(--text-tertiary)',
                      margin: 0,
                    }}
                  >
                    Visa, Mastercard, American Express
                  </p>
                </div>
                <FiArrowRight
                  size={16}
                  style={{ color: 'var(--text-tertiary)', marginLeft: 'auto' }}
                />
              </button>

              {/* Konnect */}
              <button
                onClick={() => handleSubscribe(showPaymentModal, 'konnect')}
                disabled={subscribing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--card-bg)',
                  cursor: subscribing ? 'not-allowed' : 'pointer',
                  opacity: subscribing ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!subscribing) {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FiGlobe size={18} style={{ color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
                    {subscribing ? 'Processing...' : 'Tunisian payment'}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px',
                      color: 'var(--text-tertiary)',
                      margin: 0,
                    }}
                  >
                    d-card, e-DINAR, local bank cards
                  </p>
                </div>
                <FiArrowRight
                  size={16}
                  style={{ color: 'var(--text-tertiary)', marginLeft: 'auto' }}
                />
              </button>
            </div>

            {/* Price reminder */}
            <div
              style={{
                marginTop: '20px',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  margin: 0,
                }}
              >
                {(() => {
                  const plan = PLANS.find((p) => p.key === showPaymentModal);
                  if (!plan) return '';
                  return `${plan.priceDT} DT / $${plan.priceUSD} per month`;
                })()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
