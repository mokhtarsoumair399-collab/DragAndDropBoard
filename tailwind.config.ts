import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        lift: "0 18px 55px -24px rgb(15 23 42 / 0.55)",
      },
    },
  },
  plugins: [],
} satisfies Config;
