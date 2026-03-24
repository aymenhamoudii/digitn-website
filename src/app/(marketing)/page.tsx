'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { siteConfig } from '@/config/site'
import { trackConversion } from '@/lib/analytics'
import { faqSchema, serviceSchema } from './metadata'

const GlobeMap = dynamic(() => import('./GlobeMap'), { ssr: false })

/* ===========================================
   SCROLL REVEAL HOOK
   =========================================== */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show')
          }
        })
      },
      { threshold: 0.15 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}

/* ===========================================
   ICONS (all use currentColor)
   =========================================== */
const Arrow = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
    <path d="M2 7h10m0 0L8 3m4 4L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const Check = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
    <path d="M4 9l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const Star = ({ className = '' }: { className?: string }) => (
  <svg width="14" height="14" className={className} viewBox="0 0 14 14">
    <path d="M7 0l1.76 4.83h5.08l-4.11 2.99 1.57 4.83L7 9.66l-4.3 2.99 1.57-4.83L.16 4.83h5.08L7 0z" fill="currentColor" />
  </svg>
)

const WhatsApp = () => (
  <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const SunIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
)

const MoonIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
)

/* ===========================================
   REVEAL WRAPPER
   =========================================== */
function Reveal({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  const ref = useReveal()
  return <div ref={ref} data-reveal className={className}>{children}</div>
}

/* ===========================================
   ANIMATED COUNTER
   =========================================== */
function AnimatedCounter({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !started.current) {
            started.current = true
            const startTime = performance.now()
            const animate = (now: number) => {
              const progress = Math.min((now - startTime) / duration, 1)
              const eased = 1 - Math.pow(1 - progress, 3)
              setCount(Math.floor(eased * target))
              if (progress < 1) requestAnimationFrame(animate)
            }
            requestAnimationFrame(animate)
          }
        })
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

/* ===========================================
   MORPHING LOGO
   =========================================== */
function MorphLogo({ scrolled }: { scrolled: boolean }) {
  const letterT = scrolled
    ? 'opacity 0.15s ease-out'
    : 'opacity 0.15s ease-out 0.18s'
  const rectT = scrolled
    ? 'x 0.2s ease-out 0.15s, transform 0.2s ease-out 0.15s'
    : 'x 0.15s ease-out, transform 0.15s ease-out'

  return (
    <svg
      viewBox="0 0 85 16"
      width="85"
      height="16"
      className="select-none"
      style={{ overflow: 'visible' }}
    >
      <g transform="matrix(1,0,0,1,13,0)">
        <text fill="var(--text-primary)" fontSize="15.5" fontWeight="700"
          fontFamily="var(--font-inter), system-ui, sans-serif"
          letterSpacing="0.02em" y="13">D</text>
      </g>
      <g transform="matrix(1,0,0,1,26,0)"
        opacity={scrolled ? 0 : 1} style={{ transition: letterT }}>
        <text fill="var(--text-primary)" fontSize="15.5" fontWeight="700"
          fontFamily="var(--font-inter), system-ui, sans-serif"
          letterSpacing="0.02em" y="13">I</text>
      </g>
      <g transform="matrix(1,0,0,1,33,0)"
        opacity={scrolled ? 0 : 1} style={{ transition: letterT }}>
        <text fill="var(--text-primary)" fontSize="15.5" fontWeight="700"
          fontFamily="var(--font-inter), system-ui, sans-serif"
          letterSpacing="0.02em" y="13">G</text>
      </g>
      <g
        transform={scrolled ? 'translate(8,0.7)' : 'translate(48,1)'}
        style={{ transition: rectT }}
      >
        <rect
          x="0" y="1" width="2.5" height="11.5" rx="0.6"
          fill="var(--accent)"
          style={{
            transform: scrolled ? 'skewX(0deg)' : 'skewX(30deg)',
            transformOrigin: '1.6px 7.5px',
            transition: rectT,
          }}
        />
      </g>
      <g transform="matrix(1,0,0,1,52,0)"
        opacity={scrolled ? 0 : 1} style={{ transition: letterT }}>
        <text fill="var(--text-primary)" fontSize="15.5" fontWeight="700"
          fontFamily="var(--font-inter), system-ui, sans-serif"
          letterSpacing="0.02em" y="13">T</text>
      </g>
      <g transform="matrix(1,0,0,1,62,0)"
        opacity={scrolled ? 0 : 1} style={{ transition: letterT }}>
        <text fill="var(--text-primary)" fontSize="15.5" fontWeight="700"
          fontFamily="var(--font-inter), system-ui, sans-serif"
          letterSpacing="0.02em" y="13">N</text>
      </g>
    </svg>
  )
}

import { createClient } from '@/lib/supabase/client'

/* ===========================================
   NAVBAR
   =========================================== */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 5)
    window.addEventListener('scroll', onScroll, { passive: true })
    // Read current theme from DOM
    setIsDark(document.documentElement.getAttribute('data-theme') !== 'light')

    // Check auth status
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session)
    })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme')
    const next = current === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('digitn-theme', next)
    setIsDark(next === 'dark')
  }

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'How it Works', href: '#how-it-works' },
  ]

  return (
    <nav
      className="fixed top-0 w-full z-50"
      style={{
        backgroundColor: 'var(--nav-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--nav-border)',
        padding: '16px 24px',
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <a href="/" className="flex items-center" style={{ width: 85 }}>
          <MorphLogo scrolled={scrolled} />
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              style={{ color: 'var(--text-secondary)' }}
              className="text-sm hover:opacity-100 transition-opacity duration-300"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors duration-300"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Toggle theme"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

          {isLoggedIn ? (
            <>
              <a
                href="/app/settings"
                className="px-5 py-2 text-sm font-medium transition-colors duration-300"
                style={{ color: 'var(--text-secondary)' }}
              >
                Profile
              </a>
              <a
                href="/app"
                className="px-5 py-2 text-white text-sm font-medium rounded-full transition-all duration-300 hover:opacity-90"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Dashboard
              </a>
            </>
          ) : (
            <>
              <a
                href="/auth/login"
                className="px-5 py-2 text-sm font-medium transition-colors duration-300"
                style={{ color: 'var(--text-secondary)' }}
              >
                Sign In
              </a>
              <a
                href="/auth/signup"
                className="px-5 py-2 text-white text-sm font-medium rounded-full transition-all duration-300 hover:opacity-90"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Start Building
              </a>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Toggle theme"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button className="flex flex-col gap-1" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="w-5 h-[2px] transition-transform duration-300" style={{ backgroundColor: 'var(--text-primary)', transform: menuOpen ? 'rotate(45deg) translateY(4px)' : 'none' }} />
            <span className="w-5 h-[2px] transition-opacity duration-300" style={{ backgroundColor: 'var(--text-primary)', opacity: menuOpen ? 0 : 1 }} />
            <span className="w-5 h-[2px] transition-transform duration-300" style={{ backgroundColor: 'var(--text-primary)', transform: menuOpen ? 'rotate(-45deg) translateY(-4px)' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 pb-4 flex flex-col gap-3">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm px-2 py-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              {l.label}
            </a>
          ))}
          <hr style={{ borderColor: 'var(--border)' }} />
          {isLoggedIn ? (
            <>
              <a
                href="/app/settings"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium px-2 py-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                Profile
              </a>
              <a
                href="/app"
                onClick={() => setMenuOpen(false)}
                className="mx-2 px-5 py-2 text-white text-sm text-center rounded-full transition-colors duration-300"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Dashboard
              </a>
            </>
          ) : (
            <>
              <a
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium px-2 py-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                Sign In
              </a>
              <a
                href="/auth/signup"
                onClick={() => setMenuOpen(false)}
                className="mx-2 px-5 py-2 text-white text-sm text-center rounded-full transition-colors duration-300"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Start Building
              </a>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

/* ===========================================
   HERO + DEMO CHAT
   =========================================== */
function Hero() {
  const ref = useReveal()
  const [demoStep, setDemoStep] = useState(0)
  const [typedResponse, setTypedResponse] = useState('')
  const fullResponse = "I'll create a modern restaurant site with online reservations, a beautiful menu page, photo gallery, and contact section. Let me set that up for you..."

  useEffect(() => {
    // Step 0: show user message after 1s
    const t1 = setTimeout(() => setDemoStep(1), 1000)
    // Step 1: start AI typing after 2s
    const t2 = setTimeout(() => setDemoStep(2), 2500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => {
    if (demoStep < 2) return
    let i = 0
    const interval = setInterval(() => {
      i++
      if (i <= fullResponse.length) {
        setTypedResponse(fullResponse.slice(0, i))
      } else {
        clearInterval(interval)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [demoStep])

  return (
    <section className="pt-36 pb-8 px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div ref={ref} data-reveal className="max-w-4xl mx-auto text-center">
        <h1
          style={{
            fontSize: 'clamp(36px, 5.5vw, 72px)',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-serif)',
          }}
        >
          Describe it.
          <br />
          <span style={{ textDecoration: 'underline', textDecorationThickness: '3px', textUnderlineOffset: '6px', textDecorationColor: 'var(--accent)' }}>
            We build it.
          </span>
        </h1>

        <p
          className="mx-auto mt-6"
          style={{
            fontSize: 18,
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
            maxWidth: 560,
          }}
        >
          DIGITN AI turns your ideas into production-ready websites and apps. Just describe what you want — our AI handles the rest.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <a
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-white text-sm font-medium rounded-full hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Start Building Free <Arrow />
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-medium rounded-full hover:-translate-y-0.5 transition-all duration-300"
            style={{ border: '1px solid var(--border-strong)', color: 'var(--text-secondary)' }}
          >
            See how it works
          </a>
        </div>

        {/* Demo Chat Interface */}
        <div
          className="mx-auto mt-16 rounded-2xl overflow-hidden text-left"
          style={{
            maxWidth: 640,
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--border-strong)' }} />
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--border-strong)' }} />
            <div className="ml-3 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="6" width="4" height="20" rx="1.5" fill="#d97757" transform="skewX(-8)" />
                <text x="13" y="24" fontFamily="system-ui, sans-serif" fontSize="20" fontWeight="700" fill="currentColor">D</text>
              </svg>
              <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>DIGITN AI</span>
            </div>
          </div>

          <div className="p-5 space-y-4" style={{ minHeight: 200 }}>
            {/* User message */}
            <div
              className="flex justify-end transition-all duration-500"
              style={{ opacity: demoStep >= 1 ? 1 : 0, transform: demoStep >= 1 ? 'translateY(0)' : 'translateY(8px)' }}
            >
              <div
                className="px-4 py-2.5 rounded-2xl rounded-br-sm text-sm max-w-[80%]"
                style={{ backgroundColor: 'var(--card-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
              >
                Build me a restaurant website with online reservations
              </div>
            </div>

            {/* AI response — Claude style: logo + text, no bubble */}
            <div
              className="flex gap-3 transition-all duration-500"
              style={{ opacity: demoStep >= 2 ? 1 : 0, transform: demoStep >= 2 ? 'translateY(0)' : 'translateY(8px)' }}
            >
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center mt-0.5" style={{ color: 'var(--text-primary)' }}>
                <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="6" width="4" height="20" rx="1.5" fill="#d97757" transform="skewX(-8)" />
                  <text x="13" y="24" fontFamily="system-ui, sans-serif" fontSize="20" fontWeight="700" fill="currentColor">D</text>
                </svg>
              </div>
              <p className="text-sm leading-relaxed flex-1 pt-0.5" style={{ color: 'var(--text-primary)' }}>
                {typedResponse}
                {typedResponse.length < fullResponse.length && (
                  <span
                    className="inline-block w-[2px] h-[1em] align-text-bottom ml-[2px]"
                    style={{ backgroundColor: 'var(--accent)', animation: 'blink 0.9s step-end infinite' }}
                  />
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===========================================
   STATS STRIP
   =========================================== */
function StatsStrip() {
  return (
    <section className="py-12 px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div
        className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x"
        style={{ borderColor: 'var(--border)' }}
      >
        {[
          { value: 10, suffix: 'K+', label: 'Projects created' },
          { value: 50, suffix: '+', label: 'Countries' },
          { value: 99, suffix: '.9%', label: 'Uptime' },
          { value: 30, suffix: 's', label: 'Build time', prefix: '<' },
        ].map((stat, i) => (
          <div key={i} className="text-center py-4" style={{ borderColor: 'var(--border)' }}>
            <p className="text-3xl lg:text-4xl font-medium tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {stat.prefix || ''}<AnimatedCounter target={stat.value} suffix={stat.suffix} />
            </p>
            <p className="text-xs mt-1 uppercase tracking-[0.15em] font-medium" style={{ color: 'var(--text-tertiary)' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ===========================================
   HOW IT WORKS
   =========================================== */
function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Describe',
      desc: 'Tell DIGITN AI what you want to build. Be as detailed or brief as you like.',
      icon: (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
      ),
    },
    {
      num: '02',
      title: 'Build',
      desc: 'Watch in real-time as our AI writes code, designs layouts, and sets up your project.',
      icon: (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
        </svg>
      ),
    },
    {
      num: '03',
      title: 'Launch',
      desc: 'Preview your project instantly. Download the code or request changes.',
      icon: (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
      ),
    },
  ]

  return (
    <section id="how-it-works" className="py-24 px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.2em] font-medium mb-3" style={{ color: 'var(--text-tertiary)' }}>
            How it Works
          </p>
          <h2 className="text-3xl lg:text-4xl font-medium tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
            Three steps to launch
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <Reveal key={i}>
              <div
                className="relative p-8 rounded-2xl h-full flex flex-col hover:-translate-y-1 transition-all duration-500"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Connector dots (between cards) */}
                {i < 2 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border-strong)' }} />
                    <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--border-strong)', opacity: 0.5 }} />
                  </div>
                )}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    {step.icon}
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>{step.num}</span>
                </div>
                <h3 className="text-xl font-medium mb-3" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ===========================================
   FEATURES GRID
   =========================================== */
function Features() {
  const features = [
    {
      title: 'AI-Powered Builder',
      desc: 'Our built-in AI engine creates full projects from natural language descriptions.',
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
      ),
    },
    {
      title: 'Real-time Preview',
      desc: 'See your project live as it is being built, right in your browser.',
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      title: 'Code Download',
      desc: 'Download your complete source code anytime. You own everything you build.',
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      ),
    },
    {
      title: 'Multiple Project Types',
      desc: 'Websites, web apps, e-commerce stores, APIs — build anything you need.',
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      ),
    },
    {
      title: 'Instant Deploy',
      desc: 'Projects go live on a preview URL immediately. Share with anyone.',
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
    },
    {
      title: 'Chat Interface',
      desc: 'Talk to DIGITN AI naturally to describe, refine, and iterate on your project.',
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      ),
    },
  ]

  return (
    <section id="features" className="py-24 px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.2em] font-medium mb-3" style={{ color: 'var(--text-tertiary)' }}>
            Features
          </p>
          <h2 className="text-3xl lg:text-4xl font-medium tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
            Everything you need to build
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Reveal key={i}>
              <div
                className="group p-7 rounded-2xl h-full flex flex-col hover:-translate-y-1 transition-all duration-500 cursor-default"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  {f.icon}
                </div>
                <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ===========================================
   PRICING
   =========================================== */
function Pricing() {
  const plans = [
    {
      name: 'DIGITN FAST',
      price: 'Free',
      priceSuffix: '',
      features: [
        '10 requests / day',
        '1 active project',
        'Standard AI models',
        'Community support',
      ],
      cta: 'Start Free',
      href: '/auth/signup',
      popular: false,
    },
    {
      name: 'DIGITN PRO',
      price: '$9',
      priceSuffix: '/mo',
      priceAlt: '29 DT',
      features: [
        '50 requests / day',
        '3 active projects',
        'Premium AI models',
        'Priority support',
      ],
      cta: 'Upgrade to PRO',
      href: '/auth/signup',
      popular: true,
    },
    {
      name: 'DIGITN PLUS',
      price: '$25',
      priceSuffix: '/mo',
      priceAlt: '79 DT',
      features: [
        'Unlimited requests',
        'Unlimited projects',
        'Premium AI models',
        'Dedicated support',
      ],
      cta: 'Go PLUS',
      href: '/auth/signup',
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-24 px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.2em] font-medium mb-3" style={{ color: 'var(--text-tertiary)' }}>
            Pricing
          </p>
          <h2 className="text-3xl lg:text-4xl font-medium tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
            Simple, transparent pricing
          </h2>
        </Reveal>

        <div className="grid lg:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <Reveal key={i}>
              <div
                className={`relative p-8 rounded-2xl h-full flex flex-col transition-all duration-500 hover:-translate-y-1 ${plan.popular ? 'plan-glow' : ''}`}
                style={{
                  backgroundColor: plan.popular ? 'var(--text-primary)' : 'var(--card-bg)',
                  color: plan.popular ? 'var(--bg-primary)' : 'var(--text-primary)',
                  border: plan.popular ? 'none' : '1px solid var(--border)',
                }}
              >
                {plan.popular && (
                  <span
                    className="absolute -top-3 left-6 px-3 py-1 text-[10px] font-medium rounded-full uppercase text-white"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    Popular
                  </span>
                )}
                <h3 className="text-lg font-medium mb-6">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-medium">{plan.price}</span>
                  {plan.priceSuffix && (
                    <span style={{ opacity: 0.5 }}>{plan.priceSuffix}</span>
                  )}
                </div>
                {plan.priceAlt && (
                  <p className="text-xs mb-6" style={{ opacity: 0.4 }}>{plan.priceAlt} / month</p>
                )}
                {!plan.priceAlt && <div className="mb-6" />}
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <span style={{ color: plan.popular ? 'var(--bg-primary)' : 'var(--text-primary)' }}>
                        <Check />
                      </span>
                      <span style={{ opacity: 0.7 }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.href}
                  onClick={() => trackConversion('plan_selected', { plan_name: plan.name })}
                  className="block text-center py-3 rounded-full text-sm font-medium transition-all duration-300 hover:opacity-90"
                  style={{
                    backgroundColor: plan.popular ? 'var(--bg-primary)' : 'var(--text-primary)',
                    color: plan.popular ? 'var(--text-primary)' : 'var(--bg-primary)',
                  }}
                >
                  {plan.cta}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ===========================================
   PORTFOLIO — "Built with DIGITN AI"
   =========================================== */
function Portfolio() {
  const projects = [
    {
      name: "Cote d'Or",
      cat: 'Restaurant',
      result: '+45% reservations',
      desc: 'Full restaurant site with online reservations, interactive menu, and photo gallery.',
      icon: (
        <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z" />
        </svg>
      ),
    },
    {
      name: 'Beauty Luxe',
      cat: 'Beauty',
      result: '+120 bookings/mo',
      desc: 'Appointment booking platform with portfolio gallery and customer reviews.',
      icon: (
        <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      ),
    },
    {
      name: 'TechShop',
      cat: 'E-commerce',
      result: '3x sales',
      desc: 'Complete online store with secure payments, inventory management, and order tracking.',
      icon: (
        <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
      ),
    },
    {
      name: 'Dr. Amira',
      cat: 'Medical',
      result: 'Top 3 Google',
      desc: 'Medical practice site with appointment booking, patient forms, and health blog.',
      icon: (
        <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      ),
    },
    {
      name: 'Cafe Arabica',
      cat: 'Food & Beverage',
      result: '+2K followers',
      desc: 'Online ordering platform with loyalty program and integrated digital marketing.',
      icon: (
        <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
        </svg>
      ),
    },
    {
      name: 'Medina Palace',
      cat: 'Hospitality',
      result: '+60% bookings',
      desc: 'Hotel website with booking engine, virtual tour, and multilingual support.',
      icon: (
        <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
        </svg>
      ),
    },
  ]

  return (
    <section id="portfolio" className="py-24 px-6" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.2em] font-medium mb-3" style={{ color: 'var(--text-tertiary)' }}>
            Showcase
          </p>
          <h2 className="text-3xl lg:text-4xl font-medium mb-16 tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
            Built with DIGITN AI
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p, i) => (
            <Reveal key={i}>
              <div
                className="group cursor-pointer rounded-2xl overflow-hidden h-full flex flex-col hover:-translate-y-1 transition-all duration-500"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Icon header */}
                <div
                  className="h-32 w-full flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                  <div style={{ color: 'var(--text-secondary)' }} className="group-hover:scale-110 transition-transform duration-500">
                    {p.icon}
                  </div>
                </div>

                <div className="p-7 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {p.name}
                    </h3>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider"
                      style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                    >
                      {p.cat}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed mb-6 flex-grow" style={{ color: 'var(--text-secondary)' }}>
                    {p.desc}
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-sm font-medium mb-6" style={{ color: 'var(--accent)' }}>
                    <span className="font-bold">{p.result}</span>
                    <Arrow />
                  </div>
                  <div className="pt-5 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Built by DIGITN AI users</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ===========================================
   TESTIMONIALS
   =========================================== */
function Testimonials() {
  const items = [
    { name: 'Ahmed Ben Ali', role: 'Restaurant Owner', text: 'Reservations jumped 45% in two months. The interface is simple and incredibly effective.', initial: 'A' },
    { name: 'Nadia Mansour', role: 'Beauty Luxe Salon', text: 'The booking system saves us hours every week. Our clients love how easy it is.', initial: 'N' },
    { name: 'Karim Trabelsi', role: 'TechShop E-commerce', text: '3x more sales in 3 months. Support is always responsive and helpful.', initial: 'K' },
  ]

  return (
    <section className="py-24 px-6" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.2em] font-medium mb-3" style={{ color: 'var(--text-tertiary)' }}>
            Testimonials
          </p>
          <h2 className="text-3xl lg:text-4xl font-medium mb-16 tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
            What our users say
          </h2>
        </Reveal>

        <div className="grid lg:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <Reveal key={i}>
              <div
                className="p-8 rounded-2xl h-full flex flex-col hover:-translate-y-1 transition-all duration-500"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => <Star key={j} className="text-[color:var(--accent)]" />)}
                </div>
                <p className="leading-relaxed mb-6 flex-grow text-base" style={{ color: 'var(--text-secondary)' }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg shadow-md"
                    style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
                  >
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ===========================================
   CTA SECTION
   =========================================== */
function CtaSection() {
  const ref = useReveal()

  return (
    <section className="py-24 px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div ref={ref} data-reveal className="max-w-3xl mx-auto text-center">
        <h2
          className="text-3xl lg:text-5xl font-medium tracking-[-0.02em] mb-6"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}
        >
          Ready to build something amazing?
        </h2>
        <p
          className="text-lg mb-10 mx-auto"
          style={{ color: 'var(--text-secondary)', maxWidth: 480 }}
        >
          Join thousands of builders using DIGITN AI. Start for free — no credit card required.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-medium rounded-full hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Start Building Free <Arrow />
          </a>
          <a
            href={`https://wa.me/${siteConfig.phoneRaw}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 text-sm font-medium rounded-full hover:-translate-y-0.5 transition-all duration-300"
            style={{
              border: '1px solid var(--border-strong)',
              color: 'var(--text-secondary)',
            }}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-green)' }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Questions? Chat with us
          </a>
        </div>
      </div>
    </section>
  )
}

/* ===========================================
   FOOTER
   =========================================== */
function Footer() {
  return (
    <footer className="py-16 px-6" style={{ backgroundColor: '#1e1d1b' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-light text-2xl" style={{ color: 'var(--accent)' }}>|</span>
              <span className="font-bold text-xl tracking-[0.06em] text-white">DIGITN</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              AI-powered platform that turns your ideas into production-ready websites and apps. Describe it — we build it.
            </p>
            <div className="flex gap-4">
              <a href={siteConfig.social.facebook} target="_blank" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-300">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" className="text-white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href={siteConfig.social.instagram} target="_blank" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-300">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" className="text-white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href={siteConfig.social.linkedin} target="_blank" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-300">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" className="text-white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="text-white/60 hover:text-white transition-colors duration-300">Features</a></li>
              <li><a href="#pricing" className="text-white/60 hover:text-white transition-colors duration-300">Pricing</a></li>
              <li><a href="#how-it-works" className="text-white/60 hover:text-white transition-colors duration-300">How it Works</a></li>
              <li><a href="/auth/login" className="text-white/60 hover:text-white transition-colors duration-300">Sign In</a></li>
              <li><a href="/auth/signup" className="text-white/60 hover:text-white transition-colors duration-300">Start Building</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white">Contact</h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a href={`tel:${siteConfig.phoneRaw}`} className="hover:text-white transition-colors duration-300">
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.email}`} className="hover:text-white transition-colors duration-300">
                  {siteConfig.email}
                </a>
              </li>
              <li>{siteConfig.address}</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <p>&copy; 2026 DIGITN. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/mentions-legales" className="hover:text-white/60 transition-colors duration-300">Legal</a>
            <a href="/politique-confidentialite" className="hover:text-white/60 transition-colors duration-300">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ===========================================
   MAIN PAGE
   =========================================== */
export default function Home() {
  return (
    <main>
      {/* FAQ Schema for Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Service Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <Navbar />
      <Hero />
      <StatsStrip />
      <GlobeMap />
      <HowItWorks />
      <Features />
      <Pricing />
      <Portfolio />
      <Testimonials />
      <CtaSection />
      <Footer />

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${siteConfig.phoneRaw}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 text-white rounded-full shadow-lg hover:-translate-y-1 active:scale-95 transition-all duration-300 group"
        style={{
          backgroundColor: '#25D366',
          boxShadow: '0 4px 16px rgba(37, 211, 102, 0.35)',
          animation: 'float 3s ease-in-out infinite',
        }}
        aria-label="Contact us on WhatsApp"
      >
        <WhatsApp />
        <span className="text-sm font-medium hidden sm:inline">WhatsApp</span>
      </a>
    </main>
  )
}
