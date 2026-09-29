import type { Config } from "tailwindcss";

export default {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          primary: "#7C3AED",
          hover: "#6D28D9",
          light: "#C4B5FD",
          secondary: "#1E1B4B",
          canvas: "#FAFAFE",
          surface: "#FFFFFF",
          border: "#E9D5FF",
          text: "#1E1B4B",
          muted: "#64748B",
          subtle: "#94A3B8",
        },
        bastion: {
          navy: "#0A192F",
          DEFAULT: "#0F2744",
          light: "#1B3B6F",
          accent: "#7C3AED",
          gold: "#D4A346",
          blue: "#2563EB",
          sky: "#0284C7"
        },
        navy: {
          dark: "#061D32",   // Midnight footer / cinematic overlay
          DEFAULT: "#082B49",// Primary deep navy
          light: "#003068",  // Authentic brand blue
          surface: "#0A355A",// Subtle navy cards
        },
        gold: {
          mineral: "#B79855", // Restrained mineral gold highlights & rules
          DEFAULT: "#C8A064", // Measured site accent gold
          dark: "#76571F",    // Accessible gold text on white
          light: "#F0E4CE",   // Subtle gold background badge
        },
        editorial: {
          DEFAULT: "#F7F6F2", // Warm white reading surface
          surface: "#FFFFFF", // Content card white
        },
        ink: {
          DEFAULT: "#172C3D", // Body and heading text
          muted: "#526373",   // Slate secondary text
          subtle: "#8A9BA8",  // Caption text
        },
        mist: {
          DEFAULT: "#E2E7EA", // Hairline borders & quiet dividers
          light: "#F0F4F6",   // Hover states
        },
        forest: {
          DEFAULT: "#24634D", // Sustainability accents
          light: "#EBF5F1",   // Sustainability badge surface
        },
        turquoise: {
          DEFAULT: "#00B398", // Authentic Gold Fields turquoise accent (style.css verified)
          bright: "#00E5C0",  // Bright, luminous electric turquoise
          dark: "#00826E",    // Accessible contrast on white
          light: "#E0F7F4",   // Soft turquoise pill background
          mineral: "#6FA287", // Soft mineral sage/turquoise
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        card: "0 4px 20px -2px rgba(8, 43, 73, 0.08)",
        elevated: "0 12px 36px -4px rgba(8, 43, 73, 0.16)",
        turquoise: "0 0 20px -2px rgba(0, 229, 192, 0.45)",
        'turquoise-lg': "0 0 35px -4px rgba(0, 229, 192, 0.6)",
      },
    },
  },
  plugins: [],
} satisfies Config;
