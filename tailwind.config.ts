import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      zIndex: { "100": "100" },
      animation: {
        wiggle: "wiggle 1s ease-in-out infinite",
        wineFill: "wineFill 6s cubic-bezier(0.5, 0, 0.6, 1) infinite",
        ripple: "ripple 1.5s ease-out infinite",
        fadeIn: "fadeIn 2s ease-out",
        bounce: "bounce 1s ease-in-out infinite",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
          "75%": { transform: "rotate(-2deg)" },
        },
        wineFill: {
          "0%": { height: "0%" },
          "50%": { height: "45%" },
          "100%": { height: "100%" },
        },
        ripple: {
          "0%": { transform: "scale(0)", opacity: "1" },
          "50%": { transform: "scale(1.5)", opacity: "0.6" },
          "100%": { transform: "scale(0)", opacity: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      colors: {
        wine: {
          primary: "#722F37",
          secondary: "#C1A87D",
          background: "#FAF9F7",
          text: "#2A2A2A",
          accent: "#1E382A",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          focus: "#5a0c2c", // hover color for the button
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        neutral: "#2d2d2d", // soft dark gray for text
        basic: "#dfd2cd",
        "base-100": "#fefefe",
        "base-200": "#f8f8f8",
        "base-300": "#e0e0e0",
        success: "#c8a165",
        error: "#5b0e1f",
        dark: "#2e2e2e",
        blackOlive: "#3a3a3a",
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        neumorphism: "6px 6px 12px rgba(0, 0, 0, 0.1), -6px -6px 12px rgba(255, 255, 255, 0.3)",
        neumorphismHover: "8px 8px 15px rgba(0, 0, 0, 0.15), -8px -8px 15px rgba(255, 255, 255, 0.4)",
        glassmorphism: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
        glassmorphismHover: "0 6px 8px rgba(0, 0, 0, 0.15), 0 3px 5px rgba(0, 0, 0, 0.1)",
      },
      backdropBlur: {
        DEFAULT: "10px",
      },
      spacing: {
        18: "4.5rem",
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#7f102c",
          secondary: "#3b6d5e",
          accent: "#f1c6d4",
          neutral: "#584240",
          "base-100": "#fefefe",
          info: "#6a7dff",
          success: "#c8a165",
          warning: "#dfd2cd",
          error: "#5b0e1f",
          dark: "#2e2e2e",
          blackOlive: "#3a3a3a",
          "base-200": "#f8f8f8",
          "base-300": "#e0e0e0",
        },
      },
    ],
  },
  plugins: [
    require("daisyui"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
} satisfies Config;
