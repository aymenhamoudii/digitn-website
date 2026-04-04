# Portfelio

A high-end, single-page professional portfolio template featuring a sophisticated glassmorphism aesthetic, designed specifically for tech recruiters and engineering managers.

## Features

- **Cyber-Glass Aesthetic**: Modern dark-mode UI with heavy backdrop-filter effects and gradient accents.
- **Glassmorphic Navigation**: Sticky header with blur transitions and active scroll tracking.
- **Project Gallery**: Responsive grid showcase for technical projects with micro-interactions.
- **Theme Engine**: Full support for both dark and light modes with system preference detection and persistence.
- **Responsive Design**: Mobile-first architecture that scales seamlessly from small touchscreens to ultra-wide displays.
- **Performance Optimized**: Vanilla JS and CSS for near-instant load times and zero dependency overhead.

## Setup Instructions

1. **Deploying to Web Server**:
   Upload the entire project folder to any web server (Apache, Nginx, or GitHub Pages).

2. **Local Development**:
   Simply open `index.html` in any modern web browser.
   - Note: The theme engine uses `localStorage`, so the preferences will persist per-origin.

3. **Customizing Projects**:
   Open `js/projects.js` and modify the `projects` array to include your own work, tags, and links.

4. **Updating Personal Info**:
   Modify the content in `index.html` directly to reflect your name, roles, and bio.

## File Structure

- `index.html`: Main structure and content.
- `css/`: Global styles, navigation, gallery, and theme overrides.
- `js/`: Core logic for theme management, project rendering, and navigation.

## Technical Details

- **Typography**: Space Grotesk (Headings) and Inter (Body).
- **Icons**: Inline SVG for zero external requests.
- **Browser Support**: Compatible with all modern Chromium-based browsers, Firefox, and Safari.

Built with DIGITN AI.
