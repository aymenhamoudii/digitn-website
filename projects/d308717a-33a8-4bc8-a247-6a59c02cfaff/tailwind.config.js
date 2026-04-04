/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lux-black': '#1a1a1a',
        'lux-charcoal': '#2d2d2d',
        'lux-graphite': '#404040',
        'lux-pewter': '#6b6b6b',
        'lux-silver': '#9ca3af',
        'lux-pearl': '#f5f5f0',
        'lux-ivory': '#fafaf8',
        'lux-cream': '#f0ede6',
        'lux-white': '#ffffff',
        'lux-brass': '#c9a227',
        'lux-brass-light': '#d4b84a',
        'lux-brass-dark': '#a8841f',
        'lux-gold': '#c5a028',
      },
      fontFamily: {
        'display': ['"Cormorant Garamond"', 'serif'],
        'body': ['"DM Sans"', 'sans-serif'],
      },
      fontSize: {
        'xs': 'clamp(0.75rem, 0.7rem + 0.2vw, 0.8rem)',
        'sm': 'clamp(0.875rem, 0.8rem + 0.3vw, 0.95rem)',
        'base': 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',
        'lg': 'clamp(1.125rem, 1rem + 0.5vw, 1.375rem)',
        'xl': 'clamp(1.25rem, 1.1rem + 0.6vw, 1.625rem)',
        '2xl': 'clamp(1.5rem, 1.3rem + 0.8vw, 2rem)',
        '3xl': 'clamp(1.875rem, 1.6rem + 1.2vw, 2.5rem)',
        '4xl': 'clamp(2.25rem, 1.9rem + 1.5vw, 3rem)',
        '5xl': 'clamp(3rem, 2.5rem + 2vw, 4rem)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      boxShadow: {
        'lux-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'lux-md': '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)',
        'lux-lg': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        'lux-xl': '0 20px 25px rgba(0, 0, 0, 0.1), 0 8px 10px rgba(0, 0, 0, 0.04)',
      },
      letterSpacing: {
        'tighter': '-0.05em',
        'tight': '-0.025em',
        'normal': '0',
        'wide': '0.025em',
        'wider': '0.05em',
      },
      transitionTimingFunction: {
        'lux': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}