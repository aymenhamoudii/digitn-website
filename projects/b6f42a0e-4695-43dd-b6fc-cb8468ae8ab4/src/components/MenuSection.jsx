import { useState, useEffect, useRef } from 'react'
import { menuCategories, menuItems } from '../data/menuData'

export default function MenuSection() {
  const [activeCategory, setActiveCategory] = useState('starters')
  const [visibleItems, setVisibleItems] = useState([])
  const sectionRef = useRef(null)

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
  }, [activeCategory])

  useEffect(() => {
    setVisibleItems([])
    const timer = setTimeout(() => {
      setVisibleItems(
        menuItems[activeCategory]?.map((_, index) => index) || []
      )
    }, 100)
    return () => clearTimeout(timer)
  }, [activeCategory])

  return (
    <section
      id="menu"
      ref={sectionRef}
      className="section-padding bg-charcoal-900"
    >
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16 reveal">
          <p className="text-bronze-400 text-sm uppercase tracking-[0.3em] mb-4">
            Culinary Excellence
          </p>
          <h2 className="font-display text-display-sm text-cream-50 mb-6">
            Our Menu
          </h2>
          <p className="text-cream-200/70 max-w-2xl mx-auto leading-relaxed">
            Each dish is crafted with seasonal ingredients, 
            sourced from local farms and artisan producers.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-16 reveal" style={{ animationDelay: '0.2s' }}>
          {menuCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 text-sm uppercase tracking-wider transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-bronze-500 text-charcoal-950'
                  : 'bg-charcoal-800 text-cream-200 hover:bg-charcoal-700 hover:text-cream-100'
              }`}
            >
              <span className="hidden sm:inline">{category.name}</span>
              <span className="sm:hidden">{category.label}</span>
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {menuItems[activeCategory]?.map((item, index) => (
            <div
              key={`${activeCategory}-${index}`}
              className={`reveal card-dark p-6 hover:border-bronze-500/30 transition-all duration-500 ${
                visibleItems.includes(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-display text-xl text-cream-50">
                  {item.name}
                </h3>
                <span className="text-bronze-400 font-body text-lg whitespace-nowrap">
                  {item.price}
                </span>
              </div>
              <p className="text-cream-200/60 text-sm leading-relaxed mb-4">
                {item.description}
              </p>
              {item.dietary.length > 0 && (
                <div className="flex gap-2">
                  {item.dietary.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs uppercase tracking-wider px-2 py-1 bg-bronze-500/10 text-bronze-300 border border-bronze-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-16 reveal">
          <p className="text-cream-300/50 text-sm">
            <span className="text-bronze-400">V</span> Vegetarian &nbsp;|&nbsp;{' '}
            <span className="text-bronze-400">GF</span> Gluten Free
          </p>
          <p className="text-cream-300/40 text-xs mt-4">
            Please inform your server of any allergies or dietary restrictions.
          </p>
        </div>
      </div>
    </section>
  )
}