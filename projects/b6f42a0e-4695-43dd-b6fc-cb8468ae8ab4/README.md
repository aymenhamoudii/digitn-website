# Ember Room Restaurant Website

An elegant, sophisticated restaurant website built with React and Tailwind CSS, featuring a dark-luxury aesthetic with warm bronze accents.

## Features

- **Immersive Hero Section** — Full-viewport parallax background with elegant typography
- **Online Menu** — Tabbed navigation with categorized menu items and dietary indicators
- **Photo Gallery** — Masonry grid layout with lightbox modal for full-size viewing
- **About Section** — Restaurant story with asymmetric layout and team information
- **Contact & Reservations** — Interactive reservation form with validation
- **Location & Hours** — Display with embedded map
- **Newsletter Signup** — Email subscription form
- **Fully Responsive** — Mobile-first design that adapts to all screen sizes

## Design

- **Visual Style**: Dark-luxury with sophisticated editorial aesthetic
- **Color Palette**: Deep charcoal backgrounds with warm bronze/gold accents
- **Typography**: Cormorant Garamond (display) + DM Sans (body)
- **Animations**: Scroll-triggered reveal animations with elegant easing

## Tech Stack

- React 18
- Tailwind CSS
- Vite (build tool)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository and navigate to the project:
   ```bash
   cd ember-room-restaurant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

The optimized production files will be in the `dist` folder.

## Project Structure

```
ember-room-restaurant/
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
├── public/
│   └── vite.svg
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── components/
    │   ├── Navbar.jsx
    │   ├── Hero.jsx
    │   ├── MenuSection.jsx
    │   ├── GallerySection.jsx
    │   ├── LightboxModal.jsx
    │   ├── AboutSection.jsx
    │   ├── ContactSection.jsx
    │   └── Footer.jsx
    └── data/
        ├── menuData.js
        └── galleryData.js
```

## Customization

### Colors

Edit the color palette in `tailwind.config.js`:
- `charcoal` — Background shades (950-600)
- `bronze` — Primary accent (500-200)
- `cream` — Text/foreground (50-300)
- `gold` — Secondary accent (400-500)

### Fonts

Google Fonts are loaded via `index.html`. To change fonts:
1. Update the Google Fonts URL in `index.html`
2. Update the `fontFamily` configuration in `tailwind.config.js`

### Content

- Menu items: `src/data/menuData.js`
- Gallery images: `src/data/galleryData.js`
- Contact info: `src/components/ContactSection.jsx` and `src/components/Footer.jsx`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT