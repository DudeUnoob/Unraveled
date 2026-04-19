/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/popup/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        unravel: {
          bg: "#fcf9ee",
          card: "#fffef9",
          ink: "#373313",
          accent: "#5f6642",
          "accent-dark": "#5c6c47",
          olive: "#6b705c",
          tan: "#65603c",
          warn: "#c88b2b",
          danger: "#9e2a2b",
          cream: "#fcf9ee",
          score: "rgba(247,237,184,0.66)",
          "trend-blue": "#9bb9d0",
          "cpw-pink": "#faf8ef",
        },
      },
      fontFamily: {
        stix: ['"STIX Two Text"', 'serif'],
        epilogue: ['Epilogue', 'sans-serif'],
      },
      boxShadow: {
        card: "0 8px 20px rgba(17, 38, 30, 0.08)",
        popup: "0px 20px 48px 0px rgba(55,51,19,0.12)",
        stat: "0px 4px 4px 0px rgba(0,0,0,0.25)",
      },
      borderRadius: {
        'popup': '24px',
      },
    },
  },
  plugins: [],
};
