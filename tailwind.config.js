/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0d9488',
          dark: '#0f766e',
          light: '#2dd4bf',
        },
        surface: {
          DEFAULT: 'rgba(255,255,255,0.04)',
          hover: 'rgba(255,255,255,0.07)',
        },
        bg: '#121212',
        'bg-elevated': '#181818',
        border: 'rgba(255,255,255,0.08)',
        'text-primary': '#e5e5e5',
        'text-secondary': '#a0a0a0',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        sm: '0 2px 4px rgba(0,0,0,0.2)',
        md: '0 4px 8px rgba(0,0,0,0.3)',
        lift: '0 8px 20px rgba(0,0,0,0.45)',
      },
      backdropBlur: {
        glass: '12px',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease',
      },
    },
  },
  plugins: [],
};
