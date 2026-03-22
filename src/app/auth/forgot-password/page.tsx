'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi'
import { createClient } from '@/lib/supabase/client'
import { DigItnLogo } from '@/components/ui/DigItnLogo'
import { LoadingSpinner } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full max-w-[400px]">
        <div className="flex justify-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <DigItnLogo size={28} />
            <span className="font-bold text-xl tracking-[0.06em]" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>DIGITN</span>
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
            Reset your password
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <div className="rounded-xl p-7" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(217, 119, 87, 0.1)' }}>
                <FiCheck size={22} style={{ color: 'var(--accent)' }} />
              </div>
              <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Check your email</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                We sent a reset link to <strong>{email}</strong>
              </p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <div className="relative">
                  <FiMail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-md outline-none transition-colors"
                    style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-sm font-medium rounded-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
              >
                {loading ? <LoadingSpinner size={16} /> : 'Send reset link'}
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-5">
          <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <FiArrowLeft size={14} />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
