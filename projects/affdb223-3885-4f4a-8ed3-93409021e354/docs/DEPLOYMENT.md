# Deployment Instructions

This project builds to a static site using Vite. The produced files in the `dist/` directory can be hosted on any static hosting provider (Netlify, Vercel, GitHub Pages, S3 + CloudFront).

Build steps:

1. Install dependencies:
   npm install

2. Create a production build:
   npm run build

3. Preview locally:
   npm run preview

Static hosting notes:
- Ensure your hosting serves index.html for SPA routes (rewrites to /index.html).
- Configure caching: keep index.html short-lived and assets long-lived with fingerprinting.
- For Netlify, a simple _redirects file with "/* /index.html 200" is recommended.

Updating content:
- Menus, gallery images, and events are stored in src/data. Make changes and redeploy.
