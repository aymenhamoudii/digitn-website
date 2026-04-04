# FitTrackr Landing Page

A modern, conversion-focused landing page for FitTrackr - a fitness tracking SaaS product. Built with React, Tailwind CSS, and Framer Motion.

## Features

- **Modern Design**: Clean, professional aesthetic with the Inter font family
- **Responsive**: Works perfectly on mobile, tablet, and desktop
- **Animated**: Smooth scroll-triggered animations using Framer Motion
- **Conversion-Focused**: Multiple CTAs throughout the page
- **Accessible**: Semantic HTML, proper heading hierarchy, keyboard navigation

## Sections

1. **Navigation** - Sticky navbar with logo, links, and CTA buttons
2. **Hero** - Bold headline, subtext, dual CTAs, and dashboard mockup
3. **Social Proof** - Partner logos in grayscale
4. **Features** - 6 feature cards in a responsive grid
5. **How It Works** - 3-step horizontal timeline
6. **Pricing** - 3 pricing tiers with annual/monthly toggle
7. **Testimonials** - 3 diverse testimonial cards
8. **FAQ** - Accordion-style frequently asked questions
9. **Final CTA** - Full-width conversion banner
10. **Footer** - 4-column layout with links and social icons

## Tech Stack

- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Vite** - Build tool

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd fittrackr-landing

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## Project Structure

```
fittrackr-landing/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── SocialProof.jsx
│   │   ├── Features.jsx
│   │   ├── HowItWorks.jsx
│   │   ├── Pricing.jsx
│   │   ├── Testimonials.jsx
│   │   ├── FAQ.jsx
│   │   ├── CTA.jsx
│   │   └── Footer.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Customization

### Colors

The primary color is `#2563EB` (blue) and accent is `#10B981` (green). These are defined in `tailwind.config.js` and can be adjusted there.

### Fonts

The font family is Inter, loaded from Google Fonts in `index.html`. You can change this by updating the font import and Tailwind config.

## License

MIT