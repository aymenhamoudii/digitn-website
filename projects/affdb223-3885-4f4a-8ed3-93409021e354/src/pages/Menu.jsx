import React, { useState } from 'react';
import Container from '../components/Container';
import MenuList from '../components/MenuList';
import menuData from '../data/menu.json';

export default function Menu(){
  const [filters, setFilters] = useState({course:'All', tag:'All'});

  return (
    <Container className="py-12">
      <header>
        <h1 className="font-serif text-3xl">Menu</h1>
        <p className="text-neutral-600 mt-1">Seasonal, locally-sourced tasting menus and a selection of à la carte dishes. For reservations call <a href="tel:+1234567890" className="text-primary-700">+1 (234) 567-890</a>.</p>
      </header>

      <div className="mt-6">
        <MenuList items={menuData} filters={filters} onChangeFilters={setFilters} />
      </div>
    </Container>
  );
}
