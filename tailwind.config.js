/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
    "./pages/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./styles/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#F97316",
        accent: "#2DBE6F",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
