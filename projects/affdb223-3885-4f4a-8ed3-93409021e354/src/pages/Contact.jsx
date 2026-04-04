import React from 'react';
import Container from '../components/Container';
import ContactCard from '../components/ContactCard';
import ReservationNotice from '../components/ReservationNotice';

export default function Contact(){
  return (
    <Container className="py-12">
      <h1 className="font-serif text-3xl">Contact & Reservations</h1>
      <p className="text-neutral-600 mt-1">Reservations are phone-only. Please call to reserve your table.</p>

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <ContactCard />
        <ReservationNotice />
      </div>
    </Container>
  );
}
