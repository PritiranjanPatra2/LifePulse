/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefcf5',
          100: '#d7f7e6',
          200: '#b2edd1',
          300: '#7ddcb4',
          400: '#43c292',
          500: '#1ea678',
          600: '#138560',
          700: '#116a4f',
          800: '#115440',
          900: '#104536',
          950: '#04271f',
        },
        navy: {
          850: '#141c2e',
          900: '#0f172a',
          950: '#080d1a',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'premium': '0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.04)',
        'glow-primary': '0 0 25px -5px rgba(30, 166, 120, 0.35)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
      },
      animation: {
        'wave': 'wave 4s ease-in-out infinite',
        'bubble': 'bubble 3s ease-in-out infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'translateX(0) translateY(0)' },
          '50%': { transform: 'translateX(-25%) translateY(-2px)' },
        },
        bubble: {
          '0%': { transform: 'translateY(100%) scale(0.6)', opacity: '0' },
          '50%': { opacity: '0.8' },
          '100%': { transform: 'translateY(-20%) scale(1.1)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
