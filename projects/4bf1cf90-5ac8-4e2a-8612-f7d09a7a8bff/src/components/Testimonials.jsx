import React, { useState, useEffect } from 'react';

function Testimonials() {
  const [current, setCurrent] = useState(0);

  const testimonials = [
    {
      quote: "The most authentic Tuscan dining experience outside of Italy. The osso buco melted in my mouth. We’ve been back three times this month.",
      name: "Elena Moretti",
      role: "Food Critic, La Repubblica",
      rating: 5
    },
    {
      quote: "Chef Maria’s burrata is life-changing. Paired with their house Negroni, it’s pure perfection. The service feels like family.",
      name: "James Laurent",
      role: "Travel Editor, Condé Nast",
      rating: 5
    },
    {
      quote: "Celebrated our anniversary here. The private terrace view of the Duomo at sunset with the tasting menu was unforgettable.",
      name: "Sophie & Marco Bianchi",
      role: "Anniversary guests",
      rating: 5
    },
    {
      quote: "Best panna cotta I’ve ever had in my life. The wine list is perfectly curated. Can’t wait to return.",
      name: "Luca Rossi",
      role: "Local Florentine",
      rating: 5
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-xl mx-auto text-center mb-16">
          <span className="uppercase text-terracotta text-sm font-medium tracking-[1px]">Voices from our table</span>
          <h2 className="section-header font-serif text-5xl md:text-6xl text-neutral-dark mt-2 mb-4">
            What Our Guests Say
          </h2>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-10 md:p-14 relative">
            {/* Quote */}
            <div className="text-7xl text-terracotta/10 absolute top-8 left-8 font-serif">“</div>
            
            <p className="text-2xl leading-tight text-neutral-dark font-light italic mb-8">
              {testimonials[current].quote}
            </p>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-neutral-dark">{testimonials[current].name}</div>
                <div className="text-sm text-neutral/70">{testimonials[current].role}</div>
              </div>
              
              {/* Stars */}
              <div className="flex text-terracotta">
                {Array(5).fill(0).map((_, i) => (
                  <span key={i} className="text-2xl">★</span>
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center items-center gap-x-8 mt-10">
            <button
              onClick={prevTestimonial}
              className="w-12 h-12 flex items-center justify-center border border-neutral/20 hover:border-terracotta rounded-2xl transition-colors text-neutral-dark"
              aria-label="Previous testimonial"
            >
              ←
            </button>
            <div className="flex gap-x-3">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === current ? 'bg-terracotta scale-125' : 'bg-neutral/30 hover:bg-neutral/50'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextTestimonial}
              className="w-12 h-12 flex items-center justify-center border border-neutral/20 hover:border-terracotta rounded-2xl transition-colors text-neutral-dark"
              aria-label="Next testimonial"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
