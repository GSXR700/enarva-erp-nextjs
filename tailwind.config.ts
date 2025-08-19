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
        "primary-light": "#EFF2FF",
        dark: {
          background: "#1b1c1d",
          surface: "#282a2c",
          container: "#242628",
          text: "#FFFFFF",
          subtle: "#a1a1aa",
          border: "#3e4144",
          "highlight-bg": "#374151",
        },
      },
      // J'ai ajouté l'animation ici
      keyframes: {
        'wipe-effect': {
          '0%': { transform: 'translateX(-100%)', opacity: '0.6' },
          '50%': { opacity: '0.3' },
          '100%': { transform: 'translateX(100%)', opacity: '0.6' },
        },
      },
      animation: {
        'wipe': 'wipe-effect 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;