// menu.js - Global scope, renders and handles 3D menu interactions
function renderMenu() {
    const menuGrid = document.getElementById('menu-grid');
    if (!menuGrid) return;

    // Data should be seeded by demo-data.js
    const menuDataStr = localStorage.getItem('auraMenuData');
    if (!menuDataStr) return; // Wait for initDemoData

    const menuItems = JSON.parse(menuDataStr);
    
    let html = '';
    menuItems.forEach(item => {
        const tagsHtml = item.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        html += `
            <article class="menu-item" tabindex="0" data-id="${item.id}">
                <div class="menu-item-inner">
                    <div class="dish-visual">
                        <img src="${item.image}" alt="${item.name}" class="dish-img" loading="lazy">
                    </div>
                    <div class="dish-info">
                        <h3 class="dish-name">${item.name}</h3>
                        <p class="dish-desc">${item.description}</p>
                        <span class="dish-price">${item.price}</span>
                    </div>
                </div>
                <div class="dish-details">
                    <h4>Chef's Notes</h4>
                    <p class="dish-desc">${item.notes}</p>
                    <div class="tags">${tagsHtml}</div>
                    <button class="btn-neumorphic btn-small" onclick="selectDish('${item.id}')">Reserve Dish</button>
                </div>
            </article>
        `;
    });

    menuGrid.innerHTML = html;
    initMenuInteractions();
}

function initMenuInteractions() {
    const items = document.querySelectorAll('.menu-item');
    
    // Toggle details on click for mobile/touch
    items.forEach(item => {
        item.addEventListener('click', function(e) {
            // Don't trigger if clicking a button inside
            if (e.target.tagName.toLowerCase() === 'button') return;
            
            // Close others
            items.forEach(other => {
                if (other !== item) other.classList.remove('active-details');
            });
            
            this.classList.toggle('active-details');
        });

        // 3D Parallax effect on mousemove
        item.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top;  // y position within the element
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -15; // Max 15deg
            const rotateY = ((x - centerX) / centerX) * 15;  // Max 15deg
            
            this.style.transform = `translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        item.addEventListener('mouseleave', function() {
            this.style.transform = ''; // Reset to CSS default hover state
        });
    });
}

// Global action handler
function selectDish(id) {
    // Scroll to reservation
    const resSection = document.getElementById('reservation');
    if (resSection) {
        resSection.scrollIntoView({ behavior: 'smooth' });
        // Could populate a specific field or show a notification
        console.log(`Dish ${id} selected for reservation context.`);
    }
}
