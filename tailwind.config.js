/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        greentext: "#10b981",
        background: "#1b1b1b",
        foreground: "#ffffff",
      },
    },
  },
  plugins: [],
} 