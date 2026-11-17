import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        note: {
          yellow: "#f3e782",
          dark: "#262626",
        },
        brand: {
          yellow: "#eddd58",
          dark: "#212121",
        },
      },
      fontFamily: {
        sans: ["SFPro", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      backgroundImage: {
        "light-pattern": "url('/assets/images/tS5xN.png')",
        "dark-pattern": "url('/assets/images/tS5xN-dark.png')",
      },
      boxShadow: {
        note: "0 5px 8px rgba(0, 0, 0, 0.15)",
      },
      transitionProperty: {
        bg: "background-color, background-image",
      },
    },
  },
  plugins: [],
};

export default config;
