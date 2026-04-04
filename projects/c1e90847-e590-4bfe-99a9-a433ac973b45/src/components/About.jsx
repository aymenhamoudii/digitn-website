function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-12 gap-16 items-center">
          <div className="md:col-span-5">
            <span className="px-4 py-1.5 text-xs font-medium tracking-widest bg-emerald-100 text-emerald-700 rounded-3xl">OUR STORY</span>
            <h2 className="text-5xl font-serif leading-tight mt-6 mb-8">Crafted by nature.<br />Perfected by fire.</h2>
            <div className="prose text-amber-700">
              <p className="text-lg">Ember &amp; Sage was founded on a simple belief: the best ingredients need only the gentlest touch. Our kitchen honors the land with seasonal menus that change with the harvest.</p>
              <p className="text-lg mt-6">Every dish is a conversation between earth and flame — served in a space that feels like coming home.</p>
            </div>
            <div className="mt-12 flex items-baseline gap-8">
              <div>
                <div className="text-5xl font-medium text-emerald-700">6</div>
                <div className="text-sm uppercase tracking-widest text-amber-500">Courses</div>
              </div>
              <div className="h-10 border-l border-amber-200"></div>
              <div>
                <div className="text-5xl font-medium text-emerald-700">Michelin</div>
                <div className="text-sm uppercase tracking-widest text-amber-500">Starred 2024</div>
              </div>
            </div>
          </div>
          <div className="md:col-span-7">
            <div className="aspect-[16/10] bg-[url('https://picsum.photos/id/201/1400/900')] bg-cover bg-center rounded-3xl shadow-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About