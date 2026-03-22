'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiMessageSquare, FiCode, FiFolder, FiSettings, FiZap, FiLogOut } from 'react-icons/fi'
import { useTranslations } from 'next-intl'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/app', icon: FiZap, key: 'chat' as const, exact: true },
  { href: '/app/chat', icon: FiMessageSquare, key: 'chat' as const },
  { href: '/app/builder', icon: FiCode, key: 'builder' as const },
  { href: '/app/projects', icon: FiFolder, key: 'projects' as const },
  { href: '/app/settings', icon: FiSettings, key: 'settings' as const },
]

export function Sidebar({ userTier }: { userTier: string }) {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const tierName = userTier === 'free' ? 'DIGITN FAST'
    : userTier === 'pro' ? 'DIGITN PRO'
    : 'DIGITN PLUS'

  return (
    <aside
      style={{ width: 'var(--sidebar-width)' }}
      className="fixed left-0 top-0 h-full flex flex-col border-r border-[var(--border)] bg-[var(--bg-secondary)] z-40"
    >
      {/* Brand */}
      <div className="px-5 py-6 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[var(--accent)] font-light text-xl">|</span>
          <span className="font-bold text-lg tracking-[0.06em] font-serif text-[var(--text-primary)]">
            DIGITN
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-2 mb-3 text-[11px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-medium">
          Platform
        </p>
        {navItems.map(({ href, icon: Icon, key, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                isActive
                  ? 'bg-[var(--card-bg)] text-[var(--text-primary)] font-medium'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)]'
              }`}
            >
              <Icon size={15} />
              {t(key)}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: tier badge + theme + logout */}
      <div className="px-3 py-4 border-t border-[var(--border)] space-y-2">
        {/* Tier badge */}
        <div className="px-3 py-2 rounded-md bg-[var(--card-bg)] border border-[var(--border)]">
          <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Plan actif</p>
          <p className="text-sm font-semibold text-[var(--accent)] mt-0.5">{tierName}</p>
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-2 py-1 rounded-md hover:bg-[var(--card-bg)]"
          >
            <FiLogOut size={14} />
            <span className="text-xs">{t('logout')}</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
