/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50: '#fdf2f4',
          100: '#fce7eb',
          200: '#f9ced8',
          300: '#f4a4b8',
          400: '#eb7096',
          500: '#df4677',
          600: '#c52b5f',
          700: '#a3204d',
          800: '#861d42',
          900: '#721b3d',
          950: '#45091f',
        },
        gold: {
          50: '#fefceb',
          100: '#fdf8c8',
          200: '#fbf08b',
          300: '#f9e34c',
          400: '#f7d526',
          500: '#e6b60f',
          600: '#c78d0a',
          700: '#9c650b',
          800: '#815012',
          900: '#6d4116',
          950: '#3f2109',
        },
        cream: {
          50: '#fdfbf7',
          100: '#f9f5ed',
          200: '#f2ead8',
          300: '#e9dab7',
          400: '#dcc592',
          500: '#d0af74',
        },
        charcoal: {
          700: '#3d3d3d',
          800: '#2b2b2b',
          900: '#1a1a1a',
          950: '#121212',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold': '0 4px 14px 0 rgba(230, 182, 15, 0.39)',
        'burgundy': '0 4px 14px 0 rgba(114, 27, 61, 0.25)',
      },
      animation: {
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
