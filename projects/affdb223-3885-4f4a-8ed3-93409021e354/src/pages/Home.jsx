import React from 'react';
import Container from '../components/Container';
import { Link } from 'react-router-dom';
import hero from '../assets/hero.jpg';

export default function Home(){
  return (
    <div>
      <section className="bg-gradient-to-b from-neutral-50 to-white">
        <div className="container grid md:grid-cols-2 gap-8 items-center py-16">
          <div>
            <h1 className="text-5xl font-serif">Welcome to Eat Time</h1>
            <p className="mt-4 text-neutral-700">An elevated dining experience featuring seasonal tasting menus, private events, and an intimate atmosphere curated for connoisseurs.</p>
            <div className="mt-6 flex gap-3">
              <Link to="/menu" className="btn-primary">View Menu</Link>
              <Link to="/events" className="nav-link">Events</Link>
            </div>
          </div>
          <div>
            <img src={hero} alt="Dining room with elegant table setting" className="w-full rounded-xl shadow-lg object-cover h-64 md:h-80" />
          </div>
        </div>
      </section>

      <Container className="py-12">
        <section aria-labelledby="featured">
          <h2 id="featured">Featured</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <article className="card">
              <h3 className="font-serif">Seasonal Tasting</h3>
              <p className="text-sm text-neutral-600 mt-2">A refined multi-course tasting menu showcasing local produce.</p>
            </article>
            <article className="card">
              <h3 className="font-serif">Private Dining</h3>
              <p className="text-sm text-neutral-600 mt-2">Intimate private rooms for special occasions and business hospitality.</p>
            </article>
            <article className="card">
              <h3 className="font-serif">Chef's Table Events</h3>
              <p className="text-sm text-neutral-600 mt-2">Curated evenings with wine pairings and guest chefs.</p>
            </article>
          </div>
        </section>
      </Container>
    </div>
  );
}
