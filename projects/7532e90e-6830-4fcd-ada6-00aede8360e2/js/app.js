/**
 * Artisan Studio Landing Page
 * Main Application JavaScript
 */

(function() {
    'use strict';

    // === DOM Elements ===
    var header = document.getElementById('header');
    var navToggle = document.getElementById('navToggle');
    var navMenu = document.getElementById('navMenu');
    var navLinks = document.querySelectorAll('.nav__link');
    var contactForm = document.getElementById('contactForm');
    var submitBtn = document.getElementById('submitBtn');
    var formSuccess = document.getElementById('formSuccess');

    // === Header Scroll Effect ===
    function handleHeaderScroll() {
        if (window.scrollY > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
    }

    // === Mobile Navigation ===
    function toggleMobileMenu() {
        var isOpen = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isOpen);
        navMenu.classList.toggle('nav__menu--open');
        document.body.style.overflow = isOpen ? '' : 'hidden';
    }

    function closeMobileMenu() {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('nav__menu--open');
        document.body.style.overflow = '';
    }

    // === Smooth Scroll ===
    function smoothScrollTo(target) {
        var element = document.querySelector(target);
        if (element) {
            var headerHeight = header.offsetHeight;
            var elementPosition = element.getBoundingClientRect().top;
            var offsetPosition = elementPosition + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    function handleNavLinkClick(event) {
        var href = event.currentTarget.getAttribute('href');
        if (href && href.startsWith('#')) {
            event.preventDefault();
            smoothScrollTo(href);
            closeMobileMenu();
        }
    }

    // === Scroll Reveal Animation ===
    function initScrollReveal() {
        var revealElements = document.querySelectorAll('.feature-card, .work-card, .testimonial-card, .section-header');
        
        revealElements.forEach(function(el) {
            el.classList.add('reveal');
        });

        var observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal--visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealElements.forEach(function(el) {
            observer.observe(el);
        });
    }

    // === Form Validation ===
    function validateEmail(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showError(inputId, message) {
        var input = document.getElementById(inputId);
        var errorElement = document.getElementById(inputId + 'Error');
        
        if (input && errorElement) {
            input.classList.add('form-input--error');
            errorElement.textContent = message;
        }
    }

    function clearError(inputId) {
        var input = document.getElementById(inputId);
        var errorElement = document.getElementById(inputId + 'Error');
        
        if (input && errorElement) {
            input.classList.remove('form-input--error');
            errorElement.textContent = '';
        }
    }

    function validateForm() {
        var isValid = true;
        
        // Name validation
        var name = document.getElementById('name').value.trim();
        if (name === '') {
            showError('name', 'Please enter your name');
            isValid = false;
        } else if (name.length < 2) {
            showError('name', 'Name must be at least 2 characters');
            isValid = false;
        } else {
            clearError('name');
        }

        // Email validation
        var email = document.getElementById('email').value.trim();
        if (email === '') {
            showError('email', 'Please enter your email');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        } else {
            clearError('email');
        }

        // Project type validation
        var projectType = document.getElementById('projectType').value;
        if (projectType === '' || projectType === null) {
            showError('projectType', 'Please select a project type');
            isValid = false;
        } else {
            clearError('projectType');
        }

        // Message validation
        var message = document.getElementById('message').value.trim();
        if (message === '') {
            showError('message', 'Please describe your project');
            isValid = false;
        } else if (message.length < 20) {
            showError('message', 'Please provide more details (at least 20 characters)');
            isValid = false;
        } else {
            clearError('message');
        }

        return isValid;
    }

    function handleFormSubmit(event) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Show loading state
        submitBtn.classList.add('btn--loading');
        submitBtn.disabled = true;

        // Simulate form submission
        setTimeout(function() {
            submitBtn.classList.remove('btn--loading');
            submitBtn.disabled = false;
            
            // Show success message
            formSuccess.classList.add('form-success--visible');
            
            // Reset form
            contactForm.reset();
            
            // Store submission in localStorage
            localStorage.setItem('formSubmitted', 'true');
            localStorage.setItem('submissionDate', new Date().toISOString());

            // Hide success message after 5 seconds
            setTimeout(function() {
                formSuccess.classList.remove('form-success--visible');
            }, 5000);
        }, 1500);
    }

    // === Real-time Validation ===
    function initRealTimeValidation() {
        var inputs = ['name', 'email', 'projectType', 'message'];
        
        inputs.forEach(function(inputId) {
            var input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('blur', function() {
                    // Only validate if field has been touched
                    if (input.dataset.touched === 'true') {
                        validateSingleField(inputId);
                    }
                });
                
                input.addEventListener('input', function() {
                    input.dataset.touched = 'true';
                    clearError(inputId);
                });
            }
        });
    }

    function validateSingleField(inputId) {
        var input = document.getElementById(inputId);
        var value = input.value.trim();

        switch (inputId) {
            case 'name':
                if (value === '') {
                    showError('name', 'Please enter your name');
                } else if (value.length < 2) {
                    showError('name', 'Name must be at least 2 characters');
                } else {
                    clearError('name');
                }
                break;
            case 'email':
                if (value === '') {
                    showError('email', 'Please enter your email');
                } else if (!validateEmail(value)) {
                    showError('email', 'Please enter a valid email address');
                } else {
                    clearError('email');
                }
                break;
            case 'projectType':
                if (value === '' || value === null) {
                    showError('projectType', 'Please select a project type');
                } else {
                    clearError('projectType');
                }
                break;
            case 'message':
                if (value === '') {
                    showError('message', 'Please describe your project');
                } else if (value.length < 20) {
                    showError('message', 'Please provide more details (at least 20 characters)');
                } else {
                    clearError('message');
                }
                break;
        }
    }

    // === Keyboard Navigation ===
    function handleKeyboardNavigation(event) {
        // Close mobile menu on Escape
        if (event.key === 'Escape') {
            closeMobileMenu();
        }
    }

    // === Initialize Application ===
    function init() {
        // Initialize demo data first
        if (typeof initDemoData === 'function') {
            initDemoData();
        }

        // Scroll handler
        window.addEventListener('scroll', handleHeaderScroll, { passive: true });
        handleHeaderScroll();

        // Mobile navigation
        if (navToggle) {
            navToggle.addEventListener('click', toggleMobileMenu);
        }

        // Navigation links
        navLinks.forEach(function(link) {
            link.addEventListener('click', handleNavLinkClick);
        });

        // Form submission
        if (contactForm) {
            contactForm.addEventListener('submit', handleFormSubmit);
            initRealTimeValidation();
        }

        // Keyboard events
        document.addEventListener('keydown', handleKeyboardNavigation);

        // Scroll reveal
        initScrollReveal();

        // Handle anchor links on page load
        if (window.location.hash) {
            setTimeout(function() {
                smoothScrollTo(window.location.hash);
            }, 100);
        }
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
