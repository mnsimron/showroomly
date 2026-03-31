/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/flowbite-react/lib/esm/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        showroomly: {
          primary: "#1e293b",
          accent: "#10b981",
          light: "#f8fafc",
        },
      },
    },
  },
  plugins: [
    require("flowbite/plugin")
  ],
};
