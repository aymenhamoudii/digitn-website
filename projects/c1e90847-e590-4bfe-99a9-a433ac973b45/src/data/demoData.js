export const menuItems = [
  { id: 1, category: 'Appetizer', name: 'Sage Butter Scallops', desc: 'Pan-seared diver scallops, brown butter, fresh sage, toasted hazelnuts', price: 24, tags: ['gluten-free'], emoji: '🦪' },
  { id: 2, category: 'Appetizer', name: 'Heirloom Tomato Salad', desc: 'Garden tomatoes, creamy burrata, aged balsamic, crispy basil', price: 18, tags: ['vegetarian'], emoji: '🍅' },
  { id: 3, category: 'Main', name: 'Herb-Crusted Lamb Rack', desc: 'Colorado lamb, rosemary crust, roasted roots, mint jus', price: 58, tags: [], emoji: '🍖' },
  { id: 4, category: 'Main', name: 'Wild Mushroom Risotto', desc: 'Foraged mushrooms, truffle oil, parmesan crisp', price: 42, tags: ['vegetarian'], emoji: '🍄' },
  { id: 5, category: 'Main', name: 'Pan-Roasted Branzino', desc: 'Mediterranean sea bass, fennel, olives, citrus gremolata', price: 52, tags: ['gluten-free'], emoji: '🐟' },
  { id: 6, category: 'Dessert', name: 'Olive Oil Chocolate Cake', desc: 'Flourless cake, extra virgin olive oil, sea salt, candied orange', price: 16, tags: ['vegetarian'], emoji: '🍫' },
  { id: 7, category: 'Dessert', name: 'Lavender Crème Brûlée', desc: 'House lavender custard, fresh berries, shortbread', price: 14, tags: [], emoji: '🍮' },
  { id: 8, category: 'Appetizer', name: 'Foie Gras Torchon', desc: 'House-made with port reduction and toasted brioche', price: 32, tags: [], emoji: '🥐' }
]

export const testimonials = [
  { id: 1, name: 'Elena Moreau', role: 'Food Critic, Michelin Guide', text: 'An unforgettable evening. The balance of flavors and the warmth of the service made it one of the best dining experiences I’ve had this year.' },
  { id: 2, name: 'Marcus Rivera', role: 'CEO, Bay Area Tech', text: 'Every dish felt personal. The staff anticipated our needs perfectly. Truly exceptional hospitality paired with masterful cuisine.' },
  { id: 3, name: 'Priya Patel', role: 'Wine Enthusiast', text: 'The wine pairing elevated everything. The sommelier curated a journey that complemented each course beautifully.' },
  { id: 4, name: 'Thomas Berg', role: 'Local Resident', text: 'We’ve been coming back monthly. The menu changes with the seasons, but the quality remains consistently world-class.' }
]

export function initDemoData() {
  if (localStorage.getItem('demoSeeded') === 'true') return
  localStorage.setItem('demoSeeded', 'true')
  console.log('%c🍃 Ember & Sage demo data seeded – ready to impress', 'color:#4a7040;font-family:Georgia,serif')
}