/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#b83d14",
        "background-light": "#f8f6f6",
        "background-dark": "#1a0f0c",
        "vellum": "#2a1f1b",
        "iron": "#4a3730",
        "off-white": "#f1f5f9",
        "muted-slate": "#94a3b8"
      },
      fontFamily: {
        "display": ["Newsreader", "serif"]
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
