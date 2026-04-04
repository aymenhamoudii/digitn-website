# Scientific Glass Calculator

A premium, production-ready scientific calculator built with a modern glassmorphism aesthetic. Powered by DIGITN AI.

## Features

- **Scientific Functionality**: Support for trigonometry (sin, cos, tan), logarithms (log, ln), powers, roots, factorials, and more.
- **Glassmorphism Design**: High-end UI with backdrop blurs, subtle borders, and smooth animations.
- **Dark & Light Mode**: Seamless theme switching with system persistence using `localStorage`.
- **Calculation History**: Track and recall up to 50 previous calculations via a slide-out panel.
- **Keyboard Support**: Full operational support via physical keyboard for power users.
- **Responsive**: Mobile-first design that adapts beautifully to all screen sizes.
- **Precision**: Handles floating-point arithmetic and provides exponential notation for large/small results.

## Keyboard Shortcuts

- `0-9` : Numbers
- `.` : Decimal point
- `+`, `-`, `*`, `/` : Basic operators
- `Enter` or `=` : Calculate result
- `Backspace` : Delete last character
- `Esc` : Clear calculator

## Setup & Running

1. Simply open `index.html` in any modern web browser.
2. To run the internal test suite, append `?test` to the URL in your browser: 
   `file:///path/to/project/index.html?test`

## Technical Details

- **Architecture**: Modular JavaScript with a class-based Calculator engine.
- **Styling**: Pure CSS using modern properties like `backdrop-filter`, CSS Grid, and HSL color variables.
- **Storage**: Uses `localStorage` for theme and history persistence.
- **Evaluation**: Employs a safe evaluation strategy using Function constructor with strict mode.

## File Structure

- `index.html`: Main HTML structure.
- `style.css`: Comprehensive design system and layout.
- `script.js`: Core calculator logic and UI management.
- `tests.js`: Unit and integration testing suite.
- `README.md`: Setup and documentation.
