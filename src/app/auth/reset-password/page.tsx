'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiLock } from 'react-icons/fi'
import { createClient } from '@/lib/supabase/client'
import { DigItnLogo } from '@/components/ui/DigItnLogo'
import { LoadingSpinner } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    if (password.length < 6) { toast.error('Minimum 6 characters'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated!')
      setTimeout(() => router.push('/app'), 1500)
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
            Set new password
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Choose a strong password for your account
          </p>
        </div>
        <div className="rounded-xl p-7" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          {!ready ? (
            <div className="text-center py-4">
              <LoadingSpinner size={24} />
              <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>Verifying reset link...</p>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>New password</label>
                <div className="relative">
                  <FiLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-md outline-none"
                    style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    placeholder="Minimum 6 characters" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirm password</label>
                <div className="relative">
                  <FiLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-md outline-none"
                    style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    placeholder="Repeat your password" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 text-sm font-medium rounded-md disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>
                {loading ? <LoadingSpinner size={16} /> : 'Update password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
