'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex h-[100vh] w-full flex-col items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="flex max-w-lg flex-col items-center justify-center text-center space-y-6">
        <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
          <svg className="h-12 w-12 text-red-600 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-[var(--text-primary)]">Something went wrong</h2>
        <p className="text-lg text-[var(--text-secondary)]">We encountered an unexpected error while processing your request. Please try again.</p>
        <div className="flex gap-4">
          <button
            onClick={() => reset()}
            className="rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-hover)] active:scale-95"
          >
            Try again
          </button>
          <a
            href="/app"
            className="rounded-full border border-[var(--border)] bg-transparent px-8 py-3 text-sm font-semibold text-[var(--text-primary)] transition-all hover:bg-[var(--bg-secondary)] active:scale-95"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}