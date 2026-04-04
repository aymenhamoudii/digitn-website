import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';

export default function Hero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollDown = () => {
    const storySection = document.querySelector('#story');
    if (storySection) {
      storySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image with Parallax */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      >
        <div 
          className="absolute inset-0 w-full h-[120%] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop')`,
          }}
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/70 via-charcoal-950/50 to-charcoal-950/90" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <ScrollReveal delay={200}>
            <p className="text-gold-400 text-sm tracking-[0.4em] uppercase mb-6 font-medium">
              Est. 1995
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay={400}>
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-cream-50 font-semibold leading-[0.95] mb-6">
              La Maison
              <span className="block text-gradient-gold">d'Or</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={600}>
            <p className="text-cream-200 text-lg sm:text-xl md:text-2xl font-light tracking-wide mb-4">
              Where rustic tradition meets culinary excellence
            </p>
          </ScrollReveal>

          <ScrollReveal delay={800}>
            <p className="text-cream-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Experience an intimate journey through time-honored recipes,
              artisan craftsmanship, and the finest local ingredients 
              in the heart of wine country.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={1000}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#reservation"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#reservation').scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative px-8 py-4 bg-gold-600 text-charcoal-950 font-medium tracking-wide rounded-sm overflow-hidden transition-all duration-300 hover:shadow-gold"
              >
                <span className="relative z-10">Reserve a Table</span>
                <div className="absolute inset-0 bg-gold-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
              <a
                href="#menu"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#menu').scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 border-2 border-cream-300 text-cream-200 font-medium tracking-wide rounded-sm hover:border-gold-400 hover:text-gold-400 transition-all duration-300"
              >
                View Our Menu
              </a>
            </div>
          </ScrollReveal>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={handleScrollDown}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-cream-400 hover:text-gold-400 transition-colors cursor-pointer animate-bounce"
          aria-label="Scroll to content"
        >
          <ChevronDown size={32} />
        </button>
      </div>
    </div>
  );
}
