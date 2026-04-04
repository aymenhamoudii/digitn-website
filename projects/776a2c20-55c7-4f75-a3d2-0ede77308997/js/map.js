/* Map: static-first, interactive iframe injected on user gesture */
(function(){
  'use strict';
  onReady(function(){
    var open = q('#open-map');
    var container = q('#map-container');
    var staticLink = q('.map-static-link');
    if (!open || !container) return;

    function injectMap(){
      if (container.getAttribute('data-loaded') === 'true') return;
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.019!2d-122.419415!3d37.774929!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQ2JzI5LjgiTiAxMjLCsDI1JzA0LjAiVw!5e0!3m2!1sen!2sus!4v1610000000000';
      iframe.width = '100%'; iframe.height = '360'; iframe.style.border = 0; iframe.setAttribute('loading','lazy'); iframe.setAttribute('title','Interactive map with restaurant location');
      container.appendChild(iframe);
      container.setAttribute('data-loaded','true');
      container.setAttribute('aria-hidden','false');
    }

    open.addEventListener('click', function(){ injectMap(); open.setAttribute('aria-pressed','true'); });

    // If JS disabled fallback: static link exists — nothing else needed
  });
})();
