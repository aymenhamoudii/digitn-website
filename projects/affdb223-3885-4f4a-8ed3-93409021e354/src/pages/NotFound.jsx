import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/Container';

export default function NotFound(){
  return (
    <Container className="py-20 text-center">
      <h1 className="text-5xl font-serif">404</h1>
      <p className="mt-4 text-neutral-700">We couldn't find the page you're looking for.</p>
      <Link to="/" className="btn-primary mt-6 inline-block">Return Home</Link>
    </Container>
  );
}
