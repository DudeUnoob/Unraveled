/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/popup/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        unravel: {
          bg: "#E2E6C1",
          card: "#fffef9",
          ink: "#1f2522",
          accent: "#136f50",
          warn: "#c88b2b",
          danger: "#9e2a2b",
        },
      },
      boxShadow: {
        card: "0 8px 20px rgba(17, 38, 30, 0.08)",
      },
    },
  },
  plugins: [],
};
