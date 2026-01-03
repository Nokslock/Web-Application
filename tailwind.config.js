/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // <--- REQUIRED for the toggle switch to work
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}', // Added components folder just in case
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      padding: '10rem',
      center: true, // Optional: usually good to center containers
    },
    extend: {
      // Merged your keyframes here
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};