import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#fef3ee",
          100: "#fde3d1",
          200: "#fac5a3",
          300: "#f69e6a",
          400: "#f0713a",
          500: "#ea5517",
          600: "#d83e0e",
          700: "#b32c0e",
          800: "#8f2514",
          900: "#742113",
          950: "#3e0e07",
        },
        surface: "#faf9f7",
        muted: "#f0ede9",
      },
    },
  },
  plugins: [],
} satisfies Config;
