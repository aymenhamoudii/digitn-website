/* App initializer wiring components together */
(function(){
  ready(function(){
    // Fill current year
    var y = new Date().getFullYear(); var el = document.getElementById('current-year'); if(el) el.textContent = y;

    // Nav toggle
    var navToggle = document.querySelector('.nav-toggle');
    var navList = document.getElementById('primary-menu');
    if(navToggle && navList){
      navToggle.addEventListener('click', function(){
        var expanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', String(!expanded));
        navList.classList.toggle('open');
      });
    }

    // Keyboard skip/focus for hero CTAs
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      a.addEventListener('click', function(e){
        // smooth scroll into view
        var target = document.querySelector(a.getAttribute('href'));
        if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth', block:'start'}); target.setAttribute('tabindex','-1'); target.focus(); }
      });
    });

    // Link reserve buttons in menu handled in menu.js but ensure reservations section visible
    // Prefill reservation date min
    var dateEl = document.getElementById('res-date'); if(dateEl) dateEl.setAttribute('min', todayISO());

    // Accessibility: ensure focus styles
    document.addEventListener('keyup', function(e){ if(e.key === 'Tab') document.body.classList.add('user-is-tabbing'); });

    // Validate localStorage schema
    var keys = Object.keys(localStorage || {});
    if(keys.length && !localStorage.getItem('ftp_v1_bookings')){ window.FTP.utils.log('Local storage initiated'); }
  });
})();
