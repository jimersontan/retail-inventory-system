/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.jsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // We can explicitly add specifics, but Tailwind includes everything requested.
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4F46E5', // Primary specific
          700: '#4338CA', // Primary Hover specific
          800: '#3730a3',
          900: '#312e81', // Gradient deep specific
        },
      }
    },
  },
  plugins: [],
}
