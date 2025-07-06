/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkbg: '#121212',
        darksurface: '#1e1e1e',
        darkborder: '#333333',
        darktext: '#e0e0e0',
        darktextsecondary: '#a0a0a0',
        darkprimary: '#8b5cf6',
        darkprimaryhover: '#7c3aed'
      }
    },
  },
  plugins: [],
};