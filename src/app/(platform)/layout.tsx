'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/layout/Sidebar'
import { SkeletonSidebar } from '@/components/ui/Skeleton'

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userTier, setUserTier] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/auth/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('tier')
        .eq('id', user.id)
        .single()

      setUserTier(userData?.tier || 'free')
      setChecking(false)
    }
    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar — show skeleton while loading, then real sidebar */}
      <aside
        style={{ width: 'var(--sidebar-width)' }}
        className="fixed left-0 top-0 h-full z-40"
      >
        {checking || !userTier ? (
          <div
            className="h-full flex flex-col border-r"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border)',
            }}
          >
            {/* Brand skeleton */}
            <div className="px-5 py-6" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-6 rounded-sm skeleton-shimmer"
                  style={{ backgroundColor: 'var(--skeleton-base)' }}
                />
                <div
                  className="w-16 h-5 rounded-sm skeleton-shimmer"
                  style={{ backgroundColor: 'var(--skeleton-base)' }}
                />
              </div>
            </div>
            <SkeletonSidebar />
          </div>
        ) : (
          <Sidebar userTier={userTier} />
        )}
      </aside>

      <main style={{ marginLeft: 'var(--sidebar-width)' }} className="min-h-screen">
        {children}
      </main>
    </div>
  )
}
