/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Encre et surfaces
        ink: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
        // Accent principal (magenta)
        accent: {
          50: '#FDF4FF',
          100: '#FAE8FF',
          200: '#F5D0FE',
          300: '#F0ABFC',
          400: '#E879F9',
          500: '#D946EF',
          600: '#C026D3',
          700: '#A21CAF',
          800: '#86198F',
          900: '#701A75',
        },
        // Accent secondaire - Terracotta
        terracotta: {
          50: '#FEF7EE',
          100: '#FDECD9',
          200: '#FAD8B3',
          300: '#F8BE7C',
          400: '#F5A045',
          500: '#F2841A',
          600: '#E06C10',
          700: '#B84D0D',
          800: '#8F370C',
          900: '#772A10',
        },
        // Accent secondaire - Sage
        sage: {
          50: '#F6F7F4',
          100: '#ECEDE6',
          200: '#D9DBCD',
          300: '#C0C3A8',
          400: '#A0A67A',
          500: '#858A58',
          600: '#6B6F44',
          700: '#525436',
          800: '#41432E',
          900: '#383B2C',
        },
      },
      fontFamily: {
        display: ['var(--font-syne)', 'system-ui', 'sans-serif'],
        body: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      fontSize: {
        // Mobile first, desktop via responsive utilities
        'display-xl': ['clamp(3rem, 8vw, 6rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-lg': ['clamp(2.25rem, 6vw, 3.75rem)', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '700' }],
        'display-md': ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.2', fontWeight: '700' }],
        'display-sm': ['clamp(1.25rem, 2.5vw, 1.5rem)', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['clamp(1.0625rem, 1.5vw, 1.125rem)', { lineHeight: '1.7' }],
        'body-base': ['1rem', { lineHeight: '1.7' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6' }],
        'label': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.02em', fontWeight: '500' }],
        'data': ['0.8125rem', { lineHeight: '1.6', letterSpacing: '0.08em', fontWeight: '400' }],
      },
      spacing: {
        'magazine': '24px',
        'magazine-lg': '48px',
        'magazine-xl': '72px',
        'section': '64px',
        'section-lg': '96px',
      },
      borderRadius: {
        'btn': '8px',
        'card': '12px',
        'badge': '9999px',
      },
      aspectRatio: {
        'vehicle': '4 / 3',
        'vehicle-portrait': '4 / 5',
        'vehicle-wide': '16 / 9',
      },
      container: {
        center: true,
        padding: '1.5rem',
        screens: {
          '2xl': '1280px',
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)',
        'card-hover': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
      transitionDuration: {
        'magazine': '300ms',
      },
      transitionTimingFunction: {
        'magazine': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};