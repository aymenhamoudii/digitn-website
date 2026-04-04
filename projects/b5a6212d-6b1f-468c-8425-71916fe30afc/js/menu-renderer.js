document.addEventListener('DOMContentLoaded', function() {
  const menuContainer = document.getElementById('menu-items-grid');
  const categoryLinks = document.querySelectorAll('.menu-nav-link');

  function renderCategory(category) {
    if (!window.MENU_DATA[category]) return;

    const items = window.MENU_DATA[category];
    menuContainer.innerHTML = items.map(item => `
      <div class="menu-item-card" data-category="${category}">
        <div class="menu-item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="menu-item-details">
          <div class="menu-item-header">
            <h3 class="menu-item-title">${item.name}</h3>
            <span class="menu-item-price">$${item.price}</span>
          </div>
          <p class="menu-item-description">${item.description}</p>
        </div>
      </div>
    `).join('');

    // Trigger animation for new items
    const cards = menuContainer.querySelectorAll('.menu-item-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('visible');
      }, index * 100);
    });
  }

  // Event Listeners for category switching
  categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const category = link.dataset.category;

      // Update active state
      categoryLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Re-render
      menuContainer.style.opacity = '0';
      setTimeout(() => {
        renderCategory(category);
        menuContainer.style.opacity = '1';
      }, 300);
    });
  });

  // Initial render
  if (menuContainer) {
    renderCategory('appetizers');
  }
});
