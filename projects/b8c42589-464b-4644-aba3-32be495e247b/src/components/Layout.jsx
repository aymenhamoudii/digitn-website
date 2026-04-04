import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from './Navigation';
import { ChevronUp } from 'lucide-react';

const Layout = ({ children }) => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen concrete-texture overflow-hidden">
      {/* Navigation */}
      <Navigation />
      
      {/* Main content */}
      <main className="pt-16">
        {children}
      </main>
      
      {/* Back to top button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: showBackToTop ? 1 : 0,
          y: showBackToTop ? 0 : 20
        }}
        transition={{ duration: 0.3 }}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 z-50 p-3 bg-terracotta-500 text-white rounded-full shadow-xl hover:shadow-2xl hover:bg-terracotta-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:ring-offset-2"
        aria-label="Back to top"
      >
        <ChevronUp className="w-6 h-6" />
      </motion.button>
      
      {/* Ambient lighting effects */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-brass-500 rounded-full blur-3xl opacity-5 animate-float"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-terracotta-500 rounded-full blur-3xl opacity-5 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-concrete-300 rounded-full blur-3xl opacity-10 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
    </div>
  );
};

export default Layout;