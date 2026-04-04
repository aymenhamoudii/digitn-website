import React from 'react';

const ProjectCard = ({ project }) => {
  return (
    <div className="brutal-card group h-full flex flex-col overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden border-b-4 border-earth-ink">
        <img 
          src={project.image} 
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-earth-stone text-white px-3 py-1 font-mono text-[10px] tracking-widest brutal-border shadow-brutal transform -rotate-2">
            {project.category.toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex-grow flex flex-col gap-4">
        <h3 className="text-2xl font-serif font-black">{project.title}</h3>
        
        <p className="font-mono text-sm leading-relaxed text-earth-ink/80 flex-grow">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 pt-4">
          {project.tech.map(t => (
            <span key={t} className="text-[10px] font-bold bg-earth-sand/20 px-2 py-1 brutal-border border-2">
              {t}
            </span>
          ))}
        </div>

        <div className="pt-6">
          <a 
            href={project.link}
            className="inline-flex items-center gap-2 font-bold text-xs tracking-[0.2em] border-b-2 border-earth-clay pb-1 hover:gap-4 transition-all"
          >
            EXPLORE_ARTEFACT →
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
