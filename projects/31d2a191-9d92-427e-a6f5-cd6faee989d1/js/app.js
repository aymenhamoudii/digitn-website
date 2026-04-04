/* Main App Controller */
document.addEventListener('DOMContentLoaded', function() {
    // State management
    let currentCategory = 'starters';
    
    // Selectors
    const menuContainer = document.getElementById('menu-container');
    const tabButtons = document.querySelectorAll('.menu-tab-btn');
    const header = document.getElementById('main-header');

    // Initialize
    function init() {
        renderMenu(currentCategory);
        setupEventListeners();
        handleScroll();
    }

    // Scroll Logic
    function handleScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    // Menu Rendering
    function renderMenu(category) {
        menuContainer.classList.add('fade-out');
        
        setTimeout(() => {
            const items = MENU_DATA[category];
            menuContainer.innerHTML = '';
            
            items.forEach(item => {
                const menuItem = document.createElement('div');
                menuItem.className = 'menu-item';
                menuItem.setAttribute('data-id', item.id);
                menuItem.innerHTML = `
                    ${item.tag ? `<span class="menu-item-tag">${item.tag}</span>` : ''}
                    <div class="menu-item-header">
                        <h3 class="menu-item-name">${item.name}</h3>
                        <div class="menu-item-dots"></div>
                        <span class="menu-item-price">£${item.price}</span>
                    </div>
                    <p class="menu-item-description">${item.description}</p>
                    <button class="menu-item-add" aria-label="Add to order">+</button>
                `;
                
                // Add click listener to the entire item or just the button
                menuItem.addEventListener('click', () => {
                    if (window.addToOrder) {
                        window.addToOrder(item);
                        showToast(`${item.name} added to order`);
                    }
                });
                
                menuContainer.appendChild(menuItem);
            });
            
            menuContainer.classList.remove('fade-out');
        }, 300);
    }

    // Toast Notification
    function showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('visible');
        
        setTimeout(() => {
            toast.classList.remove('visible');
        }, 3000);
    }

    // Event Listeners
    function setupEventListeners() {
        window.addEventListener('scroll', handleScroll);

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.getAttribute('data-category');
                if (category === currentCategory) return;
                
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                currentCategory = category;
                renderMenu(category);
            });
        });
    }

    init();
});