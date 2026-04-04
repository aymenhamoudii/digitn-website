import { menuItems } from '../data/demoData.js'

function MenuPreview() {
  return (
    <section id="menu" className="py-24 bg-amber-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-emerald-700 text-sm font-medium tracking-widest">SEASONAL OFFERINGS</span>
            <h2 className="text-5xl font-serif mt-2">Signature Menu</h2>
          </div>
          <a href="#" className="mt-4 md:mt-0 inline-flex items-center text-emerald-700 hover:text-emerald-800 font-medium">
            View full menu <span className="ml-2 text-xl">→</span>
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {menuItems.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl overflow-hidden group hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="h-52 bg-amber-100 flex items-center justify-center text-7xl border-b group-hover:scale-110 transition-transform">
                {item.emoji}
              </div>
              <div className="p-7">
                <div className="flex justify-between">
                  <span className="uppercase text-xs font-medium text-amber-500 tracking-widest">{item.category}</span>
                  <span className="font-medium text-emerald-700">${item.price}</span>
                </div>
                <h3 className="font-medium text-2xl mt-2 mb-3 leading-none">{item.name}</h3>
                <p className="text-sm text-amber-600 line-clamp-3">{item.desc}</p>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="px-4 py-1 text-[10px] bg-emerald-100 text-emerald-700 rounded-3xl">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MenuPreview