import React, { useEffect } from 'react';
import Hero from './components/Hero';
import MenuPreview from './components/MenuPreview';
import ChefStory from './components/ChefStory';
import Gallery from './components/Gallery';
import BookingForm from './components/BookingForm';
import Footer from './components/Footer';
import { initDemoData } from './data/demoData';

function App() {
  useEffect(() => {
    // Initialize demo data on first load
    initDemoData();
    
    // Initialize scroll animations
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax-layer');
      
      parallaxElements.forEach(element => {
        const depth = parseFloat(element.getAttribute('data-depth')) || 0.5;
        const yPos = -(scrolled * depth);
        element.style.transform = `translate3d(0, ${yPos}px, 0)`;
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-cinematic-black">
      <Hero />
      
      <main>
        <section id="menu" className="section-spacing">
          <div className="container-cinematic">
            <MenuPreview />
          </div>
        </section>
        
        <section id="chef" className="section-spacing bg-cinematic-black-light">
          <div className="container-cinematic">
            <ChefStory />
          </div>
        </section>
        
        <section id="gallery" className="section-spacing">
          <div className="container-cinematic">
            <Gallery />
          </div>
        </section>
        
        <section id="booking" className="section-spacing bg-cinematic-black-light">
          <div className="container-cinematic">
            <BookingForm />
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;