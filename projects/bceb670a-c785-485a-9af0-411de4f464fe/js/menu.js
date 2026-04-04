const menuItems = [
    { name: 'Pasta Carbonara', description: 'Classic Italian pasta with a creamy sauce.', price: 12.99, image: 'images/pasta.jpg' },
    { name: 'Caesar Salad', description: 'Fresh lettuce with Caesar dressing and croutons.', price: 8.99, image: 'images/salad.jpg' },
    { name: 'Margherita Pizza', description: 'Delicious pizza with fresh mozzarella and basil.', price: 10.99, image: 'images/pizza.jpg' }
];

const menuContainer = document.querySelector('#menu .grid');

menuItems.forEach(item => {
    const menuItem = document.createElement('div');
    menuItem.className = 'bg-white p-4 rounded shadow';
    menuItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="w-full h-32 object-cover rounded">
        <h3 class="font-semibold">${item.name}</h3>
        <p>${item.description}</p>
        <p class="font-bold">$${item.price.toFixed(2)}</p>
    `;
    menuContainer.appendChild(menuItem);
});