/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#ffffff", // Branco Puro/Acinzentado para destaque
        "background-light": "#f8f6f6",
        "background-dark": "#0a0a0a", // Preto absoluto do login
        "vellum": "#1a1a1a",
        "iron": "#333333",
        "stone": "#1a1a1a",
        "off-white": "#f1f5f9",
        "muted-slate": "#475569"
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
