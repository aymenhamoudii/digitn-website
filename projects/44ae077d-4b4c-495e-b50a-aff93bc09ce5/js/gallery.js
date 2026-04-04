/* Gallery and events rendering with lightbox - global scope only */
(function(){
  var currentIndex = 0;
  var lightboxEl = null;
  function renderGallery(){
    var container = document.getElementById('gallery-grid');
    container.innerHTML = '';
    window.GALLERY_DATA.forEach(function(item, idx){
      var thumb = createEl('div',{class:'gallery-thumb'});
      var btn = createEl('button',{'aria-label':'Open image ' + (idx+1),'type':'button'});
      var img = createEl('img',{src:item.src,alt:item.alt,loading:'lazy'});
      btn.appendChild(img); thumb.appendChild(btn); container.appendChild(thumb);
      btn.addEventListener('click', function(){ openLightbox(idx); });
      btn.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' ') openLightbox(idx); });
    });
  }

  function renderEvents(){
    var el = document.getElementById('events-list');
    el.innerHTML = '';
    (window.EVENTS_DATA||[]).forEach(function(ev){
      var card = createEl('article',{class:'event-card'});
      card.appendChild(createEl('h4',{text:ev.title}));
      card.appendChild(createEl('div',{class:'event-meta',text: new Date(ev.date).toLocaleString()}));
      card.appendChild(createEl('p',{text:ev.description}));
      el.appendChild(card);
    });
  }

  function openLightbox(idx){
    currentIndex = idx;
    if(!lightboxEl){
      lightboxEl = createEl('div',{class:'lightbox open',role:'dialog','aria-modal':'true'});
      var inner = createEl('div',{class:'inner'});
      var img = createEl('img',{});
      inner.appendChild(img);
      var close = createEl('button',{class:'close',ariaLabel:'Close','type':'button',text:'×'});
      close.addEventListener('click', closeLightbox);
      lightboxEl.appendChild(close); lightboxEl.appendChild(inner);
      document.body.appendChild(lightboxEl);
      lightboxEl.addEventListener('click', function(e){ if(e.target === lightboxEl) closeLightbox(); });
      lightboxEl.addEventListener('keydown', function(e){ if(e.key === 'ArrowRight') showNext(); if(e.key === 'ArrowLeft') showPrev(); if(e.key === 'Escape') closeLightbox(); });
    }
    updateLightbox();
    lightboxEl.classList.add('open');
    lightboxEl.style.display = 'flex';
    // trap focus
    var removeTrap = trapFocus(lightboxEl);
    lightboxEl.addEventListener('close', function(){ removeTrap(); closeLightbox(); });
  }
  function updateLightbox(){
    if(!lightboxEl) return;
    var img = lightboxEl.querySelector('img');
    var item = window.GALLERY_DATA[currentIndex];
    img.src = item.src; img.alt = item.alt;
  }
  function closeLightbox(){ if(!lightboxEl) return; lightboxEl.classList.remove('open'); lightboxEl.style.display = 'none'; }
  function showNext(){ currentIndex = (currentIndex + 1) % window.GALLERY_DATA.length; updateLightbox(); }
  function showPrev(){ currentIndex = (currentIndex - 1 + window.GALLERY_DATA.length) % window.GALLERY_DATA.length; updateLightbox(); }

  ready(function(){ renderGallery(); renderEvents(); });
})();
