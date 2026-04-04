import React from 'react';

const EXPERIENCE = [
  {
    period: "2021 — PRESENT",
    role: "LEAD ARCHITECT",
    company: "CLAY DESIGN SYSTEMS",
    desc: "Spearheading the development of organic design tokens and technical architecture for international clients.",
    tags: ["Systems", "Architecture", "Consultancy"]
  },
  {
    period: "2018 — 2021",
    role: "SENIOR FRONTEND DEV",
    company: "ROOT PROTOCOLS",
    desc: "Managed a team of 12 developers building high-performance decentralized finance interfaces.",
    tags: ["React", "Team Lead", "Product"]
  },
  {
    period: "2016 — 2018",
    role: "UI/UX DESIGNER",
    company: "SLATE STUDIO",
    desc: "Focused on bridging the gap between raw brutalist aesthetics and functional accessibility standards.",
    tags: ["Interface", "Figma", "Research"]
  }
];

const Experience = () => {
  return (
    <div className="section-container">
      <div className="flex flex-col md:flex-row gap-16 items-start">
        <div className="md:w-1/4">
          <h2 className="text-4xl md:text-5xl lg:text-6xl leading-none">PROFESSIONAL_ HISTORY</h2>
        </div>

        <div className="md:w-3/4 flex flex-col gap-12 relative">
          {/* Central vertical line */}
          <div className="absolute left-0 md:left-4 top-0 bottom-0 w-1 bg-earth-ink/20"></div>

          {EXPERIENCE.map((exp, index) => (
            <div key={index} className="relative pl-8 md:pl-16 group">
              {/* Dot on timeline */}
              <div className="absolute left-[-4px] md:left-[12px] top-2 w-3 h-3 bg-earth-clay brutal-border border-2 rotate-45 group-hover:scale-150 transition-transform"></div>
              
              <div className="bg-white brutal-border p-8 shadow-brutal transition-all group-hover:-translate-y-1">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <span className="font-mono text-xs font-bold text-earth-moss block mb-1">{exp.period}</span>
                    <h3 className="text-2xl font-serif font-black">{exp.role}</h3>
                    <p className="font-mono text-sm uppercase tracking-tighter opacity-70">@ {exp.company}</p>
                  </div>
                  <div className="flex gap-2">
                    {exp.tags.map(tag => (
                      <span key={tag} className="text-[10px] bg-earth-ink text-white px-2 py-1 font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <p className="font-mono text-sm leading-relaxed text-earth-ink/80 max-w-2xl">
                  {exp.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Experience;
