/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#0A0A0B',
          light: '#161618',
          lighter: '#242426',
        },
        bordeaux: {
          DEFAULT: '#4A0E0E',
          dark: '#350A0A',
          light: '#6B1616',
        },
        champagne: {
          DEFAULT: '#E5D3B3',
          dark: '#C8B28B',
          light: '#F2E8D5',
        },
        gold: {
          DEFAULT: '#D4AF37',
          muted: '#AA8A2E',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      letterSpacing: {
        widest: '.25em',
      },
      backgroundImage: {
        'luxury-gradient': 'linear-gradient(to bottom, rgba(10, 10, 11, 0.7), rgba(10, 10, 11, 0.95))',
      }
    },
  },
  plugins: [],
}