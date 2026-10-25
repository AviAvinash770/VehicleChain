/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        automotive: {
          950: "#06080d",
          900: "#0b101b",
          850: "#101625",
          800: "#161e31",
          700: "#222e49",
          600: "#334468",
        },
        electric: {
          500: "#00d2ff",
          600: "#0099ff",
          glow: "rgba(0, 210, 255, 0.25)",
        },
        plate: {
          border: "#1e293b",
          metal: "#f1f5f9",
          emboss: "#0f172a",
        },
      },
      fontFamily: {
        mono: ['"SF Mono"', '"Roboto Mono"', "Menlo", "monospace"],
        plate: ['"DIN Next LT Pro"', '"Oswald"', '"Impact"', "sans-serif"],
      },
      boxShadow: {
        plate: "0 20px 50px -10px rgba(0, 0, 0, 0.7), 0 0 25px 0 rgba(0, 153, 255, 0.15)",
        "plate-sm": "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px 0 rgba(0, 153, 255, 0.1)",
        "plate-inset": "inset 0 2px 4px rgba(255, 255, 255, 0.8), inset 0 -3px 6px rgba(0, 0, 0, 0.4)",
        glow: "0 0 20px rgba(0, 210, 255, 0.4)",
      },
      backgroundImage: {
        "plate-metallic": "linear-gradient(135deg, #ffffff 0%, #f8fafc 40%, #e2e8f0 70%, #ffffff 100%)",
        "plate-dark": "linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)",
      },
    },
  },
  plugins: [],
};
