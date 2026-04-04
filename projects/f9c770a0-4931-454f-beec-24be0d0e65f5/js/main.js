// Ember & Olive - Restaurant Landing Page
// Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
  initNavigation();
  initScrollReveal();
  initReservationForm();
  initSmoothScroll();
  initHeroAnimations();
});

// Navigation functionality
function initNavigation() {
  const nav = document.getElementById('mainNav');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  
  // Scroll effect for navigation
  let lastScroll = 0;
  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });
  
  // Mobile menu toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
      document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close menu on link click
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
    
    // Close menu on outside click
    document.addEventListener('click', function(e) {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
}

// Scroll reveal animations
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.about, .menu, .gallery, .reservation, .contact');
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
        setTimeout(function() {
          entry.target.classList.add('visible');
        }, 100);
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  revealElements.forEach(function(el) {
    revealObserver.observe(el);
  });
}

// Reservation form handling
function initReservationForm() {
  const form = document.getElementById('reservationForm');
  const dateInput = document.getElementById('resDate');
  
  // Set minimum date to today
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    dateInput.value = today;
  }
  
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoading = submitBtn.querySelector('.btn-loading');
      
      // Show loading state
      submitBtn.disabled = true;
      btnText.style.display = 'none';
      btnLoading.style.display = 'inline';
      
      // Collect form data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      // Simulate form submission
      setTimeout(function() {
        // Reset form
        form.reset();
        
        // Show success message
        showNotification('Reservation request received! We will confirm via email shortly.', 'success');
        
        // Reset button
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
      }, 1500);
    });
  }
}

// Notification system
function showNotification(message, type) {
  // Remove existing notification
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'notification notification-' + type;
  notification.textContent = message;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? '#6B7F5E' : '#C4785A'};
    color: white;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
    max-width: 320px;
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 4 seconds
  setTimeout(function() {
    notification.style.animation = 'slideOut 0.3s ease-out forwards';
    setTimeout(function() {
      notification.remove();
    }, 300);
  }, 4000);
}

// Add notification animations - only once
function initNotificationStyles() {
  if (document.getElementById('notification-animations')) {
    return; // Already added
  }
  
  const notificationStyle = document.createElement('style');
  notificationStyle.id = 'notification-animations';
  notificationStyle.textContent = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes slideOut {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(100px);
      }
    }
  `;
  document.head.appendChild(notificationStyle);
}

// Initialize notification styles on load
initNotificationStyles();

// Smooth scroll for anchor links
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(function(link) {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        e.preventDefault();
        
        const navHeight = document.getElementById('mainNav') ? 
          document.getElementById('mainNav').offsetHeight : 0;
        
        const targetPosition = targetElement.getBoundingClientRect().top + 
          window.pageYOffset - navHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Hero section entrance animations
function initHeroAnimations() {
  const hero = document.getElementById('hero');
  
  if (hero) {
    // Add parallax effect to hero images
    window.addEventListener('scroll', function() {
      const scrolled = window.pageYOffset;
      const heroImages = hero.querySelectorAll('.hero-image img');
      
      heroImages.forEach(function(img, index) {
        const speed = 0.05 + (index * 0.02);
        img.style.transform = 'translateY(' + (scrolled * speed) + 'px)';
      });
    });
  }
}

// Lazy load images with Intersection Observer
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const img = entry.target;
        
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
        
        img.classList.add('loaded');
        imageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px'
  });
  
  document.querySelectorAll('img[data-src]').forEach(function(img) {
    imageObserver.observe(img);
  });
}
