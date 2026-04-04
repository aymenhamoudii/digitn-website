# DIGITN Calculator

A production-ready, Material Design calculator built with Vue 3, Pinia, and Vite.

## Features
- **Basic Arithmetic**: Addition, subtraction, multiplication, and division.
- **Material Design**: Intuitive interface with elevations, ripples, and responsive layouts.
- **Themes**: Multiple themes (Light, Dark, Ocean) using CSS Custom Properties.
- **Keyboard Support**: Full number pad and operator support for desktop users.
- **State Management**: Robust state handling with Pinia.
- **Responsive**: Mobile-first design that adapts to all screen sizes.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

### Running Tests
This project includes Vitest for unit testing the core logic.
```bash
npm test
```

## Security & Quality
- **Sanitization**: All inputs are handled as strings and parsed safely.
- **Accessibility**: ARIA labels and live regions for screen readers.
- **Keyboard Navigation**: Fully accessible via keyboard.
- **No Side Effects**: Clean store implementation with no direct DOM manipulation except for theme toggling.
