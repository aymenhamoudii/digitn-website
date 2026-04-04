import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rustic: {
          50: '#fdfaf6',
          100: '#f7f0e6',
          200: '#ece0cf',
          300: '#dec6a7',
          400: '#cba17b',
          500: '#b87f55',
          600: '#a46944',
          700: '#89543a',
          800: '#6f4534',
          900: '#5a392d',
          950: '#301d17',
        },
        accent: {
          gold: '#d4af37',
          sage: '#8a9a5b',
          clay: '#a0522d',
        }
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-lato)', 'sans-serif'],
      },
      backgroundImage: {
        'wood-pattern': "url('/images/wood-texture.png')",
        'paper-texture': "url('/images/paper-texture.png')",
      },
    },
  },
  plugins: [],
};
export default config;
