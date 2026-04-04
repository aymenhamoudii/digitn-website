import React, { useState } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight } from './Icons';

const testimonials = [
  {
    name: "Eleanor Vance",
    role: "Culinary Critic",
    quote: "L'Essence isn't just a bistro; it's a sensory journey. The truffle pasta is absolute perfection.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
  },
  {
    name: "James Sterling",
    role: "Local Gastronomer",
    quote: "The atmosphere here is unmatched. It feels like a private escape in the heart of the city.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
  },
  {
    name: "Sophie Chen",
    role: "Wine Sommelier",
    quote: "Their cellar selection is curated with such precision. Every pairing was a masterclass.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200"
  }
];

const Testimonials = () => {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((current + 1) % testimonials.length);
  const prev = () => setCurrent((current - 1 + testimonials.length) % testimonials.length);

  return (
    <section id="testimonials" className="relative py-24 bg-charcoal-lighter/30 rounded-3xl overflow-hidden border border-white/5">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold/5 via-transparent to-transparent" />
      
      <div className="max-w-4xl mx-auto px-8 relative">
        <div className="flex flex-col items-center text-center space-y-12">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-gold">
            <Quote size={32} />
          </div>

          <div className="space-y-8 animate-fade-in" key={current}>
            <p className="text-2xl md:text-3xl font-serif leading-relaxed italic">
              "{testimonials[current].quote}"
            </p>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gold/20 shadow-xl">
                <img src={testimonials[current].avatar} alt={testimonials[current].name} className="w-full h-full object-cover" />
              </div>
              <div className="text-center">
                <h4 className="text-xl font-bold font-serif">{testimonials[current].name}</h4>
                <p className="text-gold text-sm font-semibold uppercase tracking-widest">{testimonials[current].role}</p>
              </div>
              <div className="flex gap-1 text-gold">
                {[...Array(testimonials[current].rating)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-12">
            <button 
              onClick={prev}
              className="p-3 rounded-full border border-white/10 hover:border-gold hover:text-gold transition-all"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex gap-3">
              {testimonials.map((_, i) => (
                <div 
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-gold w-8' : 'bg-white/20'}`}
                />
              ))}
            </div>
            <button 
              onClick={next}
              className="p-3 rounded-full border border-white/10 hover:border-gold hover:text-gold transition-all"
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
