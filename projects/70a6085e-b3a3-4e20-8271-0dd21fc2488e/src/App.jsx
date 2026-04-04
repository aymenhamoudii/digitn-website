import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import About from './components/About';
import Menu from './components/Menu';
import Gallery from './components/Gallery';
import Testimonials from './components/Testimonials';
import ContactDetails from './components/ContactDetails';
import LocationMap from './components/LocationMap';

function App() {
  return (
    <div className="relative min-h-screen bg-obsidian">
      <Navbar />
      
      <main>
        <Hero />
        <About />
        <Menu />
        <Gallery />
        <Testimonials />
        <section id="location" className="bg-obsidian-lighter">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">
            <div className="lg:w-1/2">
              <ContactDetails />
            </div>
            <div className="lg:w-1/2 h-[500px] lg:h-auto min-h-[400px]">
              <LocationMap />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;