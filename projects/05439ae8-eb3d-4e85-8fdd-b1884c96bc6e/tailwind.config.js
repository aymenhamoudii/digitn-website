/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#12100e',
        charcoal: '#1b1714',
        parchment: '#efe4cf',
        champagne: '#d7b56d',
        bronze: '#9d7741',
        ember: '#6f4c2a',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['"Manrope"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 60px rgba(0,0,0,0.28)',
        gold: '0 10px 40px rgba(215,181,109,0.18)',
      },
      backgroundImage: {
        'hero-overlay': 'linear-gradient(90deg, rgba(18,16,14,0.94) 0%, rgba(18,16,14,0.82) 40%, rgba(18,16,14,0.58) 70%, rgba(18,16,14,0.86) 100%)',
      },
    },
  },
  plugins: [],
};
