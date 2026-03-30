/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF5500',
          50: '#FFF3ED',
          100: '#FFE4D4',
          200: '#FFC4A8',
          300: '#FF9D71',
          400: '#FF7538',
          500: '#FF5500',
          600: '#E04B00',
          700: '#B83D00',
          800: '#8F3000',
          900: '#6B2500',
        },
        surface: {
          DEFAULT: '#1A1A2E',
          light: '#222240',
          lighter: '#2A2A4A',
          border: '#333366',
        },
        accent: {
          success: '#00D68F',
          pending: '#FFB800',
          failed: '#FF3D71',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', '"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
