import React from 'react';
import Container from '../components/Container';
import events from '../data/events.json';
import EventCard from '../components/EventCard';

export default function Events(){
  return (
    <Container className="py-12">
      <h1 className="font-serif text-3xl">Events</h1>
      <p className="text-neutral-600 mt-1">Private dining, tasting nights, and curated culinary experiences. Contact us to discuss private bookings.</p>
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        {events.map(ev => <EventCard key={ev.id} event={ev} />)}
      </div>
    </Container>
  );
}
