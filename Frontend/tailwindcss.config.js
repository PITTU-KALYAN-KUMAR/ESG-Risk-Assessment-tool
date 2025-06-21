export default {
    darkMode: 'class', // Enable class-based dark mode
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'], // Specify files to scan for Tailwind classes
    theme: {
      extend: {}, // Extend the default theme here if needed
    },
    plugins: [], // Add Tailwind plugins here if needed
  };