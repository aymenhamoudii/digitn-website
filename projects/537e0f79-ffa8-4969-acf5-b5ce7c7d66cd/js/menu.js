// Menu Display System for Bella Vista Restaurant Website

export class MenuSystem {
    constructor() {
        this.menuGrid = document.getElementById('menu-grid');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.currentFilter = 'all';
        this.menuItems = [];

        this.init();
    }

    init() {
        // Load demo data
        this.loadMenuData();

        // Bind events
        this.bindEvents();

        // Initial render
        this.renderMenu();
    }

    loadMenuData() {
        // This would normally come from an API or database
        // For now, we'll use the demo data seeded in demo-data.js
        if (window.demoMenuData && Array.isArray(window.demoMenuData)) {
            this.menuItems = window.demoMenuData;
        } else {
            console.warn('Demo menu data not found, using fallback data');
            this.menuItems = [];
        }
    }

    bindEvents() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.getAttribute('data-category');
                this.setFilter(category);
            });

            // Keyboard navigation support
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const category = e.target.getAttribute('data-category');
                    this.setFilter(category);
                }
            });
        });
    }

    setFilter(category) {
        // Update active state
        this.filterButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });

        const activeButton = document.querySelector(`[data-category="${category}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
            activeButton.setAttribute('aria-selected', 'true');
        }

        this.currentFilter = category;
        this.renderMenu();
    }

    renderMenu() {
        if (!this.menuGrid) return;

        let filteredItems = this.menuItems;

        if (this.currentFilter !== 'all') {
            filteredItems = this.menuItems.filter(item =>
                item.category.toLowerCase() === this.currentFilter
            );
        }

        if (filteredItems.length === 0) {
            this.menuGrid.innerHTML = `
                <div class="no-results">
                    <p>No items found in ${this.currentFilter} category.</p>
                </div>
            `;
            return;
        }

        this.menuGrid.innerHTML = filteredItems.map(item => this.createMenuItemHTML(item)).join('');
    }

    createMenuItemHTML(item) {
        const tags = this.formatTags(item.tags);
        const price = this.formatPrice(item.price);

        return `
            <article class="menu-item" role="article">
                <header class="menu-item-header">
                    <h3 class="menu-item-name">${this.escapeHtml(item.name)}</h3>
                    <span class="menu-item-price">${price}</span>
                </header>
                <p class="menu-item-description">${this.escapeHtml(item.description)}</p>
                ${tags.length > 0 ? `<div class="menu-item-tags">${tags.join('')}</div>` : ''}
            </article>
        `;
    }

    formatTags(tags) {
        if (!tags || !Array.isArray(tags)) return [];

        return tags.map(tag => {
            const tagClass = this.getTagClass(tag);
            return `<span class="tag ${tagClass}" aria-label="${tag}">${this.escapeHtml(tag)}</span>`;
        });
    }

    getTagClass(tag) {
        const tagClasses = {
            'vegetarian': 'vegetarian',
            'vegan': 'vegan',
            'gluten-free': 'gluten-free',
            'dairy-free': 'dairy-free',
            'spicy': 'spicy',
            'signature': 'signature',
            'seasonal': 'seasonal'
        };

        return tagClasses[tag.toLowerCase()] || '';
    }

    formatPrice(price) {
        if (typeof price !== 'number') return '$0.00';

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public methods for external control
    filterByCategory(category) {
        this.setFilter(category);
    }

    searchItems(query) {
        if (!query || query.trim() === '') {
            this.renderMenu();
            return;
        }

        const searchTerm = query.toLowerCase().trim();
        const filteredItems = this.menuItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            (item.ingredients && item.ingredients.some(ingredient =>
                ingredient.toLowerCase().includes(searchTerm)
            ))
        );

        this.currentFilter = 'search';
        this.renderMenu(filteredItems);
    }

    refreshMenu() {
        this.loadMenuData();
        this.renderMenu();
    }
}

// Initialize menu system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MenuSystem();
});