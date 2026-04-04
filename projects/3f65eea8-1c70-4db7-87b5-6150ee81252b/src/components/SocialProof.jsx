function SocialProof() {
  const partners = [
    { name: 'TechCrunch', logo: 'TC' },
    { name: 'ProductHunt', logo: 'PH' },
    { name: 'Forbes Health', logo: 'FH' },
    { name: 'Wired', logo: 'W' },
    { name: 'The Verge', logo: 'V' },
    { name: 'Business Insider', logo: 'BI' },
  ]

  return (
    <section className="py-8 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-gray-400 mb-6">
          As seen in
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex items-center gap-2 text-gray-300 hover:text-gray-400 transition-colors cursor-default"
            >
              <span className="text-2xl font-bold">{partner.logo}</span>
              <span className="text-sm font-medium hidden sm:inline">{partner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SocialProof