import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-primary)",
        card: "var(--bg-card)",
        primary: {
          DEFAULT: "var(--color-primary)",
          glow: "var(--color-primary-glow)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          glow: "var(--color-success-glow)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          glow: "var(--color-danger-glow)",
        },
        warning: "var(--color-warning)",
        purple: "var(--color-purple)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
