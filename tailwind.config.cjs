/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily:{
        'poppins': ['Poppins', 'sans-serif']
      },
      colors: {
        'electric-blue': '#00D7FF',
        'electric-blue-hover': '#00c3e6',
        'background': '#252525',
        'background-dark-gray': '#0f0f0f',
        'special-red': '#FF1F28',
        'special-red-hover': '#e60008'
      }
    },
  },
  plugins: [],
}
