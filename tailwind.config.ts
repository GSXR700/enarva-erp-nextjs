import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3C50E0",
        "primary-light": "#EFF2FF", // Bleu clair pour le highlight en mode light
        dark: {
          background: "#1b1c1d",
          surface: "#282a2c",
          container: "#242628",
          text: "#FFFFFF",
          subtle: "#a1a1aa",
          border: "#3e4144",
          "highlight-bg": "#374151", // Gris pour le highlight en mode dark
        },
      },
    },
  },
  plugins: [],
};
export default config;