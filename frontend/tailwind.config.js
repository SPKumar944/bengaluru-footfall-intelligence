/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        serif: ['"Newsreader"', 'Georgia', 'serif'],
      },
      colors: {
        azure: {
          50: '#F0F5FD',
          100: '#E1EDFB',
          200: '#C7DEF7',
          300: '#8AAFFA',
          400: '#5480F0',
          500: '#2A5CDC',
          600: '#0040B7',
          700: '#00308C',
          800: '#00256D',
          900: '#001B52',
        },
        ink: {
          0: '#FFFFFF',
          50: '#F7F9FC',
          100: '#EEF2F8',
          200: '#E1E8F2',
          300: '#93A2B7',
          400: '#5C6B82',
          500: '#54657D',
          600: '#3C4C63',
          700: '#314054',
          800: '#1E2939',
          900: '#141D2C',
          950: '#0D1521',
        },
        paper: {
          0: '#FFFFFF',
          50: '#F7F9FC',
          100: '#EEF2F8',
          200: '#E1E8F2',
        },
        violet: {
          200: '#DDD6FE',
          300: '#B7AAFF',
          400: '#9984F7',
          500: '#7B68F0',
          600: '#5B45D6',
          700: '#4733AE',
        }
      }
    },
  },
  plugins: [],
}
