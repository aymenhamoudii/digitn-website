import React from 'react';
import Container from '../components/Container';
import GalleryGrid from '../components/GalleryGrid';
import galleryData from '../data/gallery.json';

export default function Gallery(){
  return (
    <Container className="py-12">
      <h1 className="font-serif text-3xl">Gallery</h1>
      <p className="text-neutral-600 mt-1">A curated selection of images from the dining room, dishes, and special events.</p>
      <div className="mt-6">
        <GalleryGrid items={galleryData} />
      </div>
    </Container>
  );
}
