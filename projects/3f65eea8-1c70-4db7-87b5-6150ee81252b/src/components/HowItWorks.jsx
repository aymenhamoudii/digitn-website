import { motion } from 'framer-motion'
import { ClipboardList, BarChart, Trophy } from './Icons'

const steps = [
  {
    icon: ClipboardList,
    number: '01',
    title: 'Log your workout',
    description: 'Takes 30 seconds. Quick entry with exercise library, sets, reps, and weights.',
  },
  {
    icon: BarChart,
    number: '02',
    title: 'See your data',
    description: 'Charts update in real time. Spot trends, track PRs, and understand your progress.',
  },
  {
    icon: Trophy,
    number: '03',
    title: 'Hit your goals',
    description: 'Weekly AI recommendations keep you on track. Celebrate wins and stay motivated.',
  },
]

function Step({ step, index }) {
  const Icon = step.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      viewport={{ once: true }}
      className="relative flex flex-col items-center text-center"
    >
      {/* Timeline connector */}
      {index < steps.length - 1 && (
        <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary-200 to-primary-100"></div>
      )}

      {/* Step number */}
      <div className="absolute -top-2 -left-2 text-6xl font-bold text-primary-100 -z-10">
        {step.number}
      </div>

      {/* Icon circle */}
      <div className="relative w-24 h-24 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center mb-6 hover:shadow-xl transition-shadow">
        <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center">
          <Icon className="w-8 h-8 text-primary-600" />
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {step.title}
      </h3>
      <p className="text-gray-600 max-w-xs">
        {step.description}
      </p>
    </motion.div>
  )
}

function HowItWorks() {
  return (
    <section className="py-20 lg:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">
            How it works
          </h2>
          <p className="mt-4 section-subtitle mx-auto">
            Get started in minutes. Track, analyze, and improve with AI-powered insights.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <Step key={index} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks