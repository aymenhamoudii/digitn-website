import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: userData } = await supabase
    .from('users')
    .select('name, tier')
    .eq('id', user!.id)
    .single()

  const { data: quota } = await supabase
    .from('usage_quotas')
    .select('requests_used, requests_limit')
    .eq('user_id', user!.id)
    .eq('date', new Date().toISOString().split('T')[0])
    .single()

  const requestsLeft = (quota?.requests_limit || 10) - (quota?.requests_used || 0)

  return (
    <div>
      <Header
        title="Dashboard"
        userName={userData?.name || user?.email || ''}
        requestsLeft={requestsLeft}
        requestsTotal={quota?.requests_limit || 10}
      />
      <div className="px-16 py-12 max-w-platform">
        <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-2">
          Bienvenue, {userData?.name || 'utilisateur'} 👋
        </h2>
        <p className="text-[var(--text-secondary)]">
          {requestsLeft} requêtes restantes aujourd'hui
        </p>

        <div className="mt-10 grid grid-cols-2 gap-5">
          <Link
            href="/app/chat"
            className="p-6 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer block"
          >
            <p className="text-sm uppercase tracking-[0.12em] text-[var(--text-tertiary)] mb-2">Mode</p>
            <h3 className="text-xl font-serif font-semibold text-[var(--text-primary)]">Chat IA</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Posez des questions, obtenez des réponses instantanées</p>
          </Link>
          <Link
            href="/app/builder"
            className="p-6 rounded-lg border border-[var(--accent)] bg-[var(--card-bg)] hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer block"
          >
            <p className="text-sm uppercase tracking-[0.12em] text-[var(--accent)] mb-2">Mode</p>
            <h3 className="text-xl font-serif font-semibold text-[var(--text-primary)]">Créateur de projets</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Décrivez votre projet, l'IA le construit pour vous</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
