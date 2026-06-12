import type { Config } from "tailwindcss";

/**
 * Tailwind is wired directly to the dashboard's design tokens.
 * The CSS custom properties live in app/globals.css and are copied
 * verbatim from frontend/style.css (the "Warm Stone Dark" system),
 * so the landing page and the dashboard render from one source of truth.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        line: "var(--border)",
        "line-hover": "var(--border-hover)",
        fg: "var(--text)",
        "fg-2": "var(--text-2)",
        "fg-3": "var(--text-3)",
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          muted: "var(--accent-muted)",
          subtle: "var(--accent-subtle)",
        },
        success: { DEFAULT: "var(--success)", bg: "var(--success-bg)" },
        error: { DEFAULT: "var(--error)", bg: "var(--error-bg)" },
        warning: { DEFAULT: "var(--warning)", bg: "var(--warning-bg)" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // dashboard product scale + a marketing display tier on top
        xms: ["0.6875rem", { lineHeight: "1.4" }],
        xs: ["0.8125rem", { lineHeight: "1.5" }],
        sm: ["0.875rem", { lineHeight: "1.5" }],
        base: ["1rem", { lineHeight: "1.6" }],
        lg: ["1.25rem", { lineHeight: "1.4" }],
        xl: ["1.5rem", { lineHeight: "1.3" }],
        "2xl": ["2rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "3xl": ["2.75rem", { lineHeight: "1.08", letterSpacing: "-0.025em" }],
        "4xl": ["3.75rem", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        "5xl": ["4.75rem", { lineHeight: "0.98", letterSpacing: "-0.035em" }],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
      maxWidth: {
        wrap: "1200px",
      },
      transitionTimingFunction: {
        // ease-out-quart — the dashboard's single easing curve
        quart: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        fast: "150ms",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 2.4s cubic-bezier(0.16,1,0.3,1) infinite",
        "spin-slow": "spin 1.1s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
