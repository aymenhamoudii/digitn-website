import React from 'react';

const Hero = () => {
  return (
    <section className="relative bg-[url('/hero-bg.jpg')] bg-cover bg-center h-[60vh] sm:h-[80vh] flex items-center justify-center text-center overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-neutral-900/60"></div>
      {/* Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl font-display text-neutral-50 mb-4">
          Exquisite Culinary Journeys
        </h1>
        <p className="text-xl sm:text-2xl font-body text-neutral-300 mb-6 max-w-xl">
          Indulge in a symphony of flavors crafted with passion and precision. 
          Our vibrant duotone palette reflects the energy and sophistication of our menu.
        </p>
        <button 
          className="bg-primary-500 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-600 transition-colors transform hover:-translate-y-1 shadow-md"
        >
          Make a Reservation
        </button>
      </div>
    </section>
  );
};

export default Hero;