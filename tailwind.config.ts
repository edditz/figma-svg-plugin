import type { Config } from "tailwindcss"
import animate from "tailwindcss-animate"

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        border: "rgba(139, 145, 179, 0.14)",
        input: "rgba(255, 255, 255, 0.08)",
        ring: "#6D5EF9",
        background: "#0F1220",
        foreground: "#F5F7FF",
        primary: {
          DEFAULT: "#6D5EF9",
          foreground: "#F5F7FF",
        },
        secondary: {
          DEFAULT: "#171A2B",
          foreground: "#C7CCE5",
        },
        muted: {
          DEFAULT: "#1E2238",
          foreground: "#8B91B3",
        },
        accent: {
          DEFAULT: "#4F8CFF",
          foreground: "#F5F7FF",
        },
        destructive: {
          DEFAULT: "#FF5D73",
          foreground: "#F5F7FF",
        },
        success: "#27C281",
        warning: "#FFB020",
        panel: {
          DEFAULT: "rgba(23, 26, 43, 0.82)",
          elevated: "rgba(30, 34, 56, 0.92)",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        panel: "0 24px 64px rgba(8, 10, 20, 0.42)",
        glow: "0 0 0 1px rgba(109, 94, 249, 0.16), 0 18px 48px rgba(79, 140, 255, 0.18)",
      },
      backgroundImage: {
        aurora: "radial-gradient(circle at top left, rgba(109, 94, 249, 0.34), transparent 42%), radial-gradient(circle at top right, rgba(79, 140, 255, 0.24), transparent 36%), linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0))",
      },
    },
  },
  plugins: [animate],
} satisfies Config
