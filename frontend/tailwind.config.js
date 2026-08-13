/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        warmBg: '#FAF7F2',
        apricot: {
          50: '#fffbf5',
          100: '#ffefd6',
          200: '#fde0b3',
          300: '#fbc48b',
          400: '#f7b674',
          500: '#f59138',
          600: '#e57519',
          700: '#be5a14',
          800: '#974818',
          900: '#7a3c17'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
