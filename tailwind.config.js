/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1C2333",
        bone: "#EDEAE2",
        clay: "#B5533C",
        "clay-light": "#E2896D",
        "clay-dark": "#96432E",
        slate: "#5B6472",
        body: "#14171F",
        paper: "#FAF8F3",
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
