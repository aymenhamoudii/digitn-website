function Footer() {
  return (
    <footer className="bg-amber-950 text-amber-200 py-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-4xl">🍃</span>
            <span className="font-serif text-3xl text-white tracking-tight">Ember &amp; Sage</span>
          </div>
          <p className="text-amber-300 max-w-xs">
            124 Oak Grove Lane<br />
            Willow Creek, California 95472<br />
            <span className="font-medium">(707) 555-0187</span>
          </p>
          <p className="mt-6 text-xs text-amber-400/70">
            Tuesday–Sunday • 5pm–10pm<br />
            Closed Mondays
          </p>
        </div>

        <div className="md:col-span-2">
          <div className="uppercase text-xs font-medium tracking-widest text-amber-400 mb-6">Navigation</div>
          <div className="flex flex-col gap-3 text-sm">
            <a href="#" className="hover:text-white">Home</a>
            <a href="#about" className="hover:text-white">Our Story</a>
            <a href="#menu" className="hover:text-white">Menu</a>
            <a href="#testimonials" className="hover:text-white">Stories</a>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="uppercase text-xs font-medium tracking-widest text-amber-400 mb-6">Experience</div>
          <div className="flex flex-col gap-3 text-sm">
            <a href="#" className="hover:text-white">Reservations</a>
            <a href="#" className="hover:text-white">Private Dining</a>
            <a href="#" className="hover:text-white">Wine Cellar</a>
            <a href="#" className="hover:text-white">Gift Cards</a>
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="uppercase text-xs font-medium tracking-widest text-amber-400 mb-6">Connect</div>
          <div className="flex gap-6 text-3xl mb-8">
            <a href="#" className="hover:text-emerald-400">𝕏</a>
            <a href="#" className="hover:text-emerald-400">📸</a>
            <a href="#" className="hover:text-emerald-400">📍</a>
          </div>
          <div className="text-xs leading-tight text-amber-400/80">
            Follow our seasonal journey<br />
            @emberandsage
          </div>
          <div className="text-[10px] mt-12 text-amber-400/60">
            © 2026 Ember &amp; Sage. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer