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
        serif: ['"EB Garamond"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif']
      },
      colors: {
        architectural: {
          dark: '#0A0D12',
          panel: '#121721',
          card: '#181F2C',
          border: '#272F3E',
          accent: '#06B6D4',
          gold: '#F59E0B',
          emerald: '#10B981',
          crimson: '#EF4444'
        }
      }
    },
  },
  plugins: [],
}
