# Maintenance & Content Update Guide

This document explains how to update menus, gallery images, events, and other developer-managed content.

Menus
- File: src/data/menu.json
- Each dish contains: id, name, course, description, ingredients, price, tags, seasonal
- After editing, run a build and deploy.

Gallery
- File: src/data/gallery.json
- Add objects with id, src (path to image in src/assets or public), alt, caption
- Optimize images (WEBP/JPEG) for web and include multiple resolutions where appropriate.

Events
- File: src/data/events.json
- Event fields: id, title, date (ISO), excerpt, details

Design & Styles
- Tailwind config: tailwind.config.cjs (tokens and theme extensions)
- Component styles live in src/index.css as Tailwind layers.

Accessibility & QA
- Ensure all images include alt text.
- Test keyboard navigation and focus states.
- Use Lighthouse for performance and accessibility checks.

Contacts & Reservations
- Reservations are phone-only. Update phone numbers in ContactCard and Footer components.
