/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6fff9',
          100: '#b3ffed',
          200: '#80ffe0',
          300: '#4dffd4',
          400: '#1affc7',
          500: '#00d4aa',
          600: '#00a888',
          700: '#007d66',
          800: '#005244',
          900: '#002622',
        },
        dark: {
          100: '#1e2936',
          200: '#1a2332',
          300: '#151c28',
          400: '#111820',
          500: '#0d1219',
          600: '#0a0e14',
          700: '#070a0f',
          800: '#04060a',
          900: '#020305',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}