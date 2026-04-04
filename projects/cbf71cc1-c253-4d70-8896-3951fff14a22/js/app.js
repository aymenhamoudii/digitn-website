document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Scrolled State
    const header = document.getElementById('main-header');
    const scrollThreshold = 100;

    const handleScroll = () => {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on initial load

    // 2. Mobile Navigation Toggle
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });
    }

    // Close mobile nav on link click
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    });

    // 3. Digital Menu Rendering
    const menuContainer = document.getElementById('menu-container');
    const menuTabs = document.querySelectorAll('.menu-tab-btn');

    const renderMenu = (category) => {
        const items = menuData[category];
        if (!items || !menuContainer) return;

        // Clear existing items
        menuContainer.innerHTML = '';

        items.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'menu-item';
            itemElement.style.animationDelay = `${index * 0.1}s`;

            const dietaryTags = item.dietary.map(tag => `<span class="dietary-tag">${tag}</span>`).join('');

            itemElement.innerHTML = `
                <div class="menu-item-info">
                    <div class="menu-item-header">
                        <h3 class="menu-item-name">${item.name}</h3>
                        <span class="menu-item-price">${item.price}</span>
                    </div>
                    <p class="menu-item-description">${item.description}</p>
                    <div class="menu-item-dietary">
                        ${dietaryTags}
                    </div>
                </div>
            `;

            menuContainer.appendChild(itemElement);
        });
    };

    // Tab switching logic
    menuTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all
            menuTabs.forEach(t => t.classList.remove('active'));
            // Add to clicked
            tab.classList.add('active');
            // Render category
            const category = tab.getAttribute('data-category');
            renderMenu(category);
        });
    });

    // Initial menu render
    renderMenu('starters');

    // 4. Smooth Scroll for all anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});
