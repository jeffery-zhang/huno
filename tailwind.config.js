/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./template/**/*.html'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui'), require('@tailwindcss/typography')],
  daisyui: {
    themes: ['nord', 'forest'],
  },
}
