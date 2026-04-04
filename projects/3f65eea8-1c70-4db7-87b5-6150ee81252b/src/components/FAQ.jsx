import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from './Icons'

const faqs = [
  {
    question: 'Is there a free plan?',
    answer: 'Yes! Our Free plan includes basic workout logging, 1 fitness goal, and 7-day history. Perfect for trying out the app before committing to a paid plan.',
  },
  {
    question: 'Can I use it without a trainer?',
    answer: 'Absolutely. FitTrackr is designed for both independent athletes and those working with trainers. The Pro plan has everything you need to train on your own with AI-powered suggestions.',
  },
  {
    question: 'Does it sync with my smartwatch?',
    answer: 'Yes! FitTrackr integrates with Apple Health and Google Fit, as well as popular fitness trackers like Garmin, Fitbit, and Whoop. Your data syncs automatically.',
  },
  {
    question: 'How do I cancel my subscription?',
    answer: 'You can cancel anytime from your account settings. There are no long-term contracts or cancellation fees. Your data remains accessible even after cancellation.',
  },
  {
    question: 'Is my data private and secure?',
    answer: 'Your privacy is our top priority. All your data is encrypted and stored securely. We never share your personal data with third parties. You can export or delete your data at any time.',
  },
]

function FAQItem({ faq, index, isOpen, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="border-b border-gray-200 last:border-b-0"
    >
      <button
        onClick={onToggle}
        className="w-full py-6 flex items-center justify-between text-left group"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
          {faq.question}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-600 leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="py-20 lg:py-32 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-gray-600">
            Everything you need to know about FitTrackr.
          </p>
        </div>

        <div className="bg-white rounded-2xl px-6 lg:px-8 shadow-sm">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ