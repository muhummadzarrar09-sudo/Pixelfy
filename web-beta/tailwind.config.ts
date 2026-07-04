import type { Config } from "tailwindcss"

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        pixelfy: {
          purple: "#8B5CF6",
          "purple-deep": "#5B21B6",
          teal: "#06FFA5",
          pink: "#FF3B9A",
          dark: "#0F0B1A",
          surface: "#1A1328",
          light: "#FEFCFF",
        }
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Inter", "sans-serif"],
        display: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
      animation: {
        "glow-pulse": "glow-pulse 2.2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        "glow-pulse": {
          "0%,100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.9", filter: "brightness(1.15)" }
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        }
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        "pixelfy": "0 20px 60px -12px rgba(139,92,246,0.35), 0 0 30px rgba(6,255,165,0.12)",
        "pixelfy-glow": "0 0 40px rgba(139,92,246,0.45), 0 0 80px rgba(255,59,154,0.22)"
      }
    }
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config
