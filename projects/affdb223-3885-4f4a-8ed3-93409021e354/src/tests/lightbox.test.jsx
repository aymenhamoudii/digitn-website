import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GalleryGrid from '../components/GalleryGrid';
import gallery from '../data/gallery.json';

describe('GalleryGrid', () => {
  it('opens lightbox when image clicked and closes on close button', () => {
    render(<GalleryGrid items={gallery} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(screen.getByRole('dialog')).toBeTruthy();
    const close = screen.getAllByText('Close')[0];
    fireEvent.click(close);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
