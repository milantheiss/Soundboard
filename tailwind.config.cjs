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
        'background': '#5e686c',
        'background-dark-gray': '#434849'
      }
    },
  },
  plugins: [],
}
