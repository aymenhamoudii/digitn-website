import React from 'react';

function AboutSection() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-12 gap-16 items-center">
          {/* Text content */}
          <div className="md:col-span-7">
            <span className="uppercase text-terracotta text-sm font-medium tracking-[1px]">Our story</span>
            <h2 className="section-header font-serif text-5xl md:text-6xl text-neutral-dark mt-3 mb-8 leading-none">
              From Florence, with love
            </h2>
            <div className="prose prose-neutral text-lg max-w-none">
              <p className="text-neutral">
                Bella Vista was born from Chef Maria Rossi’s childhood memories of her grandmother’s kitchen in the hills of Chianti. Every dish tells a story — of sun-ripened tomatoes picked at dawn, olive oil pressed by hand, and the quiet joy of gathering around the table.
              </p>
              <p className="text-neutral">
                Located in the heart of Florence’s historic Oltrarno district, we honor tradition while embracing the present. Our menu changes with the seasons. Our wine cellar holds treasures from small Tuscan producers. And our team treats every guest like family.
              </p>
            </div>
            
            <div className="flex items-center gap-x-8 mt-12">
              <div className="text-center">
                <div className="text-5xl font-serif text-terracotta">7</div>
                <div className="text-xs uppercase tracking-widest text-neutral">Years</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-serif text-terracotta">42</div>
                <div className="text-xs uppercase tracking-widest text-neutral">Signature dishes</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-serif text-terracotta">98%</div>
                <div className="text-xs uppercase tracking-widest text-neutral">Return rate</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="md:col-span-5">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://picsum.photos/id/1016/800/800" 
                alt="Chef Maria Rossi in the kitchen"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-xs text-neutral/60 text-center mt-4">
              Chef Maria Rossi • Head Chef &amp; Owner
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
