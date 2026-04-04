import React from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import MenuSection from './components/MenuSection.jsx';
import AboutSection from './components/AboutSection.jsx';
import Testimonials from './components/Testimonials.jsx';
import ReservationForm from './components/ReservationForm.jsx';
import Footer from './components/Footer.jsx';
import initDemoData from './data/demoData.js';

function App() {
  // Trigger demo seeding on mount (auto-runs via module import + flag)
  React.useEffect(() => {
    initDemoData();
  }, []);

  return (
    <div className="min-h-screen bg-cream font-sans text-neutral-dark">
      <Navbar />
      <Hero />
      <MenuSection />
      <AboutSection />
      <Testimonials />
      <ReservationForm />
      <Footer />
    </div>
  );
}

export default App;
