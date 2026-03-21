'use client'

import { FiBell } from 'react-icons/fi'

interface HeaderProps {
  title: string
  userName?: string
  requestsLeft?: number
  requestsTotal?: number
}

export function Header({ title, userName, requestsLeft, requestsTotal }: HeaderProps) {
  const pct = requestsTotal ? Math.max(0, Math.min(100, ((requestsLeft || 0) / requestsTotal) * 100)) : 100

  return (
    <header className="h-14 flex items-center justify-between px-8 border-b border-[var(--border)] bg-[var(--bg-primary)]">
      <h1 className="text-[22px] font-semibold font-serif text-[var(--text-primary)]">
        {title}
      </h1>

      <div className="flex items-center gap-4">
        {/* Daily quota indicator */}
        {requestsLeft !== undefined && (
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent)] rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-[var(--text-tertiary)]">
              {requestsLeft} left
            </span>
          </div>
        )}

        <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--card-bg)] text-[var(--text-secondary)]">
          <FiBell size={15} />
        </button>

        {userName && (
          <div className="w-7 h-7 rounded-md bg-[var(--accent)] flex items-center justify-center text-white text-xs font-semibold">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </header>
  )
}
