/* App init — wires components and performs lightweight accessibility checks */
(function(){
  'use strict';
  onReady(function(){
    // Year in footer
    var y = new Date().getFullYear(); var el = q('#year'); if (el) el.textContent = y;

    // Ensure skip link works
    var skip = q('.skip-link'); if (skip){ skip.addEventListener('click', function(){ q('#main').focus(); }); }

    // Global keyboard: Shift+? focuses search (none) — Reserve: Alt+R focuses contact
    document.addEventListener('keydown', function(e){ if ((e.altKey || e.metaKey) && e.key.toLowerCase() === 'r'){ e.preventDefault(); var c = q('#name'); if (c) c.focus(); } });

    // Simple accessibility audit (console hints)
    (function audit(){
      var issues = [];
      if (!q('meta[name="viewport"]')) issues.push('Missing viewport meta');
      if (!q('a.skip-link')) issues.push('Missing skip link');
      var imgs = qa('img'); imgs.forEach(function(i){ if (!i.alt) issues.push('Image missing alt: '+(i.src||i.outerHTML).slice(0,50)); });
      if (issues.length) console.info('Accessibility hints:', issues); else console.info('Accessibility quick checks passed');
    })();

    // Performance: ensure scripts loaded in order
    (function perf(){
      try{
        if (!window.debounce || !q) console.warn('Utility helpers missing');
        console.info('Scripts loaded — app initialized');
      }catch(e){ console.warn('Initialization warning', e); }
    })();

  });
})();
