/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        plum: {
          50: "#fbf7ff",
          100: "#f4ecfb",
          200: "#e7d8f3",
          500: "#7f669d",
          600: "#5f4178",
          700: "#4a245f",
          800: "#351448",
        },
        lotus: {
          100: "#ffe8f0",
          400: "#ff5b94",
          500: "#f73f80",
        },
        mint: {
          100: "#e7fbf5",
          500: "#38bfa2",
        },
        skysoft: {
          100: "#e9f5ff",
          500: "#4d9fe8",
        },
      },
      boxShadow: {
        soft: "0 24px 70px rgba(74, 36, 95, 0.14)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
