import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0F",
        panel: "#111118",
        panelHover: "#16161F",
        line: "#1E1E2E",
        muted: "#8A8AA0",
        brand: "#02FF40",
        cyan: "#00BFFF",
        danger: "#FF4560",
        warning: "#FFB347"
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        glow: "0 0 28px rgba(2, 255, 64, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
