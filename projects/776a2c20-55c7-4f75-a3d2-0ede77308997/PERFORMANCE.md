# Performance Checklist — The Hearth & Grain

Guidance to keep this static site fast, especially when opened via file://

- Images: optimize and export JPEG/WebP variants for production; include width/height attributes when possible.
- Lazy loading: `loading="lazy"` used for gallery/map images; ensure fallbacks for browsers without native support.
- Scripts: Loaded as classic scripts (no `type="module"`) in dependency order to support file://.
- CSS: Critical styles are in `css/style.css`; consider inlining critical hero styles for faster first paint.
- Fonts: Use `font-display:swap` via Google Fonts; consider hosting fonts locally for offline/file:// reliability.
- Map: static-first approach prevents heavy third-party loads until user intent.
- Audit: run Lighthouse and check Time to Interactive, Largest Contentful Paint, and accessibility metrics.

Note: When serving via file://, ES module scripts are blocked by browser CORS policies. This project uses classic scripts and global-scope JS to avoid that issue.
