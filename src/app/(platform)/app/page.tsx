'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/Header'
import { Skeleton, SkeletonStat } from '@/components/ui/Skeleton'
import Link from 'next/link'
import { FiMessageSquare, FiBox, FiFolder, FiArrowRight, FiZap, FiClock } from 'react-icons/fi'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [tier, setTier] = useState('free')
  const [requestsUsed, setRequestsUsed] = useState(0)
  const [requestsLimit, setRequestsLimit] = useState(10)
  const [projectCount, setProjectCount] = useState(0)
  const [recentProjects, setRecentProjects] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch user data
      const { data: userData } = await supabase
        .from('users')
        .select('name, tier')
        .eq('id', user.id)
        .maybeSingle()

      // Fetch quota
      const today = new Date().toISOString().split('T')[0]
      const { data: quota } = await supabase
        .from('usage_quotas')
        .select('requests_used, requests_limit')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle()

      // Fetch projects
      const { data: projects, count } = await supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)

      setUserName(userData?.name || user.email?.split('@')[0] || 'User')
      setTier(userData?.tier || 'free')
      setRequestsUsed(quota?.requests_used || 0)
      setRequestsLimit(quota?.requests_limit || 10)
      setProjectCount(count || 0)
      setRecentProjects(projects || [])
      setLoading(false)
    }
    loadData()
  }, [])

  const requestsLeft = requestsLimit - requestsUsed
  const tierDisplay = tier === 'free' ? 'DIGITN FAST' : tier === 'pro' ? 'DIGITN PRO' : 'DIGITN PLUS'
  const tierColor = tier === 'free' ? 'var(--text-secondary)' : 'var(--accent)'

  return (
    <div>
      <Header
        title="Dashboard"
        userName={userName}
        requestsLeft={requestsLeft}
        requestsTotal={requestsLimit}
      />
      <div className="px-16 py-12 max-w-platform">
        {/* Welcome */}
        {loading ? (
          <div className="mb-10">
            <Skeleton height={28} width="35%" rounded="md" className="mb-3" />
            <Skeleton height={16} width="25%" rounded="sm" />
          </div>
        ) : (
          <div className="mb-10">
            <h2 className="text-2xl font-serif mb-1" style={{ color: 'var(--text-primary)' }}>
              Welcome back, {userName} 👋
            </h2>
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-medium uppercase tracking-[0.1em] px-2.5 py-1 rounded-full"
                style={{
                  color: tierColor,
                  backgroundColor: tier === 'free' ? 'var(--card-bg)' : 'rgba(217, 119, 87, 0.1)',
                  border: `1px solid ${tier === 'free' ? 'var(--border)' : 'rgba(217, 119, 87, 0.2)'}`,
                }}
              >
                {tierDisplay}
              </span>
              <span style={{ color: 'var(--text-secondary)' }} className="text-sm">
                {requestsLeft} requests remaining today
              </span>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-5 mb-10">
          {loading ? (
            <>
              <SkeletonStat />
              <SkeletonStat />
              <SkeletonStat />
            </>
          ) : (
            <>
              <div
                className="p-5 rounded-xl transition-all hover:-translate-y-0.5"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <FiZap size={14} style={{ color: 'var(--accent)' }} />
                  <span className="text-xs uppercase tracking-[0.12em] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                    Quota Today
                  </span>
                </div>
                <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {requestsUsed} / {requestsLimit}
                </p>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((requestsUsed / requestsLimit) * 100, 100)}%`,
                      backgroundColor: requestsUsed / requestsLimit > 0.8 ? '#ef4444' : 'var(--accent)',
                    }}
                  />
                </div>
              </div>

              <div
                className="p-5 rounded-xl transition-all hover:-translate-y-0.5"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <FiFolder size={14} style={{ color: 'var(--accent)' }} />
                  <span className="text-xs uppercase tracking-[0.12em] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                    Projects
                  </span>
                </div>
                <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {projectCount}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  {tier === 'free' ? '1 active max' : tier === 'pro' ? '3 active max' : 'Unlimited'}
                </p>
              </div>

              <div
                className="p-5 rounded-xl transition-all hover:-translate-y-0.5"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <FiClock size={14} style={{ color: 'var(--accent)' }} />
                  <span className="text-xs uppercase tracking-[0.12em] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                    Preview Time
                  </span>
                </div>
                <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  15 min
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  Per project, resets on rebuild
                </p>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <h3 className="text-lg font-serif font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
        <div className="grid grid-cols-2 gap-5 mb-10">
          {loading ? (
            <>
              <Skeleton height={120} rounded="lg" />
              <Skeleton height={120} rounded="lg" />
            </>
          ) : (
            <>
              <Link
                href="/app/chat"
                className="group p-6 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md flex items-start gap-4"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--bg-primary)' }}
                >
                  <FiMessageSquare size={18} style={{ color: 'var(--text-primary)' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
                      Chat with AI
                    </h3>
                    <FiArrowRight
                      size={16}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--text-tertiary)' }}
                    />
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Ask questions and get instant AI-powered answers
                  </p>
                </div>
              </Link>

              <Link
                href="/app/builder"
                className="group p-6 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md flex items-start gap-4"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--accent)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(217, 119, 87, 0.1)' }}
                >
                  <FiBox size={18} style={{ color: 'var(--accent)' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
                      Project Builder
                    </h3>
                    <FiArrowRight
                      size={16}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--accent)' }}
                    />
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Describe your project and let AI build it for you
                  </p>
                </div>
              </Link>
            </>
          )}
        </div>

        {/* Recent Projects */}
        {!loading && recentProjects.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Projects</h3>
              <Link
                href="/app/projects"
                className="text-sm font-medium flex items-center gap-1 transition-colors"
                style={{ color: 'var(--accent)' }}
              >
                View all <FiArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {recentProjects.map((p) => {
                const isExpired = p.status === 'expired' || new Date(p.expires_at) < new Date()
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-4 rounded-xl transition-all hover:shadow-sm"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border)',
                      opacity: isExpired ? 0.5 : 1,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: 'var(--bg-primary)' }}
                      >
                        <FiFolder size={14} style={{ color: 'var(--text-secondary)' }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {new Date(p.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-[10px] uppercase font-bold px-2 py-1 rounded-sm"
                      style={{
                        backgroundColor: isExpired ? 'var(--card-strong)' : p.status === 'ready' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                        color: isExpired ? 'var(--text-tertiary)' : p.status === 'ready' ? '#22c55e' : '#eab308',
                      }}
                    >
                      {isExpired ? 'Expired' : p.status}
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
