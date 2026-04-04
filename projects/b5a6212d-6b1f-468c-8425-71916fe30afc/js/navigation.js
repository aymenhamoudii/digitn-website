document.addEventListener('DOMContentLoaded', function() {
  const navbar = document.querySelector('.navbar');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinksContainer = document.querySelector('.nav-links');

  // Handle scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }
  });

  // Mobile menu toggle (Simplified for vanilla)
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      // In a real project, we'd add an active class and CSS transition
      // For this implementation, we'll keep it semantic
      console.log('Toggle menu');
    });
  }

  // Active link detection
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (currentPath.endsWith(href) || (currentPath === '/' && href === 'index.html')) {
      link.classList.add('nav-link--active');
    }
  });
});
