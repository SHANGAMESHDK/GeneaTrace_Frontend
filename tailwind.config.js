/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        brand: { 50: '#ecfdf7', 100: '#d1faec', 200: '#a7f3da', 300: '#6ee7c2', 400: '#34d3a5', 500: '#10b98c', 600: '#059673', 700: '#04785e', 800: '#065f4c', 900: '#064e40', 950: '#022c25' },
        ink: { 50: '#f6f7f9', 100: '#eceef2', 200: '#d5d9e2', 300: '#b1b8c7', 400: '#8791a7', 500: '#68738b', 600: '#535c72', 700: '#444b5d', 800: '#3b404f', 900: '#1c1f28', 950: '#11131a' },
      },
      boxShadow: { card: '0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06)' },
    },
  },
  plugins: [],
};
