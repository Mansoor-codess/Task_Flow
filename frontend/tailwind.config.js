/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211b",
        forest: "#215343",
        mint: "#d8efe5",
        coral: "#e8664f",
        gold: "#e2a84f"
      }
    }
  },
  plugins: []
};
