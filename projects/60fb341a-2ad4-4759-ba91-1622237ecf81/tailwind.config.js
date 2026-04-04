/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'silver': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        'cinematic': {
          black: '#050505',
          'black-light': '#121212',
          'white': '#fafafa',
          'silver-primary': '#c0c0c0',
          'silver-accent': '#e5e5e5',
          'silver-dark': '#909090',
        }
      },
      fontFamily: {
        'display': ['Montserrat', 'sans-serif'],
        'body': ['Open Sans', 'sans-serif'],
      },
      animation: {
        'reveal': 'reveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'parallax': 'parallax linear forwards',
      },
      keyframes: {
        reveal: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(192, 192, 192, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(192, 192, 192, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        parallax: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(var(--parallax-distance))' },
        }
      },
      backgroundImage: {
        'gradient-silver': 'linear-gradient(135deg, rgba(192,192,192,0.1) 0%, rgba(229,229,229,0.05) 100%)',
        'gradient-cinematic': 'linear-gradient(to bottom, rgba(5,5,5,0.9) 0%, rgba(18,18,18,0.8) 100%)',
      }
    },
  },
  plugins: [],
}