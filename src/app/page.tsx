'use client'

import { useEffect, useRef, useState, FormEvent } from 'react'
import dynamic from 'next/dynamic'
import { siteConfig } from '@/config/site'
import { trackConversion } from '@/lib/analytics'

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
   ICONS
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

const Guarantee = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
  </svg>
)

const Lock = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
)

const Lightning = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
  </svg>
)

const Chat = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
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
              const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
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
   MORPHING LOGO - SVG + <g> groups
   Same technique as Anthropic Lottie SVG.
   Each letter is a <g> with transform & opacity.
   The \ slides its translateX to before D.
   D never moves. Pure SVG, zero layout cost.
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
      {/* D - fixed, never moves */}
      <g transform="matrix(1,0,0,1,13,0)">
        <text fill="#1A1A1A" fontSize="15.5" fontWeight="700"
          fontFamily="var(--font-inter), system-ui, sans-serif"
          letterSpacing="0.02em" y="13">D</text>
      </g>

      {/* I */}
      <g transform="matrix(1,0,0,1,26,0)"
        opacity={scrolled ? 0 : 1} style={{ transition: letterT }}>
        <text fill="#1A1A1A" fontSize="15.5" fontWeight="700"
          fontFamily="var(--font-inter), system-ui, sans-serif"
          letterSpacing="0.02em" y="13">I</text>
      </g>

      {/* G */}
      <g transform="matrix(1,0,0,1,33,0)"
        opacity={scrolled ? 0 : 1} style={{ transition: letterT }}>
        <text fill="#1A1A1A" fontSize="15.5" fontWeight="700"
          fontFamily="var(--font-inter), system-ui, sans-serif"
          letterSpacing="0.02em" y="13">G</text>
      </g>

      {/* Accent: skewed rect = flat top/bottom like Anthropic \ */}
      <g
        transform={scrolled ? 'translate(8,0.7)' : 'translate(48,1)'}
        style={{ transition: rectT }}
      >
        <rect
          x="0" y="1" width="2.5" height="11.5" rx="0.6"
          fill="#C96442"
          style={{
            transform: scrolled ? 'skewX(0deg)' : 'skewX(30deg)',
            transformOrigin: '1.6px 7.5px',
            transition: rectT,
          }}
        />
      </g>

      {/* T */}
      <g transform="matrix(1,0,0,1,52,0)"
        opacity={scrolled ? 0 : 1} style={{ transition: letterT }}>
        <text fill="#1A1A1A" fontSize="15.5" fontWeight="700"
          fontFamily="var(--font-inter), system-ui, sans-serif"
          letterSpacing="0.02em" y="13">T</text>
      </g>

      {/* N */}
      <g transform="matrix(1,0,0,1,62,0)"
        opacity={scrolled ? 0 : 1} style={{ transition: letterT }}>
        <text fill="#1A1A1A" fontSize="15.5" fontWeight="700"
          fontFamily="var(--font-inter), system-ui, sans-serif"
          letterSpacing="0.02em" y="13">N</text>
      </g>
    </svg>
  )
}

/* ===========================================
   NAVBAR
   Triggers on smallest scroll (>5px)
   =========================================== */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 5)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'Services', href: '#services' },
    { label: 'Portfolio', href: '#portfolio' },
    { label: 'Tarifs', href: '#tarifs' },
    { label: 'Contact', href: '#contact' },
  ]

  return (
    <nav
      className="fixed top-0 w-full z-50"
      style={{
        backgroundColor: 'rgba(244,240,235,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(25,25,24,0.06)',
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
              className="text-sm text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors duration-300"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            className="px-5 py-2 bg-[#1A1A1A] text-white text-sm rounded-full hover:bg-[#1A1A1A]/85 transition-colors duration-300"
          >
            Contact
          </a>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden flex flex-col gap-1" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`w-5 h-[2px] bg-[#1A1A1A] transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-[4px]' : ''}`} />
          <span className={`w-5 h-[2px] bg-[#1A1A1A] transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`w-5 h-[2px] bg-[#1A1A1A] transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-[4px]' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 pb-4 flex flex-col gap-3">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm text-[#1A1A1A]/60 hover:text-[#1A1A1A] px-2 py-1"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}

/* ===========================================
   HERO - Anthropic style with Playfair Display
   Big bold heading with underlined keywords (left)
   Description paragraph + CTA (right)
   =========================================== */
function Hero() {
  const ref = useReveal()

  return (
    <section className="pt-44 pb-16 px-6">
      <div ref={ref} data-reveal className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-16 items-end">
        {/* Left: Big heading */}
        <div>
          <h1
            style={{
              fontSize: 'clamp(38px, 5.5vw, 74px)',
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: '#1A1A1A',
              fontFamily: 'var(--font-serif)',
            }}
          >
            <span style={{ textDecoration: 'underline', textDecorationThickness: '3px', textUnderlineOffset: '6px', textDecorationColor: '#C96442' }}>
              Cr&eacute;ation
            </span>{' '}web et<br />
            <span style={{ textDecoration: 'underline', textDecorationThickness: '3px', textUnderlineOffset: '6px', textDecorationColor: '#C96442' }}>
              solutions
            </span>{' '}digitales<br />
            sur mesure
          </h1>
          <div className="flex flex-wrap gap-4 mt-10">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#1A1A1A] text-white text-sm font-medium rounded-full hover:shadow-lg hover:shadow-[#1A1A1A]/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
            >
              Demander un devis <Arrow />
            </a>
            <a
              href="#portfolio"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-[#1A1A1A]/15 text-sm font-medium text-[#1A1A1A]/70 rounded-full hover:border-[#1A1A1A]/30 hover:text-[#1A1A1A] transition-all duration-300"
            >
              Voir nos projets
            </a>
          </div>
        </div>

        {/* Right: Description */}
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.75,
            color: 'rgba(25,25,24,0.6)',
            maxWidth: 380,
          }}
        >
          DIGITN est une agence web tunisienne sp&eacute;cialis&eacute;e dans la cr&eacute;ation de sites performants et le d&eacute;veloppement de solutions digitales qui transforment vos visiteurs en clients.
        </p>
      </div>

      {/* Stats Strip */}
      <div className="max-w-6xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-[#1A1A1A]/10">
        {[
          { value: 50, suffix: '+', label: 'Projets livr\u00e9s' },
          { value: 30, suffix: '+', label: 'Clients satisfaits' },
          { value: 98, suffix: '%', label: 'Satisfaction' },
          { value: 24, suffix: 'h', label: 'Temps de r\u00e9ponse' },
        ].map((stat, i) => (
          <div key={i} className="text-center py-4">
            <p className="text-3xl lg:text-4xl font-medium text-[#1A1A1A] tracking-tight">
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
            </p>
            <p className="text-xs text-[#1A1A1A]/40 mt-1 uppercase tracking-[0.15em] font-medium">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ===========================================
   SERVICES
   =========================================== */
function Services() {
  const items = [
    {
      num: '01',
      title: 'D\u00e9veloppement Web',
      desc: 'Sites vitrines, e-commerce et applications web sur mesure.',
      icon: <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>,
    },
    {
      num: '02',
      title: 'Design UI/UX',
      desc: 'Interfaces \u00e9l\u00e9gantes pens\u00e9es pour convertir.',
      icon: <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>,
    },
    {
      num: '03',
      title: 'SEO & Marketing',
      desc: 'R\u00e9f\u00e9rencement naturel et strat\u00e9gies digitales.',
      icon: <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
    },
    {
      num: '04',
      title: 'Maintenance',
      desc: 'Support technique et mises \u00e0 jour r\u00e9guli\u00e8res.',
      icon: <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></svg>,
    },
  ]

  return (
    <section id="services" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.2em] text-[#1A1A1A]/40 mb-3 font-medium">Services</p>
          <h2 className="text-3xl lg:text-4xl font-medium text-[#1A1A1A] mb-16 tracking-[-0.02em]">Ce que nous faisons</h2>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-5">
          {items.map((item, i) => (
            <Reveal key={i}>
              <div className="group p-8 bg-[#EAE5D9] rounded-2xl border border-[#1A1A1A]/[0.06] hover:border-[#1A1A1A]/[0.12] hover:-translate-y-1 hover:shadow-lg hover:shadow-[#1A1A1A]/[0.06] transition-all duration-500 cursor-pointer">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#1A1A1A]/[0.06] flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-xs text-[#1A1A1A]/25 font-medium">{item.num}</span>
                </div>
                <h3 className="text-xl font-medium text-[#1A1A1A] mb-3 group-hover:text-[#1A1A1A]/80 transition-colors duration-300">{item.title}</h3>
                <p className="text-sm text-[#1A1A1A]/50 leading-relaxed">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ===========================================
   PORTFOLIO - Anthropic "Latest releases" style
   =========================================== */
function Portfolio() {
  const projects = [
    {
      name: "Côte d'Or",
      cat: 'Restaurant',
      accent: '#C96442',
      result: '+45% réservations',
      desc: 'Site vitrine avec système de réservation en ligne et menu interactif.',
      date: 'Décembre 2025',
      icon: <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" /></svg>
    },
    {
      name: 'Beauty Luxe',
      cat: 'Beauté',
      accent: '#B8936A',
      result: '+120 RDV/mois',
      desc: 'Plateforme de prise de rendez-vous avec galerie portfolio.',
      date: 'Novembre 2025',
      icon: <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /></svg>
    },
    {
      name: 'TechShop',
      cat: 'E-commerce',
      accent: '#9A7B5B',
      result: '3× ventes',
      desc: 'Boutique en ligne complète avec paiement sécurisé et suivi de commandes.',
      date: 'Octobre 2025',
      icon: <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg>
    },
    {
      name: 'Dr. Amira',
      cat: 'Médical',
      accent: '#8B7355',
      result: 'Top 3 Google',
      desc: 'Site médical avec réservation, fiches patients et blog santé.',
      date: 'Septembre 2025',
      icon: <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" /></svg>
    },
    {
      name: 'Café Arabica',
      cat: 'Food & Beverage',
      accent: '#C9A042',
      result: '+2K abonnés',
      desc: 'Site avec commande en ligne, programme fidélité et marketing digital.',
      date: 'Août 2025',
      icon: <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" /></svg>
    },
    {
      name: 'Médina Palace',
      cat: 'Hôtellerie',
      accent: '#A67C52',
      result: '+60% réservations',
      desc: 'Site hôtelier avec moteur de réservation et visite virtuelle.',
      date: 'Juillet 2025',
      icon: <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" /></svg>
    },
  ]

  return (
    <section id="portfolio" className="py-24 px-6 bg-[#F4F0EB]">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.2em] text-[#1A1A1A]/40 mb-3 font-medium">Portfolio</p>
          <h2 className="text-3xl lg:text-4xl font-medium text-[#1A1A1A] mb-16 tracking-[-0.02em]">Des projets concrets, des résultats mesurables</h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p, i) => (
            <Reveal key={i}>
              <div className="group cursor-pointer bg-[#EAE5D9] rounded-2xl overflow-hidden h-full flex flex-col border border-[#1A1A1A]/[0.04] hover:border-[#1A1A1A]/[0.08] hover:-translate-y-1 hover:shadow-lg hover:shadow-[#1A1A1A]/[0.06] transition-all duration-500">
                {/* Icon header with gradient */}
                <div
                  className="h-32 w-full flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${p.accent}15, ${p.accent}05)`,
                  }}
                >
                  <div className="text-[#1A1A1A]/80 group-hover:text-[#1A1A1A] transition-colors duration-300">
                    {p.icon}
                  </div>
                </div>

                <div className="p-7 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-[#1A1A1A] group-hover:text-[#1A1A1A]/80 transition-colors duration-300">
                      {p.name}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider" style={{ backgroundColor: `${p.accent}18`, color: p.accent }}>
                      {p.cat}
                    </span>
                  </div>
                  <p className="text-sm text-[#1A1A1A]/50 leading-relaxed mb-6 flex-grow">
                    {p.desc}
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-colors duration-300" style={{ color: p.accent }}>
                    <span className="font-bold">{p.result}</span>
                    <Arrow />
                  </div>
                  <div className="pt-5 border-t border-[#1A1A1A]/[0.08] flex items-center justify-between">
                    <p className="text-xs text-[#1A1A1A]/40">{p.date}</p>
                    <span className="text-xs text-[#1A1A1A]/30 group-hover:text-[#1A1A1A]/50 transition-colors duration-300">Voir le projet →</span>
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
   PRICING
   =========================================== */
function Pricing({ onSelectPlan }: { onSelectPlan?: (plan: { name: string; price: string }) => void }) {
  const plans = [
    { name: 'Starter', price: '499', features: ['5 pages', 'Responsive', 'Contact', 'SEO base'] },
    { name: 'Business', price: '999', features: ['15 pages', 'Premium', 'Animations', 'SEO complet', 'Blog', '3 mois support'], popular: true },
    { name: 'E-commerce', price: '1999', features: ['Boutique', 'Paiements', 'Stocks', 'Dashboard', '6 mois support'] },
  ]

  const handleSelectPlan = (plan: { name: string; price: string }) => {
    trackConversion('plan_selected', { plan_name: plan.name, plan_price: plan.price })
    onSelectPlan?.(plan)
  }

  return (
    <section id="tarifs" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-[#1A1A1A]/40 mb-3 font-medium">Tarifs</p>
          <h2 className="text-3xl lg:text-4xl font-medium text-[#1A1A1A] tracking-[-0.02em]">Prix transparents</h2>
        </Reveal>

        <div className="grid lg:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <Reveal key={i}>
              <div className={`relative p-8 rounded-2xl h-full flex flex-col transition-all duration-500 hover:-translate-y-1 ${plan.popular
                ? 'bg-[#1A1A1A] text-white shadow-xl'
                : 'bg-[#EAE5D9] border border-[#1A1A1A]/[0.06] hover:shadow-lg hover:border-[#1A1A1A]/[0.10]'
                }`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-6 px-3 py-1 bg-[#1A1A1A] text-white text-[10px] font-medium rounded-full uppercase border border-white/20">
                    Populaire
                  </span>
                )}
                <h3 className="text-lg font-medium mb-6">{plan.name}</h3>
                <div className="mb-8">
                  <span className="text-4xl font-medium">{plan.price}</span>
                  <span className={plan.popular ? 'text-white/50' : 'text-[#1A1A1A]/40'}> DT</span>
                </div>
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <Check />
                      <span className={plan.popular ? 'text-white/70' : 'text-[#1A1A1A]/60'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  onClick={() => handleSelectPlan({ name: plan.name, price: plan.price })}
                  className={`block text-center py-3 rounded-full text-sm font-medium transition-colors duration-300 ${plan.popular
                    ? 'bg-white text-[#1A1A1A] hover:bg-white/90'
                    : 'bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/90'
                    }`}
                >
                  Choisir
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
   TESTIMONIALS
   =========================================== */
function Testimonials() {
  const items = [
    { name: 'Ahmed Ben Ali', role: 'Restaurant Côte d\'Or', text: 'Les réservations ont explosé de 45% en 2 mois. Interface simple et efficace.', initial: 'A' },
    { name: 'Nadia Mansour', role: 'Salon Beauty Luxe', text: 'Le système de RDV nous fait gagner un temps fou. Clients très satisfaits.', initial: 'N' },
    { name: 'Karim Trabelsi', role: 'TechShop E-commerce', text: '3 fois plus de ventes en 3 mois. Support toujours disponible et réactif.', initial: 'K' },
  ]

  return (
    <section className="py-24 px-6 bg-[#F4F0EB]">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.2em] text-[#1A1A1A]/40 mb-3 font-medium">Témoignages</p>
          <h2 className="text-3xl lg:text-4xl font-medium text-[#1A1A1A] mb-16 tracking-[-0.02em]">Ce que disent nos clients</h2>
        </Reveal>

        <div className="grid lg:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <Reveal key={i}>
              <div className="p-8 bg-[#EAE5D9] rounded-2xl h-full flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-500 border border-[#1A1A1A]/[0.06]">
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => <Star key={j} className="text-[#C9A042]" />)}
                </div>
                <p className="text-[#1A1A1A]/70 leading-relaxed mb-6 flex-grow transition-colors duration-500 text-base">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white font-semibold text-lg shadow-md">
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{t.name}</p>
                    <p className="text-xs text-[#1A1A1A]/50">{t.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <Reveal>
            <div className="text-center p-6 bg-[#EAE5D9] rounded-xl border border-[#1A1A1A]/[0.06] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-center mb-3 text-[#1A1A1A]">
                <Guarantee />
              </div>
              <p className="text-sm font-medium text-[#1A1A1A]">Garantie satisfait</p>
              <p className="text-xs text-[#1A1A1A]/50 mt-1">ou remboursé</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="text-center p-6 bg-[#EAE5D9] rounded-xl border border-[#1A1A1A]/[0.06] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-center mb-3 text-[#1A1A1A]">
                <Lock />
              </div>
              <p className="text-sm font-medium text-[#1A1A1A]">Paiement sécurisé</p>
              <p className="text-xs text-[#1A1A1A]/50 mt-1">SSL & cryptage</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="text-center p-6 bg-[#EAE5D9] rounded-xl border border-[#1A1A1A]/[0.06] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-center mb-3 text-[#1A1A1A]">
                <Lightning />
              </div>
              <p className="text-sm font-medium text-[#1A1A1A]">Livraison rapide</p>
              <p className="text-xs text-[#1A1A1A]/50 mt-1">2-4 semaines</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="text-center p-6 bg-[#EAE5D9] rounded-xl border border-[#1A1A1A]/[0.06] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-center mb-3 text-[#1A1A1A]">
                <Chat />
              </div>
              <p className="text-sm font-medium text-[#1A1A1A]">Support 24/7</p>
              <p className="text-xs text-[#1A1A1A]/50 mt-1">Toujours disponible</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ===========================================
   CONTACT
   =========================================== */
function Contact({ selectedPlan }: { selectedPlan?: { name: string; price: string } | null }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [focus, setFocus] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const appliedPlanRef = useRef('')

  // Auto-fill message when a plan is selected
  useEffect(() => {
    if (selectedPlan && selectedPlan.name !== appliedPlanRef.current) {
      appliedPlanRef.current = selectedPlan.name
      setForm(prev => ({
        ...prev,
        message: `Bonjour, je suis intéressé(e) par le forfait ${selectedPlan.name} à ${selectedPlan.price} DT. Merci de me contacter pour plus de détails.`,
      }))
    }
  }, [selectedPlan])

  const submitEmail = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          plan: selectedPlan?.name,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({ type: 'success', message: 'Message envoyé avec succès!' })
        setForm({ name: '', email: '', message: '' })
        trackConversion('contact', { method: 'email', plan: selectedPlan?.name })
      } else {
        setStatus({ type: 'error', message: data.error || 'Erreur lors de l\'envoi' })
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Erreur de connexion' })
    } finally {
      setLoading(false)
    }
  }

  const submitWhatsApp = (e: FormEvent) => {
    e.preventDefault()
    trackConversion('whatsapp_click', { source: 'contact_form' })
    window.open(`https://wa.me/${siteConfig.phoneRaw}?text=Bonjour, je suis ${form.name}. ${form.message}`, '_blank')
  }

  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.2em] text-[#1A1A1A]/40 mb-3 font-medium">Contact</p>
          <h2 className="text-3xl lg:text-4xl font-medium text-[#1A1A1A] mb-4 tracking-[-0.02em]">Parlons de votre projet</h2>
          <p className="text-[#1A1A1A]/50 mb-8">Réponse sous 24h avec devis personnalisé.</p>

          <a
            href={`https://wa.me/${siteConfig.phoneRaw}`}
            target="_blank"
            className="inline-flex items-center gap-3 px-6 py-4 bg-[#1A1A1A] text-white rounded-xl hover:bg-[#1A1A1A]/85 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <WhatsApp />
            <div>
              <p className="text-sm font-medium">WhatsApp</p>
              <p className="text-xs text-white/70">{siteConfig.phone}</p>
            </div>
          </a>
        </Reveal>

        <Reveal>
          <form onSubmit={submitEmail} className="bg-[#EAE5D9] p-8 rounded-2xl border border-[#1A1A1A]/[0.06]">
            {status && (
              <div className={`mb-5 p-4 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {status.message}
              </div>
            )}

            {['name', 'email'].map(field => (
              <div key={field} className="relative mb-5">
                <label
                  className="absolute left-4 transition-all duration-300 pointer-events-none"
                  style={{
                    top: focus === field || form[field as keyof typeof form] ? 6 : 14,
                    fontSize: focus === field || form[field as keyof typeof form] ? 10 : 14,
                    color: focus === field ? '#1A1A1A' : 'rgba(25,25,24,0.4)',
                  }}
                >
                  {field === 'name' ? 'Nom' : 'Email'}
                </label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  required
                  disabled={loading}
                  className="w-full px-4 pt-6 pb-2 rounded-lg bg-[#F4F0EB] border border-[#1A1A1A]/[0.08] outline-none text-sm focus:border-[#1A1A1A]/30 focus:bg-[#F4F0EB] transition-all duration-300 disabled:opacity-50"
                  value={form[field as keyof typeof form]}
                  onChange={e => setForm({ ...form, [field]: e.target.value })}
                  onFocus={() => setFocus(field)}
                  onBlur={() => setFocus('')}
                />
              </div>
            ))}

            <div className="relative mb-5">
              <label
                className="absolute left-4 transition-all duration-300 pointer-events-none"
                style={{
                  top: focus === 'message' || form.message ? 6 : 14,
                  fontSize: focus === 'message' || form.message ? 10 : 14,
                  color: focus === 'message' ? '#1A1A1A' : 'rgba(25,25,24,0.4)',
                }}
              >
                Message
              </label>
              <textarea
                required
                rows={4}
                disabled={loading}
                className="w-full px-4 pt-6 pb-2 rounded-lg bg-[#F4F0EB] border border-[#1A1A1A]/[0.08] outline-none text-sm resize-none focus:border-[#1A1A1A]/30 focus:bg-[#F4F0EB] transition-all duration-300 disabled:opacity-50"
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                onFocus={() => setFocus('message')}
                onBlur={() => setFocus('')}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-[#1A1A1A] text-white text-sm font-medium rounded-lg hover:bg-[#1A1A1A]/90 active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Envoi...' : 'Envoyer par Email'}
              </button>
              <button
                type="button"
                onClick={submitWhatsApp}
                disabled={loading}
                className="px-4 py-3 bg-[#25D366] text-white text-sm font-medium rounded-lg hover:bg-[#25D366]/90 active:scale-[0.99] transition-all duration-300 disabled:opacity-50"
                title="Envoyer via WhatsApp"
              >
                <WhatsApp />
              </button>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  )
}

/* ===========================================
   FOOTER
   =========================================== */
function Footer() {
  return (
    <footer className="py-16 px-6 bg-[#1A1A1A] text-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#C96442] font-light text-2xl">|</span>
              <span className="font-bold text-xl tracking-[0.06em]">DIGITN</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Agence web tunisienne spécialisée dans la création de sites performants et solutions digitales.
            </p>
            <div className="flex gap-4">
              <a href={siteConfig.social.facebook} target="_blank" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-300">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href={siteConfig.social.instagram} target="_blank" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-300">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href={siteConfig.social.linkedin} target="_blank" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-300">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#services" className="text-white/60 hover:text-white transition-colors duration-300">Services</a></li>
              <li><a href="#portfolio" className="text-white/60 hover:text-white transition-colors duration-300">Portfolio</a></li>
              <li><a href="#tarifs" className="text-white/60 hover:text-white transition-colors duration-300">Tarifs</a></li>
              <li><a href="#contact" className="text-white/60 hover:text-white transition-colors duration-300">Contact</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h3>
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
          <p>&copy; 2026 DIGITN. Tous droits réservés.</p>
          <div className="flex gap-6">
            <a href="/mentions-legales" className="hover:text-white/60 transition-colors duration-300">Mentions légales</a>
            <a href="/politique-confidentialite" className="hover:text-white/60 transition-colors duration-300">Politique de confidentialité</a>
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
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string } | null>(null)

  return (
    <main>
      <Navbar />
      <Hero />
      <GlobeMap />
      <Services />
      <Portfolio />
      <Pricing onSelectPlan={setSelectedPlan} />
      <Testimonials />
      <Contact selectedPlan={selectedPlan} />
      <Footer />

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${siteConfig.phoneRaw}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-[#1A1A1A] text-white rounded-full shadow-lg shadow-[#1A1A1A]/20 hover:shadow-xl hover:shadow-[#1A1A1A]/30 hover:-translate-y-1 active:scale-95 transition-all duration-300 group"
        style={{ animation: 'float 3s ease-in-out infinite' }}
        aria-label="Contactez-nous sur WhatsApp"
      >
        <WhatsApp />
        <span className="text-sm font-medium hidden sm:inline">WhatsApp</span>
      </a>
    </main>
  )
}
