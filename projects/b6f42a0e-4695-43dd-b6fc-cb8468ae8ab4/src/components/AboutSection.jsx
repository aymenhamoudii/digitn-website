import { useEffect, useRef } from 'react'

export default function AboutSection() {
  const sectionRef = useRef(null)
  const imageRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active')
          }
        })
      },
      { threshold: 0.1 }
    )

    const revealElements = sectionRef.current?.querySelectorAll('.reveal')
    revealElements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect()
        const scrolled = window.scrollY
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const rate = (window.innerHeight - rect.top) * 0.1
          imageRef.current.style.transform = `translateY(${rate}px)`
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section
      id="about"
      ref={sectionRef}
      className="section-padding bg-charcoal-900 overflow-hidden"
    >
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Images Column */}
          <div className="relative reveal" ref={imageRef}>
            {/* Main Image */}
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=80"
                alt="Chef preparing an elegant dish"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
            </div>
            
            {/* Floating Secondary Image */}
            <div className="absolute -bottom-8 -right-4 md:right-8 w-40 md:w-56 aspect-square overflow-hidden shadow-2xl hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=600&q=80"
                alt="Restaurant interior detail"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
            </div>

            {/* Decorative Frame */}
            <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-bronze-500/30 hidden lg:block" />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-bronze-500/30 hidden lg:block" />
          </div>

          {/* Content Column */}
          <div className="lg:pl-8">
            <div className="reveal">
              <p className="text-bronze-400 text-sm uppercase tracking-[0.3em] mb-4">
                Our Story
              </p>
              <h2 className="font-display text-display-sm text-cream-50 mb-8">
                A Passion for <br />
                <span className="text-bronze-300">Excellence</span>
              </h2>
            </div>

            <div className="space-y-6 text-cream-200/70 leading-relaxed">
              <p className="reveal" style={{ animationDelay: '0.1s' }}>
                Founded in 2015, <strong className="text-cream-100 font-medium">Ember Room</strong> was born from a simple belief: 
                that dining should be an experience that ignites all the senses. 
                Our name reflects our philosophy—warmth, transformation, and the 
                magic that happens when passion meets craft.
              </p>

              <p className="reveal" style={{ animationDelay: '0.2s' }}>
                Executive Chef <strong className="text-cream-100">Marcus Chen</strong> brings over two decades of experience 
                from Michelin-starred kitchens across New York, Paris, and Tokyo. 
                His approach combines classical French techniques with bold American 
                flavors, always emphasizing seasonal, locally-sourced ingredients.
              </p>

              <p className="reveal" style={{ animationDelay: '0.3s' }}>
                Every dish that leaves our kitchen tells a story—of the farmers who 
                grew the vegetables, the artisans who crafted our tableware, and 
                the moments you'll share with loved ones around our table.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-charcoal-700 reveal" style={{ animationDelay: '0.4s' }}>
              <div className="text-center">
                <p className="font-display text-3xl md:text-4xl text-bronze-400">15+</p>
                <p className="text-cream-300/60 text-sm mt-1">Years</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl md:text-4xl text-bronze-400">2</p>
                <p className="text-cream-300/60 text-sm mt-1">Michelin Stars</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl md:text-4xl text-bronze-400">50k</p>
                <p className="text-cream-300/60 text-sm mt-1">Guests/Year</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}