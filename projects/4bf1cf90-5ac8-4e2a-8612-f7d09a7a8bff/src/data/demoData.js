// src/data/demoData.js
// Demo data seeding for instant preview - called before app initialization
export const initDemoData = () => {
  if (localStorage.getItem('demoSeeded') === 'true') return;

  console.log('%c🌱 Bella Vista demo data seeded for instant preview', 'color:#c2410f; font-family:serif; font-size:13px');

  // 12 realistic menu items across categories (used by MenuSection via localStorage if extended)
  const menuItems = [
    {
      id: 1,
      category: 'appetizers',
      name: 'Burrata e Prosciutto',
      description: 'Creamy burrata, aged prosciutto di Parma, arugula, and 12-year balsamic.',
      price: '$18',
      image: 'https://picsum.photos/id/201/600/450',
      tags: ['gluten-free']
    },
    {
      id: 2,
      category: 'appetizers',
      name: 'Calamari Fritti',
      description: 'Crispy squid rings, lemon zest, marinara sauce, fresh parsley.',
      price: '$16',
      image: 'https://picsum.photos/id/292/600/450',
      tags: []
    },
    {
      id: 3,
      category: 'appetizers',
      name: 'Bruschetta Classica',
      description: 'Grilled sourdough, heirloom tomatoes, garlic, fresh basil, olive oil.',
      price: '$14',
      image: 'https://picsum.photos/id/312/600/450',
      tags: ['vegan']
    },
    {
      id: 4,
      category: 'mains',
      name: 'Branzino al Forno',
      description: 'Whole Mediterranean sea bass, roasted with lemon, herbs, capers and olives.',
      price: '$42',
      image: 'https://picsum.photos/id/1015/600/450',
      tags: ['gluten-free']
    },
    {
      id: 5,
      category: 'mains',
      name: 'Tagliatelle Bolognese',
      description: 'Fresh egg pasta, slow-cooked beef and pork ragù, aged Parmigiano.',
      price: '$28',
      image: 'https://picsum.photos/id/133/600/450',
      tags: []
    },
    {
      id: 6,
      category: 'mains',
      name: 'Osso Buco Milanese',
      description: 'Braised veal shank, saffron risotto, gremolata, red wine reduction.',
      price: '$48',
      image: 'https://picsum.photos/id/201/600/450',
      tags: []
    },
    {
      id: 7,
      category: 'desserts',
      name: 'Tiramisù Classico',
      description: 'Ladyfingers soaked in espresso, mascarpone, cocoa, and coffee liqueur.',
      price: '$14',
      image: 'https://picsum.photos/id/312/600/450',
      tags: []
    },
    {
      id: 8,
      category: 'desserts',
      name: 'Panna Cotta al Limone',
      description: 'Silky vanilla panna cotta, lemon curd, candied zest, fresh berries.',
      price: '$13',
      image: 'https://picsum.photos/id/1016/600/450',
      tags: ['gluten-free']
    },
    {
      id: 9,
      category: 'drinks',
      name: 'Negroni Sbagliato',
      description: 'Campari, sweet vermouth, prosecco, orange twist.',
      price: '$17',
      image: 'https://picsum.photos/id/133/600/450',
      tags: []
    },
    {
      id: 10,
      category: 'drinks',
      name: 'Aperol Spritz',
      description: 'Aperol, prosecco, soda, orange slice.',
      price: '$15',
      image: 'https://picsum.photos/id/201/600/450',
      tags: []
    },
    {
      id: 11,
      category: 'mains',
      name: 'Risotto ai Funghi Porcini',
      description: 'Carnaroli rice, wild porcini mushrooms, thyme, aged Parmigiano.',
      price: '$26',
      image: 'https://picsum.photos/id/292/600/450',
      tags: ['vegetarian']
    },
    {
      id: 12,
      category: 'desserts',
      name: 'Cannoli Siciliani',
      description: 'Crisp shells filled with ricotta, candied orange, dark chocolate chips.',
      price: '$12',
      image: 'https://picsum.photos/id/1016/600/450',
      tags: []
    }
  ];

  // Testimonials for instant preview
  const testimonials = [
    {
      quote: "The most authentic Tuscan dining experience outside of Italy. The osso buco melted in my mouth. We’ve been back three times this month.",
      name: "Elena Moretti",
      role: "Food Critic, La Repubblica",
      rating: 5
    },
    {
      quote: "Chef Maria’s burrata is life-changing. Paired with their house Negroni, it’s pure perfection. The service feels like family.",
      name: "James Laurent",
      role: "Travel Editor, Condé Nast",
      rating: 5
    },
    {
      quote: "Celebrated our anniversary here. The private terrace view of the Duomo at sunset with the tasting menu was unforgettable.",
      name: "Sophie & Marco Bianchi",
      role: "Anniversary guests",
      rating: 5
    },
    {
      quote: "Best panna cotta I’ve ever had in my life. The wine list is perfectly curated. Can’t wait to return.",
      name: "Luca Rossi",
      role: "Local Florentine",
      rating: 5
    }
  ];

  // Reservation availability slots for demo
  const reservationSlots = [
    { date: '2026-04-05', time: '17:30', available: true },
    { date: '2026-04-05', time: '18:30', available: true },
    { date: '2026-04-05', time: '20:00', available: false },
    { date: '2026-04-06', time: '19:00', available: true }
  ];

  localStorage.setItem('menuItems', JSON.stringify(menuItems));
  localStorage.setItem('testimonials', JSON.stringify(testimonials));
  localStorage.setItem('reservationSlots', JSON.stringify(reservationSlots));
  localStorage.setItem('demoSeeded', 'true');
};

// Auto-seed on module import (for immediate preview)
initDemoData();

export default initDemoData;
