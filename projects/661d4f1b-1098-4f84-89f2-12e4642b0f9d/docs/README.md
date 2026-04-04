# Fristo — Elegant Restaurant (HTML/CSS/JS)

Overview
-------
Fristo is a single-page, elegant restaurant website built as a standalone HTML/CSS/JS project designed to be opened directly via file:// or hosted on any static server.

Structure
--------
- index.html — single-page site with sections: Home, Menu, About, Reservations, Contact
- css/ — styles (normalize, style, responsive)
- js/ — global scripts (utils, data, ui, map, app)
- assets/ — SVG illustrations for logo, hero, menu items, team, contact
- docs/ — README and checklist files

How to run
---------
Open index.html in a modern browser. No build steps required. The page is intentionally built without ES modules so it works over file://.

Where to edit
-------------
- Menu items: edit js/data.js (MENU_ITEMS array)
- Text content: index.html
- Styles: css/style.css and css/responsive.css
- Images: assets/ (SVGs provided)

Notes
-----
- Map embed uses OpenStreetMap iframe and is inserted lazily to keep initial load light.
- Reservation form saves drafts to localStorage and simulates submission (no backend).

License
------
Feel free to adapt and use for demonstration or local hosting.