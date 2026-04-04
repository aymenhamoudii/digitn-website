/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'earth': {
          'parchment': '#f5f2ed',
          'clay': '#bc6c25',
          'moss': '#606c38',
          'stone': '#283618',
          'sand': '#dda15e',
          'ink': '#1a1a1a',
        }
      },
      fontFamily: {
        'serif': ['Fraunces', 'serif'],
        'mono': ['Space Mono', 'monospace'],
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px rgba(26, 26, 26, 1)',
        'brutal-lg': '8px 8px 0px 0px rgba(26, 26, 26, 1)',
        'brutal-hover': '2px 2px 0px 0px rgba(26, 26, 26, 1)',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      }
    },
  },
  plugins: [],
}
