import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FiHome, FiSettings, FiUsers, FiActivity } from 'react-icons/fi'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== 'contact@digitn.tech') redirect('/app')

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      {/* Admin Sidebar */}
      <aside className="w-64 fixed left-0 top-0 h-full border-r border-[var(--border)] bg-[var(--bg-secondary)] z-40">
        <div className="p-6 border-b border-[var(--border)]">
          <Link href="/admin" className="font-serif font-bold text-xl text-[var(--text-primary)]">DIGITN ADMIN</Link>
        </div>
        <nav className="p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 bg-[var(--card-bg)] rounded-md text-sm text-[var(--text-primary)] font-medium"><FiHome /> Overview</Link>
          <Link href="/app" className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--card-bg)] rounded-md text-sm text-[var(--text-secondary)] mt-auto border-t border-[var(--border)] pt-4"><FiActivity /> Exit to App</Link>
        </nav>
      </aside>

      <main className="ml-64 flex-1 min-h-screen">
        {children}
      </main>
    </div>
  )
}
