/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vibrant duotone: deep teal and coral accents
        primary: {
          50: '#e6fcf9',
          100: '#c9faf2',
          200: '#9ef7e0',
          300: '#66e4cb',
          400: '#38d1b0',
          500: '#0ebf9a', // main teal
          600: '#0c9a7d',
          700: '#0a7862',
          800: '#085f4f',
          900: '#064d40',
        },
        accent: {
          50: '#fff5f0',
          100: '#ffdad6',
          200: '#ffb7aa',
          300: '#ff8a75',
          400: '#ff6a52',
          500: '#ff4a2f', // main coral
          600: '#e83b26',
          700: '#c62f1e',
          800: '#9d2518',
          900: '#7b1c12',
        },
        // Tinted neutrals (warm)
        neutral: {
          50: '#fdfaf7',
          100: '#f5f0eb',
          200: '#e9e1d7',
          300: '#ddd3c4',
          400: '#c2b4a1',
          500: '#a6967f',
          600: '#857863',
          700: '#6b5e4d',
          800: '#54493c',
          900: '#41382d',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Source Sans Pro', 'sans-serif'],
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
      },
    },
  },
  plugins: [],
}