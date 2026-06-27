import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8F4EE",
        card: "#FFFFFF",
        accent: "#D4603A",
        primary: "#1A1A1A",
        muted: "#8C8279",
      },
      fontFamily: {
        mincho: ["Shippori Mincho", "serif"],
        playfair: ["Playfair Display", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
