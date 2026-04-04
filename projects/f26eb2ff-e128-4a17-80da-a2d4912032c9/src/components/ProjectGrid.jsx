import React, { useState, useMemo } from 'react';
import { PROJECTS } from '../constants/projects';
import ProjectCard from './ProjectCard';
import FilterBar from './FilterBar';

const ProjectGrid = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const categories = ['All', 'Development', 'Design', 'Branding'];

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'All') return PROJECTS;
    return PROJECTS.filter(project => project.category === activeFilter);
  }, [activeFilter]);

  return (
    <div className="section-container">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
        <div>
          <h2 className="text-4xl md:text-6xl mb-4">SELECTED_WORKS</h2>
          <p className="font-mono text-earth-ink/70 max-w-lg">
            A curated selection of experiments and client projects focused on structural integrity and raw aesthetics.
          </p>
        </div>
        
        <FilterBar 
          categories={categories} 
          activeFilter={activeFilter} 
          setActiveFilter={setActiveFilter} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {filteredProjects.map((project, index) => (
          <div 
            key={project.id} 
            style={{ 
              marginTop: index % 3 === 1 ? '3rem' : index % 3 === 2 ? '1.5rem' : '0' 
            }}
            className="md:mt-0 lg:block"
          >
            <ProjectCard project={project} />
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-24 brutal-border bg-white shadow-brutal">
          <p className="font-serif text-2xl italic">No artifacts found in this sector.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectGrid;
