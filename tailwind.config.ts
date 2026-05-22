import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./auth.ts"
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,.08), 0 30px 80px rgba(0,0,0,.5)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,.12) 1px, transparent 0)",
        "aurora":
          "radial-gradient(circle at top left, rgba(168,85,247,.35), transparent 34%), radial-gradient(circle at top right, rgba(59,130,246,.25), transparent 28%), radial-gradient(circle at bottom center, rgba(16,185,129,.18), transparent 32%)"
      }
    }
  },
  plugins: []
};

export default config;
