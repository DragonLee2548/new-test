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
        sunny: "#ffd84d",
        grass: "#7bd389",
        sky2: "#7bc6ff",
      },
      fontFamily: {
        cute: ['"Gowun Dodum"', "system-ui", "sans-serif"],
        comic: ['"Jua"', '"Gowun Dodum"', "system-ui", "sans-serif"],
        round: ['"Cafe24Ssurround"', '"Black Han Sans"', '"Jua"', '"Gowun Dodum"', "system-ui", "sans-serif"],
        bubble: ['"Gaegu"', '"Jua"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -10px rgba(232, 90, 134, 0.35)",
        flash: "0 8px 0 rgba(0,0,0,0.18), 0 14px 25px rgba(0,0,0,0.18)",
        flashSm: "0 4px 0 rgba(0,0,0,0.18), 0 8px 14px rgba(0,0,0,0.18)",
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
        popBig: {
          "0%": { transform: "scale(0.2) rotate(-20deg)", opacity: "0" },
          "60%": { transform: "scale(1.25) rotate(8deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        wobble: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        jelly: {
          "0%, 100%": { transform: "scale(1, 1)" },
          "25%": { transform: "scale(1.1, 0.9)" },
          "50%": { transform: "scale(0.9, 1.1)" },
          "75%": { transform: "scale(1.05, 0.95)" },
        },
        rainbowText: {
          "0%": { color: "#ff5b8a" },
          "20%": { color: "#ffa64d" },
          "40%": { color: "#ffd84d" },
          "60%": { color: "#7bd389" },
          "80%": { color: "#7bc6ff" },
          "100%": { color: "#c98bff" },
        },
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        shake: {
          "0%, 100%": { transform: "translate(0,0)" },
          "20%": { transform: "translate(-5px, 3px)" },
          "40%": { transform: "translate(4px, -3px)" },
          "60%": { transform: "translate(-3px, 4px)" },
          "80%": { transform: "translate(3px, -4px)" },
        },
        sparkle: {
          "0%, 100%": { opacity: "0", transform: "scale(0.4) rotate(0deg)" },
          "50%": { opacity: "1", transform: "scale(1.3) rotate(45deg)" },
        },
      },
      animation: {
        floaty: "floaty 3s ease-in-out infinite",
        pop: "pop 0.4s ease-out",
        popBig: "popBig 0.5s cubic-bezier(.34,1.56,.64,1)",
        wobble: "wobble 0.6s ease-in-out infinite",
        jelly: "jelly 0.6s ease",
        rainbow: "rainbowText 3s linear infinite",
        marquee: "marquee 12s linear infinite",
        shake: "shake 0.4s ease",
        sparkle: "sparkle 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
