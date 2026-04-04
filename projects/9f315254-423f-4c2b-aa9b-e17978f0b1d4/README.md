# DIGITN AI Calculator

A modern, responsive, dark-themed calculator built with vanilla HTML, CSS, and JavaScript. This project is optimized for performance, accessibility, and clean code standards.

## Features

- **Dark Mode Aesthetic:** Sleek, high-contrast dark theme using CSS variables and HSL colors.
- **Responsive Design:** Adapts smoothly to mobile, tablet, and desktop screens.
- **Core Operations:** Addition, subtraction, multiplication, and division.
- **Advanced Basic Tools:** Percentage calculation, sign toggling (+/-), and decimal support.
- **History Tracking:** Logs previous calculations with persistence via LocalStorage.
- **Keyboard Support:** Full support for physical keypads (0-9, operators, Enter, Backspace, Escape).
- **Copy to Clipboard:** One-click copy for the current result using the Clipboard API.
- **Micro-interactions:** Smooth animations for button presses and panel transitions.

## Project Structure

```text
calculator/
├── index.html          # Semantic HTML structure
├── css/
│   └── style.css       # Dark theme styles & responsive layout
├── js/
│   ├── utils.js        # Global utility functions (Clipboard, Toasts)
│   ├── calculator.js   # Mathematical logic & state management
│   └── app.js          # DOM manipulation & event handling
└── README.md           # Documentation
```

## Setup & Usage

1. **Clone or download** the project folder.
2. **Open `index.html`** in any modern web browser (Chrome, Firefox, Safari, Edge).
   - No local server or build tools required.
   - Works directly via the `file://` protocol.

## Accessibility (WCAG 2.1 AA)

- **Semantic HTML:** Uses appropriate button and section landmarks.
- **ARIA Support:** Includes `aria-label`, `aria-live`, and `aria-expanded` where necessary.
- **Keyboard Navigation:** Fully navigable via Tab and dedicated calculator hotkeys.
- **Color Contrast:** All text meets or exceeds AA contrast ratios for dark themes.

## Technical Highlights

- **No ES Modules:** Built using classic script tags to ensure compatibility with local file loading (no CORS issues).
- **Precision Management:** Handles floating-point arithmetic quirks (e.g., 0.1 + 0.2) and large number formatting.
- **Event Delegation:** Efficiently manages keypad interaction through a single event listener on the grid container.
- **Persistent State:** History survives browser refreshes using `window.localStorage`.

---
Built by **DIGITN AI**.
