/* Demo data seeding – runs once */
(function(){
  if(localStorage.getItem('demoSeeded')) return;
  // Menu items – 8 realistic dishes with placeholder images (you can replace with real URLs later)
  const menuItems=[
    {title:'Grilled Salmon', description:'Fresh Atlantic salmon with herb butter', price:22.99, image:'images/menu1.jpg'},
    {title:'Family Platter', description:'Assorted grilled meats, sides & salad – perfect for sharing', price:45.50, image:'images/menu2.jpg'},
    {title:'Margherita Pizza', description:'Classic thin crust pizza with buffalo mozzarella', price:14.75, image:'images/menu3.jpg'},
    {title:'Caesar Salad', description:'Crisp romaine, parmesan, homemade croutons', price:9.99, image:'images/menu4.jpg'},
    {title:'Spaghetti Carbonara', description:'Pasta with pancetta, egg yolk sauce', price:13.60, image:'images/menu5.jpg'},
    {title:'Lemon Herb Chicken', description:'Pan‑seared chicken breast with citrus glaze', price:17.25, image:'images/menu6.jpg'},
    {title:'Chocolate Lava Cake', description:'Warm molten chocolate centre, vanilla ice cream', price:8.50, image:'images/menu7.jpg'},
    {title:'Seasonal Fruit Tart', description:'Fresh berries atop custard, almond crust', price:7.80, image:'images/menu8.jpg'}
  ];
  localStorage.setItem('menuItems',JSON.stringify(menuItems));
  // Gallery – 12 Instagram‑style images with captions
  const galleryImages=[];
  for(let i=1;i<=12;i++){
    galleryImages.push({url:`images/gallery${i}.jpg`, caption:`Harbor Oak moment ${i}`});
  }
  localStorage.setItem('galleryImages',JSON.stringify(galleryImages));
  // Demo reservation – two days from now, party of 4
  const today=new Date();
  const future=new Date(today);
  future.setDate(future.getDate()+2);
  const demoReservation={
    name:'The Johnson Family',
    phone:'555-0199',
    date:future.toISOString().split('T')[0],
    time:'19:00',
    party:4
  };
  localStorage.setItem('reservations',JSON.stringify([demoReservation]));
  // Flag to avoid reseeding
  localStorage.setItem('demoSeeded','true');
})();
