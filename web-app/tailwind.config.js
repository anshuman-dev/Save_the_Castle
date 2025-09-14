/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'castle-primary': '#8B4513',
        'castle-secondary': '#228B22',
        'castle-accent': '#FFD700',
      }
    },
  },
  plugins: [],
}