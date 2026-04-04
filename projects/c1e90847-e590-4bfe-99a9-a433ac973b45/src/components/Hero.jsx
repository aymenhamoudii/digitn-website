function Hero() {
  return (
    <header className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://picsum.photos/id/1015/2000/1200')] bg-cover bg-center"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950/40 via-amber-950/60 to-amber-950/80"></div>
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
        <div className="inline-flex items-center px-5 py-2 bg-white/10 backdrop-blur-md rounded-3xl text-sm mb-8 tracking-widest">
          <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
          EST. 2018 • WILLOW CREEK
        </div>
        <h1 className="text-7xl md:text-8xl font-serif leading-none tracking-[-2px] mb-6">
          Ember &amp; Sage
        </h1>
        <p className="max-w-lg mx-auto text-2xl text-amber-100 mb-12">
          Earth meets flame. Seasonal fine dining where every plate tells a story.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a href="#" className="group px-8 py-4 bg-white text-emerald-700 rounded-3xl font-medium text-lg flex items-center justify-center hover:scale-105 transition-transform">
            Reserve Your Table
            <span className="ml-3 text-xl group-active:rotate-45 transition-transform">→</span>
          </a>
          <a href="#menu" className="px-8 py-4 border-2 border-white/80 hover:border-white text-white rounded-3xl font-medium text-lg transition-colors">
            Explore Menu
          </a>
        </div>
        <div className="mt-20 flex flex-col items-center text-xs uppercase tracking-[2px] text-amber-200">
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-amber-200 to-transparent mb-3"></div>
          SCROLL TO DISCOVER
        </div>
      </div>
    </header>
  )
}

export default Hero