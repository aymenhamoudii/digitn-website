'use client'

/**
 * Skeleton loading components — Anthropic/Claude-inspired shimmer effect.
 * Used across the platform for loading states.
 */

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'none'
}

export function Skeleton({ className = '', width, height, rounded = 'md' }: SkeletonProps) {
  const roundedMap = {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  }

  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width: width || '100%',
        height: height || '16px',
        borderRadius: roundedMap[rounded],
        backgroundColor: 'var(--skeleton-base)',
      }}
    />
  )
}

/** A skeleton for a text line */
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={12}
          width={i === lines - 1 ? '60%' : '100%'}
          rounded="sm"
        />
      ))}
    </div>
  )
}

/** A skeleton for a card */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`p-6 ${className}`}
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Skeleton width={40} height={40} rounded="full" />
        <div className="flex-1">
          <Skeleton height={14} width="50%" rounded="sm" className="mb-2" />
          <Skeleton height={10} width="30%" rounded="sm" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  )
}

/** A skeleton for a stat card */
export function SkeletonStat({ className = '' }: { className?: string }) {
  return (
    <div
      className={`p-5 ${className}`}
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
      }}
    >
      <Skeleton height={12} width="40%" rounded="sm" className="mb-3" />
      <Skeleton height={32} width="60%" rounded="md" className="mb-2" />
      <Skeleton height={10} width="50%" rounded="sm" />
    </div>
  )
}

/** A skeleton for the sidebar */
export function SkeletonSidebar() {
  const widths = [75, 60, 85, 70, 65]
  return (
    <div className="flex flex-col gap-2 p-4">
      {widths.map((w, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5">
          <Skeleton width={20} height={20} rounded="sm" />
          <Skeleton height={14} width={`${w}%`} rounded="sm" />
        </div>
      ))}
    </div>
  )
}

/** A skeleton for a project card in the grid */
export function SkeletonProjectCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
      }}
    >
      <Skeleton height={140} rounded="none" />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Skeleton height={16} width="55%" rounded="sm" />
          <Skeleton height={20} width={60} rounded="full" />
        </div>
        <SkeletonText lines={2} />
        <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <Skeleton height={10} width="30%" rounded="sm" />
          <Skeleton height={10} width="20%" rounded="sm" />
        </div>
      </div>
    </div>
  )
}

/** A skeleton for chat messages */
export function SkeletonMessage({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className="max-w-[70%] p-4"
        style={{
          backgroundColor: isUser ? 'var(--accent)' : 'var(--card-bg)',
          borderRadius: '14px',
          opacity: 0.6,
        }}
      >
        <SkeletonText lines={isUser ? 1 : 3} />
      </div>
    </div>
  )
}

/** Loading spinner — minimal Anthropic style */
export function LoadingSpinner({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="var(--text-tertiary)"
        strokeWidth="2"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
