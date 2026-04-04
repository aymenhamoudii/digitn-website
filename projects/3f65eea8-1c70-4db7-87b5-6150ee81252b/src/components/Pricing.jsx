import { useState } from 'react'
import { Check } from './Icons'
import { motion } from 'framer-motion'

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
    features: [
      'Basic workout logging',
      '1 fitness goal',
      '7-day history',
      'Manual entry only',
      'Community support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: 9,
    description: 'For serious fitness enthusiasts',
    features: [
      'Unlimited workout logging',
      'AI workout suggestions',
      'Progress charts & heatmaps',
      'PDF report exports',
      'Apple Health & Google Fit sync',
      'Priority support',
      'Goal tracking & reminders',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Trainer',
    price: 29,
    description: 'For personal trainers & coaches',
    features: [
      'Everything in Pro',
      'Up to 20 clients',
      'Client dashboard',
      'Program templates',
      'Client progress reports',
      'Team billing & management',
      'API access',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
]

function PricingCard({ plan, index, isAnnual }) {
  const price = isAnnual ? Math.round(plan.price * 0.8) : plan.price

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      viewport={{ once: true }}
      className={`relative bg-white rounded-2xl border ${
        plan.popular ? 'border-primary-500 shadow-xl scale-105 z-10' : 'border-gray-200 shadow-sm hover:border-gray-300'
      } transition-all duration-300`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-primary-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <div className="p-6 lg:p-8">
        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
        <p className="mt-2 text-gray-500 text-sm">{plan.description}</p>

        <div className="mt-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-900">${price}</span>
            <span className="text-gray-500">/month</span>
          </div>
          {isAnnual && plan.price > 0 && (
            <p className="text-sm text-accent-600 mt-1 font-medium">
              Save 20% with annual billing
            </p>
          )}
        </div>

        <ul className="mt-8 space-y-3">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600 text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          className={`mt-8 w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            plan.popular ? 'btn-primary' : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {plan.cta}
        </button>
      </div>
    </motion.div>
  )
}

function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <section id="pricing" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 section-subtitle mx-auto">
            Choose the plan that fits your goals. Upgrade or downgrade anytime.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                isAnnual ? 'bg-primary-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={isAnnual}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isAnnual ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual
              <span className="ml-1 text-accent-600 font-semibold">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index} isAnnual={isAnnual} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Pricing