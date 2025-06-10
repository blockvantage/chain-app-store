/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Apple-inspired color palette
        primary: {
          50: '#f5f9ff',
          100: '#e6f1fe',
          200: '#cce3fd',
          300: '#99c7fb',
          400: '#66aaf9',
          500: '#3b82f6', // Apple blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Secondary accent colors
        accent: {
          green: '#34c759', // Apple green
          indigo: '#5856d6', // Apple indigo
          orange: '#ff9500', // Apple orange
          pink: '#ff2d55', // Apple pink
          purple: '#af52de', // Apple purple
          red: '#ff3b30', // Apple red
          teal: '#5ac8fa', // Apple teal
          yellow: '#ffcc00', // Apple yellow
        },
        // Neutral colors
        neutral: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'San Francisco',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
      borderRadius: {
        'apple': '1rem',
        'apple-sm': '0.75rem',
        'apple-lg': '1.25rem',
      },
      boxShadow: {
        'apple': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'apple-md': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'apple-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'apple-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      backdropFilter: {
        'apple': 'saturate(180%) blur(20px)',
      },
      animation: {
        'apple-fade-in': 'apple-fade-in 0.5s ease-out',
        'apple-scale-in': 'apple-scale-in 0.3s ease-out',
        'apple-slide-up': 'apple-slide-up 0.4s ease-out',
      },
      keyframes: {
        'apple-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'apple-scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'apple-slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.backdrop-blur-apple': {
          backdropFilter: 'saturate(180%) blur(20px)',
        },
        '.text-gradient': {
          background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
          '-webkit-background-clip': 'text',
          'color': 'transparent',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
