/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // FinMate AI brand colors
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
        },
        accent: {
          primary: '#8b5cf6',
          secondary: '#ec4899',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

