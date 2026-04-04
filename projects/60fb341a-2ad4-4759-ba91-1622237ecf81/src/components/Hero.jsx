import React, { useEffect, useRef } from 'react';

const Hero = () => {
  const titleRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    // Animate title reveal
    setTimeout(() => {
      if (titleRef.current) {
        titleRef.current.style.opacity = '1';
        titleRef.current.style.transform = 'translateY(0)';
      }
    }, 300);

    // Parallax effect for hero layers
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth - 0.5) * 20;
      const yPos = (clientY / window.innerHeight - 0.5) * 20;
      
      if (heroRef.current) {
        heroRef.current.style.transform = `perspective(1000px) rotateX(${yPos}deg) rotateY(${-xPos}deg)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen overflow-hidden bg-cinematic-black"
      style={{ perspective: '1000px' }}
    >
      {/* Background layers with parallax */}
      <div 
        className="absolute inset-0 parallax-layer"
        data-depth="0.2"
        style={{
          background: 'linear-gradient(135deg, rgba(5,5,5,0.95) 0%, rgba(18,18,18,0.85) 100%)',
        }}
      />
      
      <div 
        className="absolute inset-0 parallax-layer"
        data-depth="0.4"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(192,192,192,0.1) 0%, transparent 50%), 
                          radial-gradient(circle at 80% 20%, rgba(229,229,229,0.05) 0%, transparent 50%)`,
        }}
      />
      
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 parallax-layer"
        data-depth="0.6"
        style={{
          backgroundImage: `linear-gradient(rgba(192,192,192,0.03) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(192,192,192,0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 container-cinematic h-screen flex flex-col justify-center items-center">
        {/* Restaurant branding */}
        <div className="text-center mb-12">
          <h1 
            ref={titleRef}
            className="text-gradient-silver font-black tracking-tighter mb-4 opacity-0 transition-all duration-1000"
            style={{ transform: 'translateY(50px)' }}
          >
            ÉCLAT
          </h1>
          <p className="text-cinematic-silver-primary text-lg md:text-xl font-light tracking-widest uppercase mb-8 animate-reveal">
            CULINARY EXCELLENCE SINCE 2012
          </p>
        </div>

        {/* Animated divider */}
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-cinematic-silver-primary to-transparent mb-12 animate-glow" />

        {/* Hero text */}
        <div className="max-w-3xl text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-cinematic-white mb-6 animate-reveal">
            Where Silver Refinement Meets<br />
            <span className="text-gradient-silver">Culinary Innovation</span>
          </h2>
          <p className="text-lg md:text-xl text-cinematic-silver-primary leading-relaxed animate-reveal" style={{ animationDelay: '0.3s' }}>
            Experience Michelin-starred dining in an immersive 3D environment. 
            Our chef's table offers a panoramic view of culinary artistry in motion.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 mb-12">
          <button className="btn-primary group">
            <span className="flex items-center gap-3">
              Reserve Your Table
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>
          <button className="btn-secondary group">
            <span className="flex items-center gap-3">
              View Signature Menu
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="scroll-indicator animate-bounce" />
          <p className="text-cinematic-silver-dark text-sm mt-4 tracking-wider">SCROLL TO EXPLORE</p>
        </div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-1/4 left-10 w-32 h-32 border border-cinematic-silver-primary/20 rounded-full animate-float" />
      <div className="absolute bottom-1/4 right-10 w-48 h-48 border border-cinematic-silver-primary/10 rounded-full animate-float" style={{ animationDelay: '2s' }} />
      
      {/* Lighting effects */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-cinematic-silver-primary/5 to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-cinematic-silver-primary/3 to-transparent blur-3xl" />
    </section>
  );
};

export default Hero;