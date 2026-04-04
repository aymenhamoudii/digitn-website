/**
 * Presentation Assembler — Pure HTML/CSS (No Reveal.js)
 *
 * Uses CSS scroll-snap for slide navigation, 100vw/100vh for full-screen slides,
 * and vanilla JS for keyboard/touch/click navigation. No external JS framework needed.
 * Every slide is just a <section> that fills the viewport perfectly on ANY screen.
 */

/**
 * Generate CSS custom properties from a palette object and optional font config.
 */
function paletteToCSS(palette, fonts) {
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const bg = palette.bg || '#08090f';
  const bg2 = palette.bg2 || lighten(bg, 0.03);
  const surface = palette.surface || lighten(bg, 0.06);
  const surface2 = lighten(bg, 0.10);
  const accent1 = palette.accent1 || '#4f8ef7';
  const accent2 = palette.accent2 || '#e0734a';
  const accent3 = palette.accent3 || '#c9a44a';
  const t1 = palette.text || '#dde2f0';
  const t2 = palette.text2 || hexToRgba(t1, 0.6);
  const t3 = hexToRgba(t1, 0.3);

  const fontSerif = fonts?.serif || "'Playfair Display', Georgia, serif";
  const fontSans = fonts?.sans || "'IBM Plex Sans', system-ui, sans-serif";
  const fontMono = fonts?.mono || "'IBM Plex Mono', monospace";

  return `:root {
    --bg: ${bg};
    --bg2: ${bg2};
    --surface: ${surface};
    --surface2: ${surface2};
    --border: rgba(255,255,255,.07);
    --border-md: rgba(255,255,255,.11);
    --accent1: ${accent1};
    --accent1-dim: ${hexToRgba(accent1, 0.18)};
    --accent2: ${accent2};
    --accent2-dim: ${hexToRgba(accent2, 0.18)};
    --accent3: ${accent3};
    --accent3-dim: ${hexToRgba(accent3, 0.18)};
    --t1: ${t1};
    --t2: ${t2};
    --t3: ${t3};
    --mono: ${fontMono};
    --sans: ${fontSans};
    --serif: ${fontSerif};
  }`;
}

function lighten(hex, amount) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  r = Math.min(255, Math.round(r + (255 - r) * amount));
  g = Math.min(255, Math.round(g + (255 - g) * amount));
  b = Math.min(255, Math.round(b + (255 - b) * amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Minimal shell CSS — only the structural essentials.
 * The AI generates ALL visual CSS itself via inline styles.
 * This shell handles: reset, scroll-snap, section sizing, stagger animation.
 *
 * FLUID RESPONSIVE DESIGN: Slides are designed fluidly without fixed pixel widths
 * so they adapt perfectly to any screen size via CSS Grid, Flexbox wrapping,
 * and clamp() typography automatically.
 */
const COMPONENT_CSS = `
  /* ─── Reset ─── */
  ::-webkit-scrollbar{display:none}
  *{scrollbar-width:none;-ms-overflow-style:none;box-sizing:border-box;margin:0;padding:0}
  html{overflow-y:scroll;overflow-x:hidden;scroll-behavior:smooth;scroll-snap-type:y mandatory}
  body{background:var(--bg);color:var(--t1);font-family:var(--sans);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}

  /* ─── Slide wrapper (viewport-sized snap target) ─── */
  .slide-wrap{width:100vw;height:100vh;scroll-snap-align:start;scroll-snap-stop:always;display:flex;align-items:center;justify-content:center;overflow:hidden;background:var(--bg);position:relative}

  /* ─── Slide (fluid responsive canvas) ─── */
  section{width:100%;height:100%;display:flex;flex-direction:column;position:relative;overflow:hidden}

  /* ─── Stagger animation (.s container) ─── */
  .s{display:flex;flex-direction:column;flex:1;min-height:0;padding:6vh 6vw;box-sizing:border-box;overflow:hidden}
  .s>*{opacity:0;transform:translateY(18px);transition:opacity .5s ease,transform .5s ease}
  .slide-wrap.active .s>*{opacity:1;transform:translateY(0)}
  .slide-wrap.active .s>*:nth-child(1){transition-delay:.03s}
  .slide-wrap.active .s>*:nth-child(2){transition-delay:.09s}
  .slide-wrap.active .s>*:nth-child(3){transition-delay:.15s}
  .slide-wrap.active .s>*:nth-child(4){transition-delay:.21s}
  .slide-wrap.active .s>*:nth-child(5){transition-delay:.27s}
  .slide-wrap.active .s>*:nth-child(6){transition-delay:.33s}
  .slide-wrap.active .s>*:nth-child(7){transition-delay:.39s}
  .slide-wrap.active .s>*:nth-child(8){transition-delay:.45s}

  /* ─── Centering utility ─── */
  .cx{display:flex;justify-content:center;align-items:center;text-align:center}

  /* ─── Speaker notes (hidden) ─── */
  aside.notes{display:none!important}

  /* ─── Slide counter ─── */
  #slide-counter{position:fixed;bottom:16px;right:24px;font-family:var(--mono);font-size:13px;color:var(--t3);background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:6px 14px;z-index:100;pointer-events:none}

  /* ─── Progress bar ─── */
  #progress{position:fixed;top:0;left:0;height:3px;background:var(--accent1);z-index:100;transition:width .3s ease}

  /* ─── Print/PDF Styles ─── */
  @media print {
    ::-webkit-scrollbar { display: none !important; }
    html, body { overflow: visible !important; scroll-snap-type: none !important; margin: 0 !important; padding: 0 !important; }
    body { background-color: var(--bg) !important; -webkit-print-color-adjust: exact; color-adjust: exact; }
    .slide-wrap { width: 100vw !important; height: 100vh !important; scroll-snap-align: none !important; page-break-after: always !important; page-break-inside: avoid !important; }
    .slide-wrap:last-child { page-break-after: auto !important; }
    .slide-wrap.active .s>*, .slide-wrap .s>* { opacity: 1 !important; transform: none !important; transition: none !important; }
    #slide-counter, #progress { display: none !important; }
  }
`;

/**
 * Vanilla JS for keyboard/click navigation + IntersectionObserver for slide activation.
 * No framework needed.
 */
const SLIDE_JS = `
<script>
(function(){
  const wraps = document.querySelectorAll('.slide-wrap');
  const sections = document.querySelectorAll('.slide-wrap > section');
  const total = wraps.length;
  const counter = document.getElementById('slide-counter');
  const progress = document.getElementById('progress');
  let current = 0;

  // IntersectionObserver: mark the visible slide-wrap as .active (triggers CSS animations)
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && e.intersectionRatio > 0.5) {
        wraps.forEach(w => w.classList.remove('active'));
        e.target.classList.add('active');
        current = Array.from(wraps).indexOf(e.target);
        if (counter) counter.textContent = (current+1) + ' / ' + total;
        if (progress) progress.style.width = ((current+1)/total*100) + '%';
      }
    });
  }, { threshold: 0.5 });
  wraps.forEach(w => obs.observe(w));

  // Activate first slide immediately
  if (wraps[0]) wraps[0].classList.add('active');
  if (counter) counter.textContent = '1 / ' + total;
  if (progress) progress.style.width = (1/total*100) + '%';

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      if (current < total - 1) wraps[current + 1].scrollIntoView({ behavior: 'smooth' });
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      if (current > 0) wraps[current - 1].scrollIntoView({ behavior: 'smooth' });
    } else if (e.key === 'Home') {
      e.preventDefault();
      wraps[0].scrollIntoView({ behavior: 'smooth' });
    } else if (e.key === 'End') {
      e.preventDefault();
      wraps[total - 1].scrollIntoView({ behavior: 'smooth' });
    } else if (e.key === 'f' || e.key === 'F11') {
      e.preventDefault();
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    }
  });
})();
</script>`;

/**
 * Assemble a complete presentation from individual slides.
 *
 * @param {string[]} slides - Array of slide HTML strings (each is a <section>...</section>)
 * @param {object} palette - Color palette object
 * @param {object} config - { title, lang, fontsUrl, fontCSS }
 * @returns {string} Complete self-contained HTML
 */
function assemblePresentation(slides, palette, config = {}) {
  const title = config.title || 'DIGITN Presentation';
  const lang = config.lang || 'en';
  const fontsUrl = config.fontsUrl || "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700;800;900&display=swap";
  const paletteCSS = paletteToCSS(palette, config.fontCSS);

  // Wrap each <section> in a .slide-wrap for CSS scaling
  const wrappedSlides = slides.map(slide => `<div class="slide-wrap">\n    ${slide}\n  </div>`);

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${fontsUrl}" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>
    ${paletteCSS}
    ${COMPONENT_CSS}
  </style>
</head>
<body>
  <div id="progress" style="width:0"></div>
  <div id="slide-counter">1 / ${slides.length}</div>
  ${wrappedSlides.join('\n  ')}
${SLIDE_JS}
</body>
</html>`;
}

/**
 * Assemble a single slide for live preview during building.
 * No navigation, no counter — just the one slide filling the viewport.
 *
 * @param {string} slideHtml - The <section> HTML for one slide
 * @param {object} palette - Color palette object
 * @param {object} [config] - { fontsUrl, fontCSS }
 * @returns {string} Complete HTML page showing one slide
 */
function assembleSingleSlide(slideHtml, palette, config = {}) {
  const fontsUrl = config.fontsUrl || "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700;800;900&display=swap";
  const paletteCSS = paletteToCSS(palette, config.fontCSS);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${fontsUrl}" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>
    ${paletteCSS}
    ${COMPONENT_CSS}
    /* Single slide: show animations immediately, hide nav */
    html{scroll-snap-type:none;overflow:hidden}
    .s>*{opacity:1!important;transform:none!important;transition:none!important}
    #slide-counter,#progress{display:none!important}
    .slide-wrap{scroll-snap-align:unset;scroll-snap-stop:unset}
    .slide-wrap.active .s>*,.s>*{opacity:1!important;transform:none!important}
  </style>
</head>
<body>
  <div class="slide-wrap active">
    ${slideHtml}
  </div>
</body>
</html>`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = { assemblePresentation, assembleSingleSlide, paletteToCSS, COMPONENT_CSS };
