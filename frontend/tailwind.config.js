/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ethara: {
          bg: '#f6f5f0',
          card: '#ffffff',
          primary: '#f59e0b',
          primaryDark: '#d97706',
          secondary: '#1e293b',
          muted: '#64748b',
          lavender: '#f0eeff',
          mint: '#e6f8f3',
          sky: '#eaf5ff',
          peach: '#fff3eb'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'clay': '0 20px 40px -15px rgba(0, 0, 0, 0.05), 0 0 15px 0 rgba(0, 0, 0, 0.02)',
        'clay-hover': '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
        'clay-button': '0 10px 20px -5px rgba(245, 158, 11, 0.4)',
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      }
    },
  },
  plugins: [],
}
