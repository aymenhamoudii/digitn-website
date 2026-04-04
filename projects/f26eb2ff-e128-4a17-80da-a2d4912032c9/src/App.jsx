import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProjectGrid from './components/ProjectGrid';
import Experience from './components/Experience';
import Blog from './components/Blog';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  useEffect(() => {
    // Custom scroll behavior for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
        });
      });
    });
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <section id="projects">
          <ProjectGrid />
        </section>
        <section id="experience" className="bg-earth-sand/10 border-y-4 border-earth-ink">
          <Experience />
        </section>
        <section id="blog">
          <Blog />
        </section>
        <section id="contact" className="bg-earth-stone text-white border-t-4 border-earth-ink">
          <Contact />
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default App;
