/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neutral: {
          0:   'var(--color-neutral-0)',
          50:  'var(--color-neutral-50)',
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          300: 'var(--color-neutral-300)',
          400: 'var(--color-neutral-400)',
          500: 'var(--color-neutral-500)',
          700: 'var(--color-neutral-700)',
          900: 'var(--color-neutral-900)',
        },
        primary: {
          50:  'var(--color-primary-50)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
        },
        warning: {
          bg: 'var(--color-warning-bg)',
          fg: 'var(--color-warning-fg)',
        },
        danger: {
          bg: 'var(--color-danger-bg)',
          fg: 'var(--color-danger-fg)',
        },
        success: {
          bg: 'var(--color-success-bg)',
          fg: 'var(--color-success-fg)',
        },
        info: {
          bg: 'var(--color-info-bg)',
          fg: 'var(--color-info-fg)',
        },
      },
      fontFamily: {
        sans:    'var(--font-sans)',
        persian: 'var(--font-persian)',
        mono:    'var(--font-mono)',
      },
      boxShadow: {
        card:    'var(--shadow-card)',
        overlay: 'var(--shadow-overlay)',
      },
    },
  },
  plugins: [],
}