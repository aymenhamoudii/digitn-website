document.addEventListener('DOMContentLoaded', function() {
    // Initialize menu
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
});