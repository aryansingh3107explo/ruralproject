/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clay: {
          50: '#fdf8f5',
          100: '#fbeee6',
          200: '#f6dcd0',
          300: '#eebfa9',
          400: '#e09879',
          500: '#d2754f', // Clay earth tone
          600: '#c35c3b',
          700: '#a2462e',
          800: '#823b2b',
          900: '#6a3226',
        },
        pasture: {
          50: '#f3f9f4',
          100: '#e2f2e5',
          200: '#c7e5cc',
          300: '#9ed0a7',
          400: '#6eb37a',
          500: '#4c9859', // Agrarian green
          600: '#3a7d46',
          700: '#306439',
          800: '#295030',
          900: '#23432a',
        },
        mustard: {
          50: '#fefdf3',
          100: '#fdfae6',
          200: '#faf2bf',
          300: '#f5e48b',
          400: '#efd358',
          500: '#e3be2b', // Golden crop/mustard
          600: '#c49a1d',
          700: '#a07718',
          800: '#805d17',
          900: '#694c16',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
