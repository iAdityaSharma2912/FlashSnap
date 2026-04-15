import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // --- FONTS MERGED HERE ---
      fontFamily: {
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui"],
        heading: ["var(--font-heading)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "monospace"],
        
      },
      colors: {
        primary: {
          DEFAULT: "#FFD60A",
          50: "#FFFBE0",
          100: "#FFF5B3",
          200: "#FFEd66",
          300: "#FFE433",
          400: "#FFD60A",
          500: "#E6BF00",
          600: "#B39400",
          700: "#806A00",
          800: "#4D3F00",
          900: "#1A1500",
        },
        accent: {
          DEFAULT: "#00FF9F",
          dark: "#00CC7F",
        },
        orange: {
          DEFAULT: "#FF6B35",
          dark: "#E5521A",
          light: "#FF8C5A",
        },
        blue: {
          DEFAULT: "#3B82F6",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
          light: "#60A5FA",
          dark: "#1D4ED8",
        },
        dark: {
          DEFAULT: "#0A0A0F",
          card: "#12121A",
          border: "#1E1E2E",
          muted: "#2A2A3E",
        },
        gray: {
          50: "#F8F8FC",
          100: "#F0F0F8",
          200: "#E0E0F0",
          300: "#C8C8E0",
          400: "#A0A0C0",
          500: "#7878A0",
          600: "#585880",
          700: "#3C3C60",
          800: "#242440",
          900: "#141428",
        },
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      backgroundImage: {
        "gradient-dark": "linear-gradient(135deg, #0A0A0F 0%, #0F0F1A 50%, #0A0A14 100%)",
        "gradient-card": "linear-gradient(135deg, #12121A 0%, #1A1A2E 100%)",
        "gradient-primary": "linear-gradient(135deg, #FFD60A 0%, #FF6B35 100%)",
        "gradient-accent": "linear-gradient(135deg, #00FF9F 0%, #00CC7F 100%)",
        "gradient-blue": "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
        "gradient-glow": "radial-gradient(ellipse at center, rgba(255, 214, 10, 0.15) 0%, transparent 70%)",
        "gradient-radial": "radial-gradient(circle at center, var(--tw-gradient-stops))",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in-right": "slideInRight 0.4s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "flip": "flip 0.6s ease-in-out",
        "shimmer": "shimmer 1.5s infinite",
        "bounce-subtle": "bounceSub 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 214, 10, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(255, 214, 10, 0.6)" },
        },
        flip: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(180deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        bounceSub: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      boxShadow: {
        "glow-yellow": "0 0 30px rgba(255, 214, 10, 0.4)",
        "glow-green": "0 0 30px rgba(0, 255, 159, 0.4)",
        "glow-orange": "0 0 30px rgba(255, 107, 53, 0.4)",
        "glow-blue": "0 0 30px rgba(59, 130, 246, 0.4)",
        "card": "0 4px 24px rgba(0, 0, 0, 0.4)",
        "card-hover": "0 8px 40px rgba(0, 0, 0, 0.6)",
        "inner-glow": "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;