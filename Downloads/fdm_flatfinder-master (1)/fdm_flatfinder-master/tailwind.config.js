/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./global.css",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'fdm-accent': '#ccff00',
        'fdm-bg': '#1b1b1b',
        'fdm-fg': '#ffffff',
      },
      fontFamily: {
        michroma: ['Michroma_400Regular'],
      }
    },
  },
  plugins: [],
}


