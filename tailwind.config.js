module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}', // For Next.js App Router
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // For Next.js Pages Router
    './src/**/*.{js,ts,jsx,tsx,mdx}', // If you have a 'src' folder
  ],
  theme: {
    container: {
      padding: '10rem',
    },
  },
  plugins: [],
  theme: {
  extend: {
    // Add these keyframes
    keyframes: {
      shimmer: {
        '100%': { transform: 'translateX(100%)' },
      },
    },
  },
},
}