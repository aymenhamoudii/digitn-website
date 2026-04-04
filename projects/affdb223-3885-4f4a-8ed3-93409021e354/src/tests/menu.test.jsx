import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MenuList from '../components/MenuList';
import menu from '../data/menu.json';

describe('MenuList', () => {
  it('renders menu items and filters', () => {
    render(<MenuList items={menu} filters={{course:'All', tag:'All'}} onChange={() => {}} />);

    expect(screen.getByText('Cured & Smoked Salmon')).toBeTruthy();
    expect(screen.getByText('Wagyu Sirloin')).toBeTruthy();
  });

  it('filters by course', () => {
    const FiltersKeeper = () => {
      const [f, setF] = React.useState({course:'All', tag:'All'});
      return <MenuList items={menu} filters={f} onChange={setF} />;
    };

    render(<FiltersKeeper />);
    const select = screen.getAllByLabelText('Filter by course')[0];
    fireEvent.change(select, { target: { value: 'Dessert' } });
    expect(screen.getByText('Chocolate Fondant')).toBeTruthy();
  });
});
