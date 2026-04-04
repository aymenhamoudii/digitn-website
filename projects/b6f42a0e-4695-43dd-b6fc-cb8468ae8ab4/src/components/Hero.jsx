import { useEffect, useRef } from 'react'

export default function Hero() {
  const heroRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.scrollY
        const rate = scrolled * 0.4
        heroRef.current.style.transform = `translateY(${rate}px)`
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax */}
      <div
        ref={heroRef}
        className="absolute inset-0 z-0"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80')`,
          }}
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/70 via-charcoal-950/50 to-charcoal-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950/60 via-transparent to-charcoal-950/60" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-8 w-px h-32 bg-gradient-to-b from-transparent via-bronze-500/30 to-transparent hidden lg:block" />
      <div className="absolute top-1/3 right-8 w-px h-48 bg-gradient-to-b from-transparent via-bronze-500/20 to-transparent hidden lg:block" />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
      >
        {/* Decorative Line */}
        <div className="w-16 h-px bg-bronze-500 mx-auto mb-8 animate-fade-in" />

        {/* Tagline */}
        <p className="text-bronze-300 text-sm md:text-base uppercase tracking-[0.3em] mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Fine Dining Experience
        </p>

        {/* Restaurant Name */}
        <h1 className="font-display text-display-md text-cream-50 mb-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          Ember<span className="text-bronze-400">Room</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-cream-200/80 font-body max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          Where contemporary American cuisine meets rustic elegance. 
          An intimate setting for unforgettable culinary journeys.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <a href="#menu" className="btn-primary">
            View Menu
          </a>
          <a href="#contact" className="btn-secondary">
            Reserve a Table
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: '1.2s' }}>
        <span className="text-xs uppercase tracking-[0.2em] text-cream-300/60">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-bronze-500 to-transparent" />
      </div>
    </section>
  )
}