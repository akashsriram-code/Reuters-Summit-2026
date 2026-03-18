import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        reuters: {
          navy: "#0A1628",
          red: "#FF6B35",
          "red-dark": "#E15928",
          soft: "#F4F6F9",
          mist: "#C7D2E0",
          stone: "#66758B",
          ink: "#10203A",
          line: "#DCE4EE",
        },
      },
      boxShadow: {
        focus: "0 0 0 4px rgba(255,107,53,0.12)",
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
