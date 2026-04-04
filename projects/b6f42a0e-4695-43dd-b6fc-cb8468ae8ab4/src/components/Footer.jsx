import { useState, useRef, useEffect } from 'react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribeStatus, setSubscribeStatus] = useState(null)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active')
          }
        })
      },
      { threshold: 0.1 }
    )

    const revealElements = sectionRef.current?.querySelectorAll('.reveal')
    revealElements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return
    }
    // Simulate subscription
    setSubscribeStatus('success')
    setEmail('')
    setTimeout(() => setSubscribeStatus(null), 3000)
  }

  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: 'Menu', href: '#menu' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Our Story', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ]

  const socialLinks = [
    {
      name: 'Instagram',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'Twitter',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
  ]

  return (
    <footer
      ref={sectionRef}
      className="bg-charcoal-900 border-t border-charcoal-800"
    >
      <div className="container-custom section-padding">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="reveal">
            <a
              href="#"
              className="font-display text-3xl tracking-wider text-cream-50 hover:text-bronze-300 transition-colors"
            >
              Ember<span className="text-bronze-400">Room</span>
            </a>
            <p className="mt-4 text-cream-200/60 text-sm leading-relaxed">
              An intimate casual dining experience featuring contemporary American 
              cuisine with rustic influences.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 flex items-center justify-center bg-charcoal-800 text-cream-200 hover:bg-bronze-500 hover:text-charcoal-950 transition-all duration-300"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="reveal" style={{ animationDelay: '0.1s' }}>
            <h4 className="font-display text-lg text-cream-50 mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-cream-200/60 hover:text-bronze-300 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="reveal" style={{ animationDelay: '0.2s' }}>
            <h4 className="font-display text-lg text-cream-50 mb-6">
              Newsletter
            </h4>
            <p className="text-cream-200/60 text-sm mb-4">
              Subscribe for exclusive offers and event invitations.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="input-field text-sm"
              />
              <button type="submit" className="btn-primary w-full text-sm py-3">
                Subscribe
              </button>
              {subscribeStatus === 'success' && (
                <p className="text-green-400 text-xs">
                  Thank you for subscribing!
                </p>
              )}
            </form>
          </div>

          {/* Contact Info */}
          <div className="reveal" style={{ animationDelay: '0.3s' }}>
            <h4 className="font-display text-lg text-cream-50 mb-6">
              Contact
            </h4>
            <address className="not-italic text-cream-200/60 text-sm space-y-2">
              <p>742 Evergreen Terrace</p>
              <p>New York, NY 10001</p>
              <p className="pt-2">
                <a
                  href="tel:+12125550142"
                  className="hover:text-bronze-300 transition-colors"
                >
                  (212) 555-0142
                </a>
              </p>
              <p>
                <a
                  href="mailto:hello@emberroom.com"
                  className="hover:text-bronze-300 transition-colors"
                >
                  hello@emberroom.com
                </a>
              </p>
            </address>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-charcoal-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-cream-300/40 text-sm">
            <p>© {currentYear} Ember Room. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-bronze-300 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-bronze-300 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}