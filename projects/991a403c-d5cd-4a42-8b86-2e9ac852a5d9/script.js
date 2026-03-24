/**
 * Event Landing Page - JavaScript
 * Handles all interactive functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    initNavigation();
    initSmoothScroll();
    initFormHandling();
    initScrollAnimations();
});

/**
 * Navigation functionality
 */
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    // Toggle mobile menu
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Close menu when clicking nav links
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Navbar scroll effect
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.boxShadow = 'var(--shadow-md)';
        } else {
            navbar.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });

    // Active link highlighting
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', function() {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);

            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLink.style.color = 'var(--color-text)';
                } else {
                    navLink.style.color = '';
                }
            }
        });
    });
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            if (href === '#') return;

            e.preventDefault();

            const target = document.querySelector(href);

            if (target) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Form handling with validation
 */
function initFormHandling() {
    const form = document.getElementById('contactForm');
    const modal = document.getElementById('successModal');
    const modalClose = document.querySelector('.modal-close');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Basic validation
            if (!validateForm(data)) {
                return;
            }

            // Simulate form submission
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            // Simulate API call
            setTimeout(function() {
                // Show success modal
                showModal(modal);

                // Reset form
                form.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }

    // Close modal
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            hideModal(modal);
        });
    }

    // Close modal on backdrop click
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideModal(modal);
            }
        });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            hideModal(modal);
        }
    });
}

/**
 * Form validation
 */
function validateForm(data) {
    const errors = [];

    // Name validation
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Please enter a valid name');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        errors.push('Please enter a valid email address');
    }

    // Subject validation
    if (!data.subject) {
        errors.push('Please select a subject');
    }

    // Message validation
    if (!data.message || data.message.trim().length < 10) {
        errors.push('Please enter a message (minimum 10 characters)');
    }

    // Show errors (you could customize this)
    if (errors.length > 0) {
        console.log('Validation errors:', errors);
        return false;
    }

    return true;
}

/**
 * Show modal
 */
function showModal(modal) {
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Hide modal
 */
function hideModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Scroll animations using Intersection Observer
 */
function initScrollAnimations() {
    // Elements to animate
    const animatedElements = document.querySelectorAll(
        '.feature-card, .pricing-card, .about-content, .about-image, .contact-info, .contact-form'
    );

    // Set initial state
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    // Intersection Observer options
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    // Create observer
    const observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, options);

    // Observe elements with staggered delay
    animatedElements.forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });

    // Animate stats numbers
    const stats = document.querySelectorAll('.stat-number');

    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => statsObserver.observe(stat));
}

/**
 * Animate number counting
 */
function animateNumber(element) {
    const target = element.textContent;
    const hasPlus = target.includes('+');
    const hasPercent = target.includes('%');
    const num = parseInt(target.replace(/[^0-9]/g, ''));

    if (isNaN(num)) return;

    let current = 0;
    const increment = num / 50;
    const duration = 1500;
    const stepTime = duration / 50;

    const timer = setInterval(function() {
        current += increment;

        if (current >= num) {
            current = num;
            clearInterval(timer);
        }

        let text = Math.round(current);
        if (hasPlus) text += '+';
        if (hasPercent) text += '%';

        element.textContent = text;
    }, stepTime);
}

/**
 * Optional: Parallax effect for hero section
 */
function initParallax() {
    const hero = document.querySelector('.hero');

    if (hero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const heroCard = document.querySelector('.hero-card');

            if (heroCard) {
                heroCard.style.transform = `translateY(${scrolled * 0.1}px)`;
            }
        });
    }
}

/**
 * Optional: Initialize parallax if desired
 */
// initParallax();
