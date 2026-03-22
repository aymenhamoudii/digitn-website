'use client'

import { useEffect } from 'react'
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi'

export default function PlatformError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Platform Error]', error)
  }, [error])

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
      >
        <FiAlertTriangle size={22} style={{ color: 'var(--accent)' }} />
      </div>
      <h2
        className="text-xl font-semibold mb-2"
        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}
      >
        Something went wrong
      </h2>
      <p
        className="text-sm mb-6 max-w-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        An unexpected error occurred. Try refreshing the page.
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
        style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
      >
        <FiRefreshCw size={14} />
        Try again
      </button>
    </div>
  )
}
