'use client'

import Link from 'next/link'
import { FiArrowLeft, FiHome } from 'react-icons/fi'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <h1
            className="text-[120px] font-bold leading-none"
            style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-serif)' }}
          >
            404
          </h1>
        </div>

        <h2
          className="text-3xl lg:text-4xl font-medium mb-4 tracking-tight"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}
        >
          Page not found
        </h2>

        <p className="mb-8 text-lg" style={{ color: 'var(--text-secondary)' }}>
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-medium rounded-full transition-all duration-300"
            style={{
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-primary)',
            }}
          >
            <FiHome size={14} />
            Back to home
          </Link>

          <Link
            href="/app"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-medium rounded-full transition-all duration-300"
            style={{
              border: '1px solid var(--border-strong)',
              color: 'var(--text-secondary)',
            }}
          >
            <FiArrowLeft size={14} />
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
