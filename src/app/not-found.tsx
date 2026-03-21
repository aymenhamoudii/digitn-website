'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#F4F0EB]">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <h1
            className="text-[120px] font-bold text-[#1A1A1A]/10 leading-none"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            404
          </h1>
        </div>

        <h2
          className="text-3xl lg:text-4xl font-medium text-[#1A1A1A] mb-4 tracking-tight"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Page introuvable
        </h2>

        <p className="text-[#1A1A1A]/60 mb-8 text-lg">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#1A1A1A] text-white text-sm font-medium rounded-full hover:bg-[#1A1A1A]/85 transition-all duration-300"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
              <path d="M12 7H2m0 0l4-4M2 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour à l'accueil
          </Link>

          <Link
            href="/#contact"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-[#1A1A1A]/15 text-sm font-medium text-[#1A1A1A]/70 rounded-full hover:border-[#1A1A1A]/30 hover:text-[#1A1A1A] transition-all duration-300"
          >
            Nous contacter
          </Link>
        </div>
      </div>
    </div>
  )
}
