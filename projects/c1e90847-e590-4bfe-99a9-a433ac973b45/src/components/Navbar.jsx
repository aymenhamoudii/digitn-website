import { useState } from 'react'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <nav className="sticky top-0 z-50 bg-amber-50/80 backdrop-blur-md border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🍃</span>
          <span className="text-2xl font-serif tracking-tighter">Ember & Sage</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#about" className="hover:text-emerald-700 transition-colors">About</a>
          <a href="#menu" className="hover:text-emerald-700 transition-colors">Menu</a>
          <a href="#testimonials" className="hover:text-emerald-700 transition-colors">Stories</a>
          <a href="#" className="hover:text-emerald-700 transition-colors">Reservations</a>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden md:block px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-3xl text-sm font-medium transition-colors">
            Reserve Table
          </button>
          <button
            onClick={toggleMenu}
            className="md:hidden text-3xl leading-none"
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-amber-50 border-t py-6 px-6">
          <div className="flex flex-col gap-6 text-sm font-medium">
            <a href="#about" className="hover:text-emerald-700">About</a>
            <a href="#menu" className="hover:text-emerald-700">Menu</a>
            <a href="#testimonials" className="hover:text-emerald-700">Stories</a>
            <a href="#" className="hover:text-emerald-700">Reservations</a>
            <button className="mt-4 w-full py-3 bg-emerald-700 text-white rounded-3xl font-medium">
              Reserve Table
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar