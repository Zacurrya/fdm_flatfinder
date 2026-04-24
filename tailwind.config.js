const { Colors } = require("./constants/Colors");

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
        'fdm-accent': Colors.accent,
        'fdm-bg': Colors.bg,
        'fdm-fg': Colors.fg,
        'fdm-black': Colors.black,
      },
      fontFamily: {
        michroma: ['Michroma_400Regular'],
      }
    },
  },
  plugins: [],
}


