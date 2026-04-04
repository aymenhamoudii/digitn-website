import { useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import MenuPreview from './components/MenuPreview.jsx'
import Testimonials from './components/Testimonials.jsx'
import Footer from './components/Footer.jsx'
import { initDemoData } from './data/demoData.js'

function App() {
  useEffect(() => {
    initDemoData()
  }, [])

  return (
    <div className="min-h-screen bg-amber-50 font-sans text-amber-950">
      <Navbar />
      <Hero />
      <About />
      <MenuPreview />
      <Testimonials />
      <Footer />
    </div>
  )
}

export default App