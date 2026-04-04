import React, { useState, useEffect } from 'react';
import Timeline from './Timeline';
import { getChefBio, getChefTimeline, getChefQuotes } from '../data/demoData';

const ChefStory = () => {
  const [bio, setBio] = useState({});
  const [timeline, setTimeline] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [activeQuote, setActiveQuote] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const chefBio = getChefBio();
      const chefTimeline = getChefTimeline();
      const chefQuotes = getChefQuotes();
      setBio(chefBio);
      setTimeline(chefTimeline);
      setQuotes(chefQuotes);
    };
    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuote((prev) => (prev + 1) % quotes.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [quotes.length]);

  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Chef portrait and bio */}
        <div className="relative">
          {/* Portrait container */}
          <div className="relative mb-8">
            {/* Decorative frame */}
            <div className="absolute inset-0 border-2 border-cinematic-silver-primary/30 rounded-3xl transform rotate-3" />
            <div className="absolute inset-4 border border-cinematic-silver-primary/20 rounded-2xl transform -rotate-1" />
            
            {/* Portrait placeholder */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-cinematic-black-light to-cinematic-silver-dark/30 aspect-[3/4]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-4">👨‍🍳</div>
                  <h3 className="text-2xl font-bold text-cinematic-white">{bio.name}</h3>
                  <p className="text-cinematic-silver-primary">{bio.title}</p>
                </div>
              </div>
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-cinematic-black/60 via-transparent to-transparent" />
            </div>
            
            {/* Floating accolades */}
            <div className="absolute -bottom-6 -right-6 bg-cinematic-black-light border border-cinematic-silver-primary/20 rounded-xl p-4 shadow-xl">
              <div className="text-3xl text-cinematic-silver-accent font-bold">{bio.michelinStars}</div>
              <div className="text-sm text-cinematic-silver-primary">Michelin Stars</div>
            </div>
          </div>

          {/* Biography */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-black text-cinematic-white">
              The <span className="text-gradient-silver">Artisan</span> Behind<br />
              The Experience
            </h2>
            
            <div className="space-y-4">
              {bio.description?.map((paragraph, index) => (
                <p 
                  key={index}
                  className="text-cinematic-silver-primary leading-relaxed animate-reveal"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Signature philosophy */}
            <div className="mt-8 p-6 bg-gradient-to-br from-cinematic-black-light to-cinematic-silver-dark/10 rounded-2xl border border-cinematic-silver-primary/20">
              <h4 className="text-xl font-bold text-cinematic-white mb-3">Culinary Philosophy</h4>
              <p className="text-cinematic-silver-primary italic">"{bio.philosophy}"</p>
            </div>
          </div>
        </div>

        {/* Timeline and quotes */}
        <div className="space-y-12">
          {/* Career timeline */}
          <div>
            <h3 className="text-3xl font-bold text-cinematic-white mb-8">
              <span className="text-gradient-silver">Career</span> Journey
            </h3>
            <Timeline events={timeline} />
          </div>

          {/* Quote carousel */}
          <div className="relative">
            <h3 className="text-3xl font-bold text-cinematic-white mb-6">
              In Their <span className="text-gradient-silver">Words</span>
            </h3>
            
            <div className="relative min-h-[200px]">
              {quotes.map((quote, index) => (
                <div
                  key={quote.id}
                  className={`absolute inset-0 transition-all duration-500 ${
                    index === activeQuote
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4 pointer-events-none'
                  }`}
                >
                  <div className="bg-gradient-to-br from-cinematic-black-light to-cinematic-silver-dark/10 rounded-2xl p-8 border border-cinematic-silver-primary/20">
                    <div className="text-5xl text-cinematic-silver-accent mb-4">"</div>
                    <p className="text-lg text-cinematic-silver-primary mb-6">{quote.text}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-cinematic-white font-semibold">{quote.context}</p>
                        <p className="text-sm text-cinematic-silver-dark">{quote.source}</p>
                      </div>
                      <div className="text-5xl text-cinematic-silver-accent">"</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quote navigation */}
            <div className="flex justify-center gap-3 mt-8">
              {quotes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveQuote(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeQuote
                      ? 'bg-cinematic-silver-accent scale-125'
                      : 'bg-cinematic-silver-primary/30 hover:bg-cinematic-silver-primary/50'
                  }`}
                  aria-label={`View quote ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 -left-20 w-64 h-64 border border-cinematic-silver-primary/10 rounded-full opacity-20" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 border border-cinematic-silver-primary/5 rounded-full opacity-20" />
      
      {/* Animated silver accents */}
      <div className="absolute top-1/3 right-1/4 w-32 h-px bg-gradient-to-r from-transparent via-cinematic-silver-primary to-transparent animate-pulse" />
      <div className="absolute bottom-1/4 left-1/3 w-px h-32 bg-gradient-to-b from-transparent via-cinematic-silver-primary to-transparent animate-pulse" />
    </div>
  );
};

export default ChefStory;