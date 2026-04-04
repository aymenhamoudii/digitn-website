module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'hsl(210 14% 98%)',
          100: 'hsl(210 12% 92%)',
          200: 'hsl(210 10% 80%)',
          300: 'hsl(210 8% 68%)',
          400: 'hsl(210 7% 56%)',
          500: 'hsl(210 6% 44%)',
          600: 'hsl(210 6% 38%)',
          700: 'hsl(210 6% 30%)',
          800: 'hsl(210 6% 22%)',
          900: 'hsl(210 6% 14%)'
        },
        neutral: {
          50: 'hsl(0 0% 98%)',
          100: 'hsl(0 0% 96%)',
          200: 'hsl(0 0% 90%)',
          300: 'hsl(0 0% 80%)',
          400: 'hsl(0 0% 65%)',
          500: 'hsl(0 0% 50%)',
          700: 'hsl(0 0% 25%)',
          900: 'hsl(0 0% 10%)'
        },
        accent: {
          500: 'hsl(20 90% 50%)'
        },
        success: 'hsl(142 71% 45%)',
        warning: 'hsl(38 92% 50%)',
        error: 'hsl(354 70% 50%)'
      },
      spacing: {
        4: '1rem',
        6: '1.5rem',
        8: '2rem',
        12: '3rem'
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 6px 18px rgba(0,0,0,0.08)',
        lg: '0 20px 40px rgba(0,0,0,0.12)'
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        serif: ['Merriweather', 'serif']
      }
    }
  },
  plugins: [],
};
