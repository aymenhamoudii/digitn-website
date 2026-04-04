import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './sections/Hero';
import ChefStory from './sections/ChefStory';
import Menu from './sections/Menu';
import Gallery from './sections/Gallery';
import Reservation from './sections/Reservation';

function App() {
  return (
    <div className="min-h-screen bg-charcoal-950">
      <Navbar />
      <main>
        <section id="hero">
          <Hero />
        </section>
        <section id="story">
          <ChefStory />
        </section>
        <section id="menu">
          <Menu />
        </section>
        <section id="gallery">
          <Gallery />
        </section>
        <section id="reservation">
          <Reservation />
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default App;
