import { motion } from 'framer-motion'

function CTA() {
  return (
    <section id="blog" className="py-20 lg:py-32 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-primary-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] bg-accent-50 rounded-full blur-3xl opacity-50"></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
            Start tracking today.
            <span className="block text-primary-600 mt-2">It's free.</span>
          </h2>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Join 10,000+ athletes who are already tracking, analyzing, and improving their fitness with FitTrackr.
          </p>
          <div className="mt-10">
            <button className="btn-primary text-lg px-10 py-4 shadow-lg hover:shadow-xl hover:-translate-y-1">
              Create My Free Account
            </button>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required · Setup in 2 minutes
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CTA