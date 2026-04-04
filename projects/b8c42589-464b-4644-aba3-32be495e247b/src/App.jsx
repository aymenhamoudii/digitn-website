import React, { useEffect } from 'react';
import Layout from './components/Layout';
import Hero from './components/Hero';
import MenuShowcase from './components/MenuShowcase';
import Atmosphere from './components/Atmosphere';
import Reservation from './components/Reservation';
import Footer from './components/Footer';
import { initDemoData } from './utils/initDemo';

function App() {
  useEffect(() => {
    // Initialize demo data on first load
    initDemoData();
  }, []);

  return (
    <Layout>
      <Hero />
      <MenuShowcase />
      <Atmosphere />
      <Reservation />
      <Footer />
    </Layout>
  );
}

export default App;