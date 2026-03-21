'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiMail, FiLock, FiUser } from 'react-icons/fi'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Compte créé ! Bienvenue.')
      router.push('/app')
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-[var(--accent)] font-light text-2xl">|</span>
            <span className="font-bold text-xl tracking-[0.06em] font-serif text-[var(--text-primary)]">DIGITN</span>
          </Link>
          <h1 className="mt-4 text-2xl font-serif font-semibold text-[var(--text-primary)]">
            Créer votre compte
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Rejoignez DIGITN gratuitement
          </p>
        </div>

        <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border)] p-7 shadow-sm">
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-[var(--border)] rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors mb-5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs text-[var(--text-tertiary)] bg-[var(--card-bg)] px-2">
              ou avec votre email
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Nom</label>
              <div className="relative">
                <FiUser size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-[var(--bg-primary)] border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                  placeholder="Votre nom"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
              <div className="relative">
                <FiMail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-[var(--bg-primary)] border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Mot de passe</label>
              <div className="relative">
                <FiLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-[var(--bg-primary)] border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                  placeholder="Minimum 6 caractères"
                />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] text-sm font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[var(--text-secondary)]">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-[var(--accent)] hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
