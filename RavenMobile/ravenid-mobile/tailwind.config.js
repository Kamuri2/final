module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores personalizados para QRify / PANDORAXDN
        "qr-dark": "#0f1115",
        "qr-accent": "#B08D6D",
      },
    },
  },
  plugins: [],
};
