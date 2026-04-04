/* map.js - lazy inserts a map iframe into #map when requested or near viewport */

onReady(function() {
  var mapContainer = document.getElementById('map');
  var viewBtn = document.getElementById('view-map');
  var inserted = false;

  function insertMap() {
    if (inserted || !mapContainer) return;
    var iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '320';
    iframe.style.border = '0';
    iframe.loading = 'lazy';
    iframe.title = 'Fristo location map';
    // Use OpenStreetMap static embed with a simple marker view (no API key)
    iframe.src = 'https://www.openstreetmap.org/export/embed.html?bbox=-0.1275%2C51.5072%2C-0.1270%2C51.5076&layer=mapnik';
    iframe.setAttribute('aria-hidden', 'false');
    mapContainer.innerHTML = '';
    mapContainer.appendChild(iframe);
    inserted = true;
    console.info('Map inserted');
  }

  if (viewBtn) {
    viewBtn.addEventListener('click', function() {
      insertMap();
      // Move focus to map for screen reader users
      setTimeout(function() { var iframe = mapContainer.querySelector('iframe'); if (iframe) accessibleFocus(iframe); }, 200);
    });
  }

  // Also try to lazily load when near viewport
  function onScroll() {
    if (inserted) return;
    if (isNearViewport(mapContainer, 400)) {
      insertMap();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  }

  window.addEventListener('scroll', debounce(onScroll, 120));
  window.addEventListener('resize', debounce(onScroll, 180));
  // initial check
  onScroll();
});
