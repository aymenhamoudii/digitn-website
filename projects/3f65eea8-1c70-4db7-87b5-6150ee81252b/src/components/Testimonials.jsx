import { motion } from 'framer-motion'
import { Star } from './Icons'

const testimonials = [
  {
    avatar: 'S',
    name: 'Sarah Chen',
    title: 'Marathon Runner',
    rating: 5,
    quote: 'FitTrackr helped me shave 15 minutes off my marathon time. The AI suggestions are incredibly smart about pacing and recovery.',
  },
  {
    avatar: 'M',
    name: 'Marcus Johnson',
    title: 'Personal Trainer',
    rating: 5,
    quote: "I manage 15 clients and FitTrackr's dashboard saves me 5 hours every week. The progress reports are a game-changer for my business.",
  },
  {
    avatar: 'E',
    name: 'Emily Rodriguez',
    title: 'Marketing Director',
    rating: 5,
    quote: 'As a busy professional, I needed something quick. 30 seconds to log a workout and I get actionable insights every week.',
  },
]

function TestimonialCard({ testimonial, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      viewport={{ once: true }}
      className="bg-gray-50 rounded-2xl p-6 lg:p-8 hover:bg-gray-100 transition-colors"
    >
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
        ))}
      </div>

      {/* Quote */}
      <p className="text-gray-700 text-lg leading-relaxed mb-6">
        "{testimonial.quote}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
          {testimonial.avatar}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{testimonial.name}</div>
          <div className="text-sm text-gray-500">{testimonial.title}</div>
        </div>
      </div>
    </motion.div>
  )
}

function Testimonials() {
  return (
    <section id="testimonials" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">
            Loved by 10,000+ athletes
          </h2>
          <p className="mt-4 section-subtitle mx-auto">
            Join thousands of fitness enthusiasts who trust FitTrackr to reach their goals.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials