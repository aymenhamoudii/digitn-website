// scroll.js - Global scope, handles scroll spy and navigation
function initScrollSpy() {
    const container = document.querySelector('.scroll-container');
    const sections = document.querySelectorAll('.scroll-section');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!container) return;

    // We use the container for scroll events because of our layout
    container.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = container.scrollTop;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            // Check if we've scrolled into the section
            if (scrollPosition >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        // Update active class on nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}
