// app.js - Main entry point. Global scope. Loads dependencies and initializes the application.

// Execute initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Seed realistic demo data into localStorage
    // Depends on: js/demo-data.js
    if (typeof initDemoData === 'function') {
        initDemoData();
    } else {
        console.error('initDemoData function not found. Check script loading order.');
    }

    // 2. Initialize scrolling behaviors
    // Depends on: js/scroll.js
    if (typeof initScrollSpy === 'function') {
        initScrollSpy();
    }

    // 3. Render 3D Menu Items
    // Depends on: js/menu.js
    if (typeof renderMenu === 'function') {
        renderMenu();
    }

    // 4. Render Gallery Carousel and Reviews
    // Depends on: js/carousel.js
    if (typeof renderGallery === 'function') {
        renderGallery();
    }
    if (typeof renderReviews === 'function') {
        renderReviews();
    }

    // 5. Initialize Booking Form logic
    // Depends on: js/booking.js
    if (typeof initBookingForm === 'function') {
        initBookingForm();
    }
    
    // Setup smooth scrolling for nav links
    setupSmoothScrolling();
});

// Utility: Smooth scrolling for internal anchor links within our snap container
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link');
    const container = document.querySelector('.scroll-container');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetSection = document.querySelector(targetId);
            if (targetSection && container) {
                // Calculate position relative to container
                const targetPosition = targetSection.offsetTop;
                
                container.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}