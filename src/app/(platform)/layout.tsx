import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: userData } = await supabase
    .from('users')
    .select('tier, name')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Sidebar userTier={userData?.tier || 'free'} />
      <main style={{ marginLeft: 'var(--sidebar-width)' }} className="min-h-screen">
        {children}
      </main>
    </div>
  )
}
