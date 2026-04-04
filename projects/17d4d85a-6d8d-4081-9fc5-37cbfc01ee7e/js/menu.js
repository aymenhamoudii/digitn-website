const menuItems = [
    { name: 'Spaghetti Carbonara', price: 12.99, description: 'Classic Italian pasta dish.' },
    { name: 'Margherita Pizza', price: 10.99, description: 'Fresh basil, mozzarella, and tomatoes.' },
    { name: 'Caesar Salad', price: 8.99, description: 'Crisp romaine lettuce with a creamy dressing.' },
];

function renderMenu() {
    const menuContainer = document.getElementById('menu');
    menuItems.forEach(item => {
        const menuItemDiv = document.createElement('div');
        menuItemDiv.classList.add('menu-item');
        menuItemDiv.innerHTML = `<h3>${item.name}</h3><p>${item.description}</p><span>$${item.price.toFixed(2)}</span>`;
        menuContainer.appendChild(menuItemDiv);
    });
}

document.addEventListener('DOMContentLoaded', renderMenu);