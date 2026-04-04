/* Global data placeholders for First Time Pizza */
(function(){
  window.MENU_DATA = [
    { id: 'p1', category: 'Pizza', name: 'Margherita', price: 14, description: 'San Marzano tomatoes, fior di latte, fresh basil, extra virgin olive oil.', tags:['Vegetarian'] },
    { id: 'p2', category: 'Pizza', name: 'Pepperoni Classic', price: 16, description: 'Crispy pepperoni, mozzarella, house tomato sauce.', tags:[] },
    { id: 'p3', category: 'Pizza', name: 'Funghi', price: 17, description: 'Wild mushrooms, garlic oil, taleggio, thyme.', tags:['Vegetarian'] },
    { id: 's1', category: 'Starters', name: 'Burrata', price: 12, description: 'Creamy burrata, roasted cherry tomatoes, basil oil.', tags:['Vegetarian','Gluten-Free'] },
    { id: 's2', category: 'Starters', name: 'Garlic Knots', price: 6, description: 'House-made dough knots with herb butter.', tags:['Vegetarian'] },
    { id: 'd1', category: 'Desserts', name: 'Tiramisu', price: 8, description: 'Classic mascarpone, espresso-soaked ladyfingers.', tags:[] }
  ];

  window.GALLERY_DATA = [
    {id:'g1', src:'assets/images/placeholder.jpg', alt:'Wood-fired pizza on a table'},
    {id:'g2', src:'assets/images/placeholder.jpg', alt:'Interior dining space'},
    {id:'g3', src:'assets/images/placeholder.jpg', alt:'Chef preparing pizza'},
    {id:'g4', src:'assets/images/placeholder.jpg', alt:'Close up of pizza slice'}
  ];

  window.EVENTS_DATA = [
    {id:'e1', title:'Wine Pairing Night', date: new Date(new Date().getTime() + 5*24*60*60*1000).toISOString(), description:'Curated wine pairings with our seasonal menu. Limited seats.'},
    {id:'e2', title:'Live Jazz Sunday', date: new Date(new Date().getTime() + 12*24*60*60*1000).toISOString(), description:'Live jazz every Sunday evening. Enjoy special prix-fixe menus.'}
  ];

  window.PAGES = window.PAGES || {};
  window.PAGES.openingHours = {
    monday: '11:00-22:00',
    tuesday: '11:00-22:00',
    wednesday: '11:00-22:00',
    thursday: '11:00-22:00',
    friday: '11:00-23:00',
    saturday: '11:00-23:00',
    sunday: '11:00-21:00'
  };
  window.PAGES.contact = {
    phone: '+1 (555) 555-0123',
    email: 'hello@firsttimepizza.example',
    address: '123 Rustic Lane, Cityville, ST 12345',
    coords: {lat:40.7128, lng:-74.0060}
  };

  window.SOCIAL_FEED = [
    {id:'s1', platform:'Instagram', author:'@firsttimepizza', text:'Weekend special: truffle mushroom pizza 🥂', date: new Date().toISOString()},
    {id:'s2', platform:'Facebook', author:'First Time Pizza', text:'Join us for live jazz this Sunday!', date: new Date().toISOString()}
  ];

})();
