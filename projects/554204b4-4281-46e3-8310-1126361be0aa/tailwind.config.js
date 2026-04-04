/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#2D4A3E',
          50: '#e5ebe8',
          100: '#cbd7d2',
          200: '#9bb1a8',
          300: '#6a8a7d',
          400: '#48695b',
          500: '#2D4A3E',
          600: '#22382f',
          700: '#172520',
          800: '#0b1310',
          900: '#000000'
        },
        beige: {
          DEFAULT: '#F5EDD8',
          50: '#fefdfb',
          100: '#fcfaf4',
          200: '#faf5ea',
          300: '#f7f1df',
          400: '#F5EDD8',
          500: '#e5d7af',
          600: '#d5c186',
          700: '#c5ab5d',
          800: '#b59534',
          900: '#907629'
        },
        terracotta: {
          DEFAULT: '#C4622D',
          50: '#f8ebe4',
          100: '#f1d6c8',
          200: '#e3ae91',
          300: '#d5865a',
          400: '#c4622d',
          500: '#a34f21',
          600: '#823e19',
          700: '#612d11',
          800: '#401d0a',
          900: '#1f0d03'
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
}