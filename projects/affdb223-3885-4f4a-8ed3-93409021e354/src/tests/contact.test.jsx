import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContactCard from '../components/ContactCard';

describe('ContactCard', () => {
  it('renders contact phone and map link', () => {
    render(<ContactCard />);
    expect(screen.getByText(/Phone:/)).toBeTruthy();
    expect(screen.getByText('+1 (234) 567-890')).toBeTruthy();
  });
});
