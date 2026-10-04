/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "#0A0E1A",
          soft: "#0D1224",
        },
        surface: {
          DEFAULT: "#12172A",
          hover: "#171D33",
          border: "#232A42",
        },
        accent: {
          indigo: "#6C6CF5",
          violet: "#9B6CF5",
          cyan: "#33D6E8",
        },
        positive: "#2ED47A",
        negative: "#F5556C",
        neutral: "#F5B84D",
        ink: {
          DEFAULT: "#E7E9F5",
          muted: "#8B92B0",
          faint: "#5C6488",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Sora", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(108,108,245,0.15), 0 8px 30px -8px rgba(108,108,245,0.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.35 },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        pulseDot: "pulseDot 1.6s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};
