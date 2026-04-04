# Ember & Olive - Fine Dining Restaurant Landing Page

A modern, elegant landing page for Ember & Olive, a fine dining restaurant featuring fresh, seasonal cuisine.

## Overview

This is a complete, production-ready landing page built with vanilla HTML, CSS, and JavaScript. It features a sophisticated warm-earth color palette, editorial typography, and thoughtful animations.

## Features

- **Responsive Design**: Mobile-first approach, works seamlessly on all devices
- **Warm Earth Color Palette**: Cream backgrounds, terracotta accents, charcoal text
- **Typography**: Cormorant Garamond (serif headings) + Outfit (sans-serif body)
- **Sections Included**:
  - Hero with food gallery grid
  - About & Story section
  - Menu preview cards
  - Gallery showcase
  - Reservation form
  - Contact & Location

## Quick Start

Open `index.html` directly in your browser — no build step or server required.

```bash
# Or use a local server for development
npx serve .
```

## File Structure

```
landing-page-restaurant/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Complete stylesheet
├── js/
│   └── main.js         # Interactive functionality
└── README.md           # This file
```

## Customization

### Colors

Edit CSS variables in `css/style.css`:

```css
:root {
  --color-cream: #FAF7F2;
  --color-sand: #EDE8E0;
  --color-terracotta: #C4785A;
  --color-charcoal: #2C2926;
  --color-olive: #6B7F5E;
}
```

### Typography

Google Fonts are imported in the HTML head. To change fonts:

1. Visit [Google Fonts](https://fonts.google.com)
2. Select new fonts
3. Replace the `@import` URL in both HTML and CSS

### Images

All images use high-quality Unsplash URLs. To use your own:

1. Replace `src` attributes in `<img>` tags
2. Recommended sizes: 800-1200px width for hero, 600px for cards

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Lazy loading for images below the fold
- Optimized CSS selectors
- Efficient JavaScript with Intersection Observer
- No external dependencies

---

*Ember & Olive — Where fire meets freshness.*