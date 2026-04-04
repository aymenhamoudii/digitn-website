/* Gallery: lazy enhancement and accessible lightbox */
(function(){
  'use strict';
  onReady(function(){
    var grid = q('#gallery-grid');
    if (!grid) return;
    var items = qa('.gallery-item', grid);
    var lightbox = q('#lightbox');
    var stage = q('#lightbox-stage');
    var closeBtn = q('.lightbox-close');
    var prevBtn = q('.lightbox-prev');
    var nextBtn = q('.lightbox-next');
    var currentIndex = 0;
    var images = items.map(function(it){ var img = it.querySelector('img'); return img ? img.src : null; });

    // open lightbox
    function openAt(index){
      currentIndex = Math.max(0, Math.min(index, images.length-1));
      stage.innerHTML = '';
      var img = document.createElement('img');
      img.src = images[currentIndex] || 'assets/placeholder.jpg';
      img.alt = items[currentIndex].querySelector('img').alt || '';
      stage.appendChild(img);
      lightbox.setAttribute('aria-hidden','false');
      lightbox.style.display = 'flex';
      // focus management
      closeBtn.focus();
      document.addEventListener('keydown', onKey);
    }

    function close(){
      lightbox.setAttribute('aria-hidden','true');
      lightbox.style.display = 'none';
      stage.innerHTML = '';
      document.removeEventListener('keydown', onKey);
    }

    function onKey(e){
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }

    function prev(){ openAt(currentIndex-1); }
    function next(){ openAt(currentIndex+1); }

    items.forEach(function(btn, i){
      btn.addEventListener('click', function(){ openAt(i); });
    });

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);

    // lazy loading fallback: if browser doesn't support loading=lazy, do IntersectionObserver
    if (!('loading' in HTMLImageElement.prototype)){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(e){ if (e.isIntersecting){ var img = e.target; img.src = img.dataset.src; io.unobserve(img); } });
      }, {rootMargin:'200px'});

      qa('#gallery-grid img').forEach(function(img){ if (img.getAttribute('loading') === 'lazy' && img.dataset.src){ io.observe(img); } });
    }

    // animate on scroll (respect reduced motion)
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced){
      var gitems = qa('.gallery-item');
      var iobs = new IntersectionObserver(function(entries){
        entries.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add('reveal'); iobs.unobserve(en.target); } });
      }, {threshold:0.12});
      gitems.forEach(function(g){ iobs.observe(g); });
    }
  });
})();
