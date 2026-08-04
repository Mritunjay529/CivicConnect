/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00685f',
          on: '#ffffff',
        },
        secondary: {
          DEFAULT: '#565e74',
        },
        background: {
          DEFAULT: '#f8f9ff',
        },
        surface: {
          low: '#eff4ff',
          container: '#e5eeff',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        border: {
          custom: '#e2e8f0',
        }
      },
      borderRadius: {
        'custom-lg': '12px',
        'custom-sm': '4px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
