/**
 * Font Randomizer
 *
 * Picks a random typography combo from curated Google Fonts pairings.
 * Each combo has: display (headings), body (text), mono (labels/code).
 * Injected alongside the palette randomizer so every presentation looks unique.
 */

const ALL_FONT_COMBOS = [
  // Classic editorial
  {
    name: "Classic Editorial",
    display: { family: "Playfair Display", weights: "700;800;900", style: "serif" },
    body:    { family: "IBM Plex Sans", weights: "300;400;500;600;700", style: "sans-serif" },
    mono:    { family: "IBM Plex Mono", weights: "400;500;600", style: "monospace" },
  },
  // Modern geometric
  {
    name: "Modern Geometric",
    display: { family: "Space Grotesk", weights: "500;600;700", style: "sans-serif" },
    body:    { family: "Inter", weights: "300;400;500;600;700", style: "sans-serif" },
    mono:    { family: "JetBrains Mono", weights: "400;500;600", style: "monospace" },
  },
  // Elegant serif
  {
    name: "Elegant Serif",
    display: { family: "Cormorant Garamond", weights: "600;700;800", style: "serif" },
    body:    { family: "Source Sans 3", weights: "300;400;500;600;700", style: "sans-serif" },
    mono:    { family: "Source Code Pro", weights: "400;500;600", style: "monospace" },
  },
  // Bold sans
  {
    name: "Bold Sans",
    display: { family: "Plus Jakarta Sans", weights: "600;700;800", style: "sans-serif" },
    body:    { family: "DM Sans", weights: "300;400;500;600;700", style: "sans-serif" },
    mono:    { family: "DM Mono", weights: "400;500", style: "monospace" },
  },
  // Humanist warmth
  {
    name: "Humanist Warmth",
    display: { family: "Fraunces", weights: "700;800;900", style: "serif" },
    body:    { family: "Outfit", weights: "300;400;500;600;700", style: "sans-serif" },
    mono:    { family: "Fira Code", weights: "400;500;600", style: "monospace" },
  },
  // Sharp tech
  {
    name: "Sharp Tech",
    display: { family: "Sora", weights: "600;700;800", style: "sans-serif" },
    body:    { family: "Rubik", weights: "300;400;500;600;700", style: "sans-serif" },
    mono:    { family: "Roboto Mono", weights: "400;500;600", style: "monospace" },
  },
  // Luxury display
  {
    name: "Luxury Display",
    display: { family: "Libre Baskerville", weights: "400;700", style: "serif" },
    body:    { family: "Nunito Sans", weights: "300;400;500;600;700", style: "sans-serif" },
    mono:    { family: "IBM Plex Mono", weights: "400;500;600", style: "monospace" },
  },
  // Clean modern
  {
    name: "Clean Modern",
    display: { family: "Manrope", weights: "600;700;800", style: "sans-serif" },
    body:    { family: "Work Sans", weights: "300;400;500;600;700", style: "sans-serif" },
    mono:    { family: "Inconsolata", weights: "400;500;600", style: "monospace" },
  },
  // Academic classic
  {
    name: "Academic Classic",
    display: { family: "Lora", weights: "600;700", style: "serif" },
    body:    { family: "Karla", weights: "300;400;500;600;700", style: "sans-serif" },
    mono:    { family: "Source Code Pro", weights: "400;500;600", style: "monospace" },
  },
  // Futuristic
  {
    name: "Futuristic",
    display: { family: "Orbitron", weights: "500;600;700;800;900", style: "sans-serif" },
    body:    { family: "Exo 2", weights: "300;400;500;600;700", style: "sans-serif" },
    mono:    { family: "Share Tech Mono", weights: "400", style: "monospace" },
  },
  // Newspaper editorial
  {
    name: "Newspaper Editorial",
    display: { family: "DM Serif Display", weights: "400", style: "serif" },
    body:    { family: "Lato", weights: "300;400;700;900", style: "sans-serif" },
    mono:    { family: "Fira Code", weights: "400;500;600", style: "monospace" },
  },
  // Startup fresh
  {
    name: "Startup Fresh",
    display: { family: "Poppins", weights: "600;700;800;900", style: "sans-serif" },
    body:    { family: "Open Sans", weights: "300;400;500;600;700", style: "sans-serif" },
    mono:    { family: "JetBrains Mono", weights: "400;500;600", style: "monospace" },
  },
  // Craft artisan
  {
    name: "Craft Artisan",
    display: { family: "Merriweather", weights: "700;900", style: "serif" },
    body:    { family: "Josefin Sans", weights: "300;400;500;600;700", style: "sans-serif" },
    mono:    { family: "Courier Prime", weights: "400;700", style: "monospace" },
  },
  // Swiss minimalist
  {
    name: "Swiss Minimalist",
    display: { family: "Albert Sans", weights: "600;700;800", style: "sans-serif" },
    body:    { family: "Figtree", weights: "300;400;500;600;700", style: "sans-serif" },
    mono:    { family: "Roboto Mono", weights: "400;500", style: "monospace" },
  },
  // Contrast duo
  {
    name: "Contrast Duo",
    display: { family: "Bricolage Grotesque", weights: "600;700;800", style: "sans-serif" },
    body:    { family: "Instrument Sans", weights: "400;500;600;700", style: "sans-serif" },
    mono:    { family: "Geist Mono", weights: "400;500;600", style: "monospace" },
  },
];

/**
 * Build a Google Fonts URL for a font combo.
 */
function buildGoogleFontsUrl(combo) {
  const families = [combo.display, combo.body, combo.mono]
    .map((f) => {
      const name = f.family.replace(/ /g, "+");
      return `family=${name}:wght@${f.weights}`;
    })
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

/**
 * Build CSS variable declarations for a font combo.
 */
function buildFontCSS(combo) {
  return {
    serif: `'${combo.display.family}', ${combo.display.style}`,
    sans: `'${combo.body.family}', system-ui, ${combo.body.style}`,
    mono: `'${combo.mono.family}', ${combo.mono.style}`,
  };
}

/**
 * Get a random font combo.
 */
function getRandomFontCombo() {
  const idx = Math.floor(Math.random() * ALL_FONT_COMBOS.length);
  return ALL_FONT_COMBOS[idx];
}

/**
 * Get a random font combo and format as a prompt directive.
 * The fonts are MANDATORY — the AI must use them exactly as given.
 */
function getRandomFontDirective() {
  const combo = getRandomFontCombo();
  return {
    combo,
    directive: `
===== TYPOGRAPHY FOR THIS PRESENTATION =====
Use these exact fonts. Do not substitute other fonts.

Font combo: "${combo.name}"
- Display/Headings: ${combo.display.family} (${combo.display.style})
- Body text: ${combo.body.family} (${combo.body.style})
- Labels/mono: ${combo.mono.family} (${combo.mono.style})

The CSS variables are:
  --serif: '${combo.display.family}', ${combo.display.style}
  --sans: '${combo.body.family}', ${combo.body.style}
  --mono: '${combo.mono.family}', ${combo.mono.style}`,
  };
}

module.exports = { getRandomFontCombo, getRandomFontDirective, buildGoogleFontsUrl, buildFontCSS, ALL_FONT_COMBOS };
