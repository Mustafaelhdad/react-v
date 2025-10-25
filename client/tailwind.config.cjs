// tailwind.config.mjs  (or .js if "type": "module")
import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 500: "#faf5cf" },
        secondary: { 500: "#a37d54" },
      },
      maxWidth: { feed: "600px" },
    },
  },
  plugins: [animate],
};
