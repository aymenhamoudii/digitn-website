/* ui.js - handles UI interactions and rendering (global scope) */

onReady(function() {
  // Header year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  var navToggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('primary-menu');
  if (navToggle && menu) {
    navToggle.addEventListener('click', function() {
      var expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      if (!expanded) {
        menu.setAttribute('aria-hidden', 'false');
        accessibleFocus(menu);
      } else {
        menu.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // Smooth scrolling for internal links
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var href = a.getAttribute('href');
      if (href && href.length > 1) {
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({behavior:'smooth', block:'start'});
          // update focus for accessibility
          setTimeout(function() { accessibleFocus(target); }, 600);
        }
      }
    });
  });

  // Render menu items
  var menuGrid = document.getElementById('menu-grid');
  if (menuGrid && Array.isArray(MENU_ITEMS)) {
    menuGrid.innerHTML = '';
    MENU_ITEMS.forEach(function(item) {
      var card = document.createElement('article');
      card.className = 'menu-card';
      card.setAttribute('role', 'listitem');

      var img = document.createElement('img');
      img.src = item.img;
      img.alt = item.name + ' — image';
      img.loading = 'lazy';

      var meta = document.createElement('div');
      meta.className = 'meta';

      var h3 = document.createElement('h3');
      h3.textContent = item.name;

      var desc = document.createElement('p');
      desc.className = 'muted';
      desc.textContent = item.description;

      var price = document.createElement('div');
      price.className = 'price';
      price.textContent = item.price;

      meta.appendChild(h3);
      meta.appendChild(desc);
      meta.appendChild(price);

      card.appendChild(img);
      card.appendChild(meta);

      menuGrid.appendChild(card);
    });
  }

  // Keyboard accessibility for menu (basic)
  var menuLinks = document.querySelectorAll('#primary-menu a');
  menuLinks.forEach(function(link) {
    link.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { link.click(); }
    });
  });

});
