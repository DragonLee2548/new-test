import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#fff7f3",
        blush: "#ffd6e3",
        rose: "#ff7aa2",
        deeprose: "#e85a86",
        mintblue: "#acd5e6",
      },
      fontFamily: {
        cute: ['"Gowun Dodum"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -10px rgba(232, 90, 134, 0.35)",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pop: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        floaty: "floaty 3s ease-in-out infinite",
        pop: "pop 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
