import { useState, useEffect } from 'react'
import { testimonials } from '../data/demoData.js'

function Testimonials() {
  const [current, setCurrent] = useState(0)

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    const timer = setInterval(nextSlide, 4800)
    return () => clearInterval(timer)
  }, [])

  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-xl mx-auto text-center mb-16">
          <span className="text-xs font-medium tracking-widest text-emerald-700">GUEST STORIES</span>
          <h2 className="text-5xl font-serif mt-3">What our table remembers</h2>
        </div>

        <div className="relative max-w-2xl mx-auto bg-amber-50 rounded-3xl p-10 shadow-inner">
          <div className="text-7xl text-emerald-300/60 mb-8">“</div>
          <p className="text-2xl leading-tight text-amber-800 italic">
            {testimonials[current].text}
          </p>
          <div className="mt-12 flex items-center gap-4">
            <div className="flex-shrink-0 w-11 h-11 bg-emerald-200 rounded-2xl flex items-center justify-center text-3xl">👤</div>
            <div>
              <div className="font-medium text-lg">{testimonials[current].name}</div>
              <div className="text-amber-500 text-sm">{testimonials[current].role}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center gap-8 mt-12">
          <button onClick={prevSlide} className="px-5 py-3 border border-amber-300 hover:border-emerald-700 rounded-3xl transition-colors">←</button>
          <div className="flex gap-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-3 h-3 rounded-full transition-all ${index === current ? 'bg-emerald-700 scale-110' : 'bg-amber-300'}`}
              />
            ))}
          </div>
          <button onClick={nextSlide} className="px-5 py-3 border border-amber-300 hover:border-emerald-700 rounded-3xl transition-colors">→</button>
        </div>
      </div>
    </section>
  )
}

export default Testimonials