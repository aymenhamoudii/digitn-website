import { useState, useRef, useEffect } from 'react'
import { galleryImages } from '../data/galleryData'
import LightboxModal from './LightboxModal'

export default function GallerySection() {
  const [selectedImage, setSelectedImage] = useState(null)
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

  const currentIndex = selectedImage
    ? galleryImages.findIndex((img) => img.id === selectedImage.id)
    : -1

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % galleryImages.length
    setSelectedImage(galleryImages[nextIndex])
  }

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length
    setSelectedImage(galleryImages[prevIndex])
  }

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="section-padding bg-charcoal-950"
    >
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16 reveal">
          <p className="text-bronze-400 text-sm uppercase tracking-[0.3em] mb-4">
            Visual Journey
          </p>
          <h2 className="font-display text-display-sm text-cream-50 mb-6">
            The Gallery
          </h2>
          <p className="text-cream-200/70 max-w-2xl mx-auto leading-relaxed">
            Experience the ambiance, artistry, and culinary excellence 
            that define the Ember Room experience.
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              className={`reveal relative group cursor-pointer overflow-hidden ${
                index % 3 === 0 ? 'md:row-span-2' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 ease-elegant group-hover:scale-110"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-12 h-12 rounded-full bg-bronze-500/20 backdrop-blur-sm flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-cream-100"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Hint */}
        <p className="text-center text-cream-300/40 text-sm mt-8 md:hidden">
          Tap any image to enlarge
        </p>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <LightboxModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </section>
  )
}