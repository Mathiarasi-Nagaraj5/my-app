import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Elite Soul brand palette — use only these three across the site
        charcoal: "#1C1B19", // primary dark surface / text
        ivory: "#F3EFE7",    // primary light surface / background
        brass: "#A8823D",    // single accent — CTAs, prices, highlights
      },
      fontFamily: {
        // Swap these for the actual fonts you load (e.g. next/font)
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Fraunces", "Georgia", "serif"], // used for headings only
      },
      borderRadius: {
        DEFAULT: "4px",
        card: "8px",
      },
    },
  },
  plugins: [],
};

export default config;