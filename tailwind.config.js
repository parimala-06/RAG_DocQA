/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        night: "#0E1524",
        "night-elevated": "#182035",
        "night-rule": "#2A3348",
        cream: "#F2F3F6",
        paper: "#FFFFFF",
        ink: "#16182B",
        mist: "#F3F6FB",
        muted: "#6B7280",
        "muted-dark": "#93A0B8",
        teal: "#2FD9A8",
        "teal-deep": "#0ea176",
        "teal-tint": "#E4FAF2",
        coral: "#FF6B4A",
        "coral-deep": "#C23F24",
        "coral-tint": "#FFE9E2",
        alert: "#DC2626",
        "alert-tint": "#FDE7E7",
      },
      fontFamily: {
        sans: ["var(--font-plex-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 8px 24px -8px rgba(47, 217, 168, 0.45)",
        "glow-coral": "0 8px 24px -8px rgba(255, 107, 74, 0.45)",
        card: "0 2px 16px -4px rgba(14, 21, 36, 0.12)",
        "card-dark": "0 4px 20px -6px rgba(0, 0, 0, 0.45)",
      },
    },
  },
  plugins: [],
};
