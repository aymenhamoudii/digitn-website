import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MenuShowcase from './components/MenuShowcase';
import OurStory from './components/OurStory';
import ChefIntro from './components/ChefIntro';
import Gallery from './components/Gallery';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';

function App() {
  return (
    <div className="relative w-full bg-beige min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <OurStory />
        <MenuShowcase />
        <ChefIntro />
        <Gallery />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}

export default App;