export const menuCategories = [
  { id: 'starters', name: 'Starters', label: 'To Begin' },
  { id: 'mains', name: 'Mains', label: 'Main Course' },
  { id: 'desserts', name: 'Desserts', label: 'Sweet Finishes' },
  { id: 'drinks', name: 'Drinks', label: 'Libations' },
]

export const menuItems = {
  starters: [
    {
      name: 'Charred Octopus',
      description: 'Grilled octopus, smoked potato purée, crispy capers, lemon oil',
      price: '$18',
      dietary: ['GF'],
    },
    {
      name: 'Beef Tartare',
      description: 'Hand-cut prime beef, quail egg, cornichons, Dijon mustard, crostini',
      price: '$22',
      dietary: [],
    },
    {
      name: 'Burrata & Heirloom Tomatoes',
      description: 'Fresh burrata, vine-ripened tomatoes, aged balsamic, basil',
      price: '$16',
      dietary: ['V', 'GF'],
    },
    {
      name: 'Seared Scallops',
      description: 'Pan-seared diver scallops, cauliflower purée, brown butter, sage',
      price: '$24',
      dietary: ['GF'],
    },
    {
      name: 'French Onion Soup',
      description: 'Caramelized onions, rich beef broth, Gruyère crouton',
      price: '$14',
      dietary: [],
    },
  ],
  mains: [
    {
      name: 'Dry-Aged Ribeye',
      description: '28-day dry-aged prime ribeye, truffle butter, roasted marrow, seasonal vegetables',
      price: '$58',
      dietary: ['GF'],
    },
    {
      name: 'Pan-Roasted Salmon',
      description: 'Atlantic salmon, citrus glaze, quinoa salad, asparagus',
      price: '$38',
      dietary: ['GF'],
    },
    {
      name: 'Braised Short Rib',
      description: 'Red wine braised short rib, celery root purée, glazed baby carrots',
      price: '$44',
      dietary: ['GF'],
    },
    {
      name: 'Roasted Chicken',
      description: 'Free-range chicken, herb jus, whipped potatoes, haricots verts',
      price: '$34',
      dietary: ['GF'],
    },
    {
      name: 'Lobster Risotto',
      description: 'Maine lobster, Carnaroli rice, saffron, mascarpone, chives',
      price: '$48',
      dietary: ['GF'],
    },
    {
      name: 'Wild Mushroom Pasta',
      description: 'House-made pappardelle, forest mushrooms, Parmesan, truffle oil',
      price: '$28',
      dietary: ['V'],
    },
  ],
  desserts: [
    {
      name: 'Chocolate Lava Cake',
      description: 'Valrhona chocolate, vanilla bean ice cream, raspberry coulis',
      price: '$14',
      dietary: ['V'],
    },
    {
      name: 'Crème Brûlée',
      description: 'Classic vanilla custard, caramelized sugar, fresh berries',
      price: '$12',
      dietary: ['V', 'GF'],
    },
    {
      name: 'Seasonal Tart',
      description: 'Buttery pastry, pastry cream, seasonal fruit, mint',
      price: '$13',
      dietary: ['V'],
    },
    {
      name: 'Cheese Selection',
      description: 'Artisanal cheeses, honeycomb, fig compote, crackers',
      price: '$18',
      dietary: ['V'],
    },
  ],
  drinks: [
    {
      name: 'Ember Old Fashioned',
      description: 'Bourbon, smoked maple, aromatic bitters, orange',
      price: '$16',
      dietary: ['V', 'GF'],
    },
    {
      name: 'Wildflower Martini',
      description: 'Gin, elderflower, cucumber, lemon, lavender',
      price: '$15',
      dietary: ['V', 'GF'],
    },
    {
      name: 'Reserve Wine',
      description: 'Ask your server about our curated selection',
      price: 'From $14',
      dietary: ['V', 'GF'],
    },
    {
      name: 'Artisan Coffee',
      description: 'Locally roasted, available espresso or drip',
      price: '$5',
      dietary: ['V', 'GF'],
    },
  ],
}