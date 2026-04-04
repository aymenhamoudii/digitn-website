// This file runs after the demo data is initialized
function populateMenu() {
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    const menuContainer = document.querySelector('.menu-items');

    menuItems.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('menu-item');
        div.innerHTML = `<h3>${item.name}</h3><p>${item.description}</p><p>Price: $${item.price}</p>`;
        menuContainer.appendChild(div);
    });
}

document.addEventListener('DOMContentLoaded', populateMenu);