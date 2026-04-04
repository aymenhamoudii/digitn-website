import { Brain, BarChart3, Target, Users, Smartphone, FileText } from './Icons'
import { motion } from 'framer-motion'

const features = [
  {
    icon: Brain,
    title: 'AI Workout Suggestions',
    description: 'Get personalized workout recommendations based on your goals, history, and recovery data.',
  },
  {
    icon: BarChart3,
    title: 'Progress Charts & Heatmaps',
    description: 'Visualize your gains with beautiful charts and activity heatmaps that show your consistency.',
  },
  {
    icon: Target,
    title: 'Goal Tracking',
    description: 'Set measurable goals and track your progress with smart milestones and reminders.',
  },
  {
    icon: Users,
    title: 'Trainer–Client Dashboard',
    description: 'Trainers can monitor client progress, adjust programs, and communicate seamlessly.',
  },
  {
    icon: Smartphone,
    title: 'Apple Health & Google Fit Sync',
    description: 'Automatically import data from your smartwatch or fitness apps for seamless tracking.',
  },
  {
    icon: FileText,
    title: 'Exportable PDF Reports',
    description: 'Generate professional PDF reports for clients, insurance, or your personal records.',
  },
]

function FeatureCard({ feature, index }) {
  const Icon = feature.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300"
    >
      <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {feature.title}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {feature.description}
      </p>
    </motion.div>
  )
}

function Features() {
  return (
    <section id="features" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">
            Everything you need to level up
          </h2>
          <p className="mt-4 section-subtitle mx-auto">
            Powerful features designed to help you achieve your fitness goals faster and smarter.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features