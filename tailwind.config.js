/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        poppins: ['var(--font-poppins)'],
      },
      colors: {
        primary: '#0ea5e9',
        secondary: '#8b5cf6',
        accent: '#10b981',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'gradient': 'gradientBG 15s ease infinite',
      },
    },
  },
  plugins: [],
}
