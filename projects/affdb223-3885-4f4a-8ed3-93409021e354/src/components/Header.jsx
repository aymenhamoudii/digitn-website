import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from '../assets/logo.svg';

export default function Header(){
  return (
    <header className="header" role="banner">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3" aria-label="Eat Time home">
          <img src={logo} alt="Eat Time logo" className="h-10 w-10" />
          <span className="text-sm font-serif">Eat Time</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-4">
          <NavLink to="/" className={({isActive}) => `nav-link ${isActive? 'text-primary-700':''}`}>Home</NavLink>
          <NavLink to="/menu" className={({isActive}) => `nav-link ${isActive? 'text-primary-700':''}`}>Menu</NavLink>
          <NavLink to="/gallery" className={({isActive}) => `nav-link ${isActive? 'text-primary-700':''}`}>Gallery</NavLink>
          <NavLink to="/events" className={({isActive}) => `nav-link ${isActive? 'text-primary-700':''}`}>Events</NavLink>
          <NavLink to="/contact" className={({isActive}) => `nav-link ${isActive? 'text-primary-700':''}`}>Contact</NavLink>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a href="tel:+1234567890" className="btn-primary no-print" aria-label="Call to reserve">Reserve</a>
        </div>

        <button className="md:hidden nav-link" aria-controls="mobile-menu" aria-expanded="false">Menu</button>
      </div>
    </header>
  );
}
