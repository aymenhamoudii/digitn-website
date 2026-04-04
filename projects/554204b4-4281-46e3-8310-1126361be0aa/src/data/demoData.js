// Function to pre-seed localStorage with demo data if it doesn't exist
export const initDemoData = () => {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem('demoSeeded')) {
    const defaultData = {
      menuItems: [
        {
          id: 'm1',
          name: 'Charred Heirloom Carrots',
          description: 'Wood-fired carrots from Star Route Farms with whipped tahini, preserved lemon, and toasted pistachios. Finished with wild fennel pollen.',
          price: 18,
          ingredients: ['Carrot', 'Tahini', 'Pistachio', 'Lemon'],
          category: 'Starters',
          image: 'https://images.unsplash.com/photo-1590868285918-62d46e053a47?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: 'm2',
          name: 'Foraged Mushroom Tart',
          description: 'Flaky rye pastry filled with caramelized alliums, local chanterelles and maitake mushrooms, topped with shaved aged gruyere and fresh thyme.',
          price: 24,
          ingredients: ['Chanterelle', 'Rye', 'Gruyere', 'Thyme'],
          category: 'Starters',
          image: 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: 'm3',
          name: 'Pan-Seared Halibut',
          description: 'Line-caught local halibut resting on a bed of sweet corn puree, blistered cherry tomatoes, and a bright basil-mint salsa verde.',
          price: 42,
          ingredients: ['Halibut', 'Corn', 'Tomato', 'Basil'],
          category: 'Mains',
          image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: 'm4',
          name: 'Heritage Pork Collar',
          description: 'Slow-roasted pasture-raised pork served alongside ember-roasted fingerling potatoes, braised bitter greens, and a cider-mustard jus.',
          price: 38,
          ingredients: ['Pork', 'Potato', 'Mustard', 'Cider'],
          category: 'Mains',
          image: 'https://images.unsplash.com/photo-1628198086052-cdfb4d8d17b8?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: 'm5',
          name: 'Smoked Eggplant Agnolotti',
          description: 'Hand-made pasta pillows filled with smoky eggplant puree, tossed in a brown butter sage sauce with toasted pine nuts and pecorino.',
          price: 32,
          ingredients: ['Eggplant', 'Pasta', 'Sage', 'Pine Nut'],
          category: 'Mains',
          image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: 'm6',
          name: 'Roasted Beet Salad',
          description: 'Salt-roasted golden and red beets layered with house-made ricotta, candied walnuts, baby arugula, and a white balsamic vinaigrette.',
          price: 20,
          ingredients: ['Beet', 'Ricotta', 'Walnut', 'Arugula'],
          category: 'Starters',
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: 'm7',
          name: 'Olive Oil Cake',
          description: 'Moist extra virgin olive oil cake served with macerated seasonal berries, a dollop of mascarpone cream, and candied rosemary.',
          price: 14,
          ingredients: ['Olive Oil', 'Berry', 'Mascarpone', 'Rosemary'],
          category: 'Desserts',
          image: 'https://images.unsplash.com/photo-1548616149-6ee12cb348e3?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: 'm8',
          name: 'Dark Chocolate Torte',
          description: 'Flourless single-origin chocolate torte accompanied by a tart sea buckthorn coulis and a crisp hazelnut tuile.',
          price: 16,
          ingredients: ['Chocolate', 'Sea Buckthorn', 'Hazelnut'],
          category: 'Desserts',
          image: 'https://images.unsplash.com/photo-1574085733277-851d9d856a3a?q=80&w=1000&auto=format&fit=crop'
        }
      ],
      reviews: [
        {
          id: 'r1',
          name: 'Eleanor Vance',
          rating: 5,
          text: "An absolutely transcendent dining experience. The attention to the origin of every ingredient is palpable in every bite. The charred carrots redefined what a vegetable can be.",
          date: 'October 12, 2024'
        },
        {
          id: 'r2',
          name: 'Julian Blackwood',
          rating: 5,
          text: "Lumina doesn't just serve food; it curates a dialogue with the local landscape. The atmosphere strikes the perfect balance between rustic warmth and refined elegance.",
          date: 'November 3, 2024'
        },
        {
          id: 'r3',
          name: 'Sophia Chen',
          rating: 4,
          text: "The foraged mushroom tart was a masterclass in pastry and umami. Service was impeccable—attentive yet unobtrusive. A true gem in the valley.",
          date: 'September 28, 2024'
        },
        {
          id: 'r4',
          name: 'Marcus Thorne',
          rating: 5,
          text: "Every dish tells a story. We had the halibut and the pork collar, both executed flawlessly. The wine pairing recommendations from the sommelier elevated the entire evening.",
          date: 'December 15, 2024'
        },
        {
          id: 'r5',
          name: 'Amelia Rossi',
          rating: 5,
          text: "From the moment you walk through the door, the scent of woodsmoke and roasting herbs sets the stage. The olive oil cake is perhaps the best dessert I've had this decade.",
          date: 'August 19, 2024'
        },
        {
          id: 'r6',
          name: 'David Lin',
          rating: 5,
          text: "A masterclass in restraint. The chef knows exactly when to step back and let the quality of the local produce speak for itself. We will certainly be returning.",
          date: 'January 8, 2025'
        }
      ],
      chefInfo: {
        name: 'Elias Thorne',
        image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1000&auto=format&fit=crop',
        quote: "Cooking is merely the art of translation—giving voice to the soil.",
        bio_p1: "Growing up on his family's orchard in the Pacific Northwest, Chef Elias Thorne developed an intuitive understanding of seasonality before he ever set foot in a professional kitchen. His culinary philosophy was forged in the fires of acclaimed farm-to-table restaurants across Europe, but his approach remains deeply rooted in the American landscape.",
        bio_p2: "At Lumina, Elias has abandoned the pursuit of complex manipulation in favor of elemental cooking techniques—wood fire, fermentation, and curing. He collaborates intimately with a network of local growers to design menus that reflect micro-seasons, ensuring that every plate honors the exact moment it was harvested."
      },
      galleryImages: [
        { id: 'g1', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1000&auto=format&fit=crop', caption: 'The main dining room at dusk.' },
        { id: 'g2', url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1000&auto=format&fit=crop', caption: 'Hand-crafted ceramics by local artisans.' },
        { id: 'g3', url: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=1000&auto=format&fit=crop', caption: 'Morning prep with fresh herbs.' },
        { id: 'g4', url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1000&auto=format&fit=crop', caption: 'The open hearth kitchen.' },
        { id: 'g5', url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1000&auto=format&fit=crop', caption: 'Wine cellar featuring organic vintages.' },
        { id: 'g6', url: 'https://images.unsplash.com/photo-1505826759037-406b40feb4cd?q=80&w=1000&auto=format&fit=crop', caption: 'Private dining space.' },
        { id: 'g7', url: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=1000&auto=format&fit=crop', caption: 'Harvesting from the garden.' },
        { id: 'g8', url: 'https://images.unsplash.com/photo-1512485800893-b08ec1ea59b1?q=80&w=1000&auto=format&fit=crop', caption: 'Seasonal preserves and ferments.' },
        { id: 'g9', url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1000&auto=format&fit=crop', caption: 'Evening ambiance.' }
      ]
    };

    localStorage.setItem('restaurantData', JSON.stringify(defaultData));
    localStorage.setItem('demoSeeded', 'true');
    console.log('Demo data seeded successfully.');
  }
};