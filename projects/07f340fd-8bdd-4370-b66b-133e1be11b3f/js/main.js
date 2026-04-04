// ============================================
// THE COPPER FORK - Restaurant Landing Page
// Main JavaScript - Interactions & Animations
// ============================================

(function() {
    'use strict';
    
    // DOM Elements
    const header = document.getElementById('header');
    const mobileToggle = document.getElementById('mobileToggle');
    const nav = document.getElementById('nav');
    const reservationForm = document.getElementById('reservationForm');
    
    // ============================================
    // Header Scroll Effect
    // ============================================
    function handleHeaderScroll() {
        if (!header) return;
        
        const scrollY = window.scrollY || window.pageYOffset;
        
        if (scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    // ============================================
    // Mobile Navigation Toggle
    // ============================================
    function initMobileNav() {
        if (!mobileToggle || !nav) return;
        
        mobileToggle.addEventListener('click', function() {
            const isActive = nav.classList.contains('active');
            
            if (isActive) {
                nav.classList.remove('active');
                mobileToggle.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            } else {
                nav.classList.add('active');
                mobileToggle.classList.add('active');
                mobileToggle.setAttribute('aria-expanded', 'true');
                document.body.style.overflow = 'hidden';
            }
        });
        
        // Close nav when clicking a link
        const navLinks = nav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                nav.classList.remove('active');
                mobileToggle.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
        
        // Close nav on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && nav.classList.contains('active')) {
                nav.classList.remove('active');
                mobileToggle.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }
    
    // ============================================
    // Smooth Scroll for Navigation Links
    // ============================================
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                if (href === '#') return;
                
                e.preventDefault();
                
                const target = document.querySelector(href);
                
                if (target) {
                    const headerHeight = header ? header.offsetHeight : 0;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // ============================================
    // Scroll Animations (Intersection Observer)
    // ============================================
    function initScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe all fade-in elements
        const fadeElements = document.querySelectorAll('.fade-in, .fade-in-up');
        fadeElements.forEach(el => {
            observer.observe(el);
        });
    }
    
    // ============================================
    // Reservation Form Handling
    // ============================================
    function handleReservationSubmit(e) {
        e.preventDefault();
        
        // Get form values
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            guests: document.getElementById('guests').value,
            special: document.getElementById('special').value.trim()
        };
        
        // Validate email
        if (!isValidEmail(formData.email)) {
            alert('Please enter a valid email address.');
            return;
        }
        
        // Store reservation in localStorage
        const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
        reservations.push({
            ...formData,
            id: generateId(),
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('reservations', JSON.stringify(reservations));
        
        // Show success message
        alert(`Thank you, ${formData.name}! Your reservation for ${formData.guests} guests on ${formatDate(formData.date)} at ${formData.time} has been confirmed. We'll send a confirmation email to ${formData.email}.`);
        
        // Reset form
        reservationForm.reset();
        
        // Re-initialize form defaults
        if (window.initReservationForm) {
            window.initReservationForm();
        }
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function generateId() {
        return 'res-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    function formatDate(dateString) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
    
    // ============================================
    // Initialize All Functions
    // ============================================
    function init() {
        // Header scroll
        handleHeaderScroll();
        window.addEventListener('scroll', handleHeaderScroll, { passive: true });
        
        // Navigation
        initMobileNav();
        initSmoothScroll();
        
        // Animations
        initScrollAnimations();
        
        // Form handling
        if (reservationForm) {
            reservationForm.addEventListener('submit', handleReservationSubmit);
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
