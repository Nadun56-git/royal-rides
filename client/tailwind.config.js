/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pearl: {
          DEFAULT: '#F8F7F4',
          50: '#FDFCFB',
          100: '#F8F7F4',
          200: '#F0EEE8',
          300: '#E4E0D6',
        },
        navy: {
          DEFAULT: '#0B1F4B',
          deep: '#07142F',
          950: '#050D20',
          900: '#07142F',
          800: '#0B1F4B',
          700: '#132B66',
          600: '#1B3A7A',
          500: '#2A4E9E',
          400: '#436BBE',
          300: '#7B9AD8',
          200: '#B4C5EB',
          100: '#E1E8F8',
          50: '#F0F4FC',
        },
        gold: {
          DEFAULT: '#C9A24B',
          hover: '#B8923D',
          soft: '#E8D9AE',
          50: '#FAF7EE',
          100: '#F5EED6',
          200: '#E8D9AE',
          300: '#D9C082',
          400: '#C9A24B',
          500: '#B8923D',
          600: '#99752D',
        },
        teal: {
          accent: '#2A9D8F',
          dark: '#21867A',
          light: '#E6F6F4',
        },
        surface: {
          card: '#FFFFFF',
          glass: 'rgba(255, 255, 255, 0.75)',
          glassDark: 'rgba(11, 31, 75, 0.85)',
          muted: '#F3F4F6',
        },
        content: {
          heading: '#0B1F4B',
          body: '#4A5568',
          muted: '#8A94A6',
          inverted: '#F8F7F4',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"Manrope"', '"DM Sans"', 'monospace'],
        display: ['"Playfair Display"', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(11, 31, 75, 0.05), 0 2px 6px -1px rgba(11, 31, 75, 0.03)',
        'premium': '0 20px 40px -15px rgba(11, 31, 75, 0.08), 0 0 1px 1px rgba(11, 31, 75, 0.04)',
        'elevated': '0 25px 50px -12px rgba(11, 31, 75, 0.15)',
        'gold-glow': '0 0 25px rgba(201, 162, 75, 0.25)',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
        pulseSubtle: 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
