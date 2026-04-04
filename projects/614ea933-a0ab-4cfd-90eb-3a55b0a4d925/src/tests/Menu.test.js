/**
 * Test Specification: Menu Functionality
 */

test('filters menu items by category correctly', () => {
  // Mock data setup
  const items = [
    { id: 1, category: 'Starters', name: 'Bread' },
    { id: 2, category: 'Mains', name: 'Steak' }
  ];
  
  const filterCategory = 'Mains';
  const filtered = items.filter(item => item.category === filterCategory);
  
  expect(filtered.length).toBe(1);
  expect(filtered[0].name).toBe('Steak');
});

test('adds items to order cart correctly', () => {
  let cart = [];
  const itemToAdd = { id: 1, name: 'Pizza', price: 20 };
  
  const addToCart = (item) => {
    cart = [...cart, item];
  };
  
  addToCart(itemToAdd);
  expect(cart.length).toBe(1);
  expect(cart[0].id).toBe(1);
});

test('calculates cart total correctly', () => {
  const cart = [
    { id: 1, price: 10, quantity: 2 },
    { id: 2, price: 15, quantity: 1 }
  ];
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  expect(total).toBe(35);
});
