// Navigation System for Bella Vista Restaurant Website

export class Navigation {
    constructor() {
        this.navMenu = document.getElementById('nav-menu');
        this.navToggle = document.querySelector('.nav-toggle');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.isMenuOpen = false;

        this.init();
    }

    init() {
        this.bindEvents();
        this.setupActiveLinkTracking();
    }

    bindEvents() {
        // Menu toggle
        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => this.toggleMenu());
        }

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !this.navMenu.contains(e.target) && e.target !== this.navToggle) {
                this.closeMenu();
            }
        });

        // Close menu when clicking nav link
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMenu();
            });
        });

        // Keyboard navigation
        this.navToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMenu();
                this.navToggle.focus();
            }
        });

        // Smooth scroll for anchor links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.slice(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        this.scrollToSection(targetElement, () => {
                            // Update URL without page reload
                            window.history.pushState(null, '', href);
                        });
                    }
                }
            });
        });
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        this.navToggle.setAttribute('aria-expanded', this.isMenuOpen);
        this.navMenu.classList.toggle('active');

        // Prevent body scroll when menu is open
        if (this.isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    closeMenu() {
        if (this.isMenuOpen) {
            this.isMenuOpen = false;
            this.navToggle.setAttribute('aria-expanded', 'false');
            this.navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    setupActiveLinkTracking() {
        // Track scroll position and update active links
        const sections = ['hero', 'menu', 'gallery', 'location'];
        const navLinks = Array.from(this.navLinks);

        const updateActiveLink = () => {
            const scrollPosition = window.scrollY + 100; // Offset for fixed header

            sections.forEach((sectionId, index) => {
                const section = document.getElementById(sectionId);
                const link = navLinks[index];

                if (section) {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.offsetHeight;

                    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                        navLinks.forEach(l => l.classList.remove('active'));
                        link.classList.add('active');
                    }
                }
            });
        };

        // Throttle scroll event for performance
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    updateActiveLink();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Initial check
        updateActiveLink();
    }

    scrollToSection(element, callback) {
        const headerOffset = 80; // Height of fixed navbar
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });

        if (callback) {
            setTimeout(callback, 800); // Wait for scroll animation to complete
        }
    }

    // Public method to close menu programmatically
    close() {
        this.closeMenu();
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Navigation();
});