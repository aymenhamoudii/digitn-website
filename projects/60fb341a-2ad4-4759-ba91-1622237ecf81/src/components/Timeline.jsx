import React, { useEffect, useRef, useState } from 'react';

const Timeline = ({ events = [] }) => {
  const timelineRef = useRef(null);
  const [visibleEvents, setVisibleEvents] = useState([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setVisibleEvents((prev) => {
              if (!prev.includes(index)) {
                return [...prev, index].sort((a, b) => a - b);
              }
              return prev;
            });
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px',
      }
    );

    const eventElements = timelineRef.current?.querySelectorAll('.timeline-event');
    eventElements?.forEach((element) => observer.observe(element));

    return () => {
      eventElements?.forEach((element) => observer.unobserve(element));
    };
  }, [events.length]);

  return (
    <div ref={timelineRef} className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cinematic-silver-primary/30 via-cinematic-silver-primary/20 to-transparent md:left-1/2 md:-translate-x-1/2" />

      {/* Events */}
      <div className="space-y-12">
        {events.map((event, index) => {
          const isVisible = visibleEvents.includes(index);
          const isEven = index % 2 === 0;

          return (
            <div
              key={event.id}
              data-index={index}
              className={`timeline-event relative flex flex-col md:flex-row md:items-center ${
                isEven ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Timeline node */}
              <div className="absolute left-6 top-6 w-4 h-4 md:left-1/2 md:-translate-x-1/2">
                <div className={`absolute inset-0 rounded-full transition-all duration-700 ${
                  isVisible
                    ? 'bg-cinematic-silver-accent scale-100'
                    : 'bg-cinematic-silver-primary/30 scale-50'
                }`} />
                <div className={`absolute inset-0 rounded-full border-2 transition-all duration-1000 ${
                  isVisible
                    ? 'border-cinematic-silver-primary/50 scale-150 opacity-0'
                    : 'border-transparent'
                }`} />
              </div>

              {/* Event content */}
              <div
                className={`ml-12 md:ml-0 md:w-1/2 transition-all duration-700 transform ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                } ${
                  isEven ? 'md:pr-12' : 'md:pl-12'
                }`}
              >
                <div className="glass-silver rounded-xl p-6 border border-cinematic-silver-primary/20 hover:border-cinematic-silver-primary/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-cinematic-silver-accent font-display font-bold text-sm tracking-widest uppercase">
                      {event.year}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-cinematic-silver-primary/10 text-cinematic-silver-primary">
                      {event.type}
                    </span>
                  </div>
                  
                  <h4 className="text-xl font-bold text-cinematic-white mb-2">{event.title}</h4>
                  
                  <p className="text-cinematic-silver-primary mb-4">{event.description}</p>
                  
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-cinematic-silver-dark">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{event.location}</span>
                    </div>
                  )}
                  
                  {event.awards && event.awards.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-cinematic-silver-primary/10">
                      <div className="flex flex-wrap gap-2">
                        {event.awards.map((award, awardIndex) => (
                          <span
                            key={awardIndex}
                            className="px-2 py-1 text-xs font-medium rounded bg-cinematic-black-light text-cinematic-silver-accent border border-cinematic-silver-primary/20"
                          >
                            {award}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Empty spacer for alternating layout */}
              <div className="hidden md:block md:w-1/2" />
            </div>
          );
        })}
      </div>

      {/* Start/end indicators */}
      <div className="absolute -top-4 left-6 w-3 h-3 rounded-full bg-cinematic-silver-primary/50 md:left-1/2 md:-translate-x-1/2" />
      <div className="absolute -bottom-4 left-6 w-3 h-3 rounded-full bg-cinematic-silver-primary/50 md:left-1/2 md:-translate-x-1/2" />
    </div>
  );
};

export default Timeline;