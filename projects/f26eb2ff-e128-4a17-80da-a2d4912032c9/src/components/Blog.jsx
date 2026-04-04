import React from 'react';
import { POSTS } from '../constants/posts';

const Blog = () => {
  return (
    <div className="section-container border-t-4 border-earth-ink">
      <div className="flex flex-col md:flex-row gap-16">
        <div className="md:w-1/3">
          <h2 className="text-4xl md:text-6xl mb-8 sticky top-32">TECH_ JOURNAL</h2>
          <p className="font-mono text-earth-ink/70">
            Occasional thoughts on design systems, technical debt, and the intersection of biology and computing.
          </p>
          
          <div className="mt-12 hidden md:block">
            <div className="bg-earth-sand p-6 brutal-border shadow-brutal rotate-3">
              <p className="font-mono text-xs font-bold uppercase mb-2">SUBSCRIBE_</p>
              <p className="font-serif text-lg leading-tight mb-4">GET THE LATEST ARTEFACTS IN YOUR INBOX.</p>
              <div className="flex">
                <input type="text" placeholder="EMAIL" className="bg-white p-2 brutal-border border-2 flex-grow text-xs focus:outline-none" />
                <button className="bg-earth-ink text-white p-2 px-4 text-xs font-bold">→</button>
              </div>
            </div>
          </div>
        </div>

        <div className="md:w-2/3 flex flex-col gap-px bg-earth-ink brutal-border shadow-brutal overflow-hidden">
          {POSTS.map((post) => (
            <article 
              key={post.id} 
              className="group bg-white p-8 md:p-12 hover:bg-earth-parchment transition-colors relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="font-mono text-xs font-bold bg-earth-clay text-white px-2 py-1 transform -rotate-1">
                  {post.category}
                </span>
                <span className="font-mono text-xs text-earth-ink/50">{post.date} // {post.readTime}</span>
              </div>
              
              <h3 className="text-3xl font-serif font-black leading-tight mb-4 group-hover:text-earth-clay transition-colors cursor-pointer">
                {post.title}
              </h3>
              
              <p className="font-mono text-sm text-earth-ink/70 leading-relaxed mb-8 max-w-xl">
                {post.excerpt}
              </p>

              <div className="flex items-center gap-4 group-hover:gap-6 transition-all">
                <div className="w-12 h-1 bg-earth-ink"></div>
                <button className="font-bold text-xs tracking-widest uppercase hover:text-earth-clay">READ_FULL_LOG</button>
              </div>

              {/* Decorative background number */}
              <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-[0.03] font-serif font-black text-9xl group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                0{post.id}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
