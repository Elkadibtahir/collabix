/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  safelist: [
    ...['accent', 'success', 'warning', 'danger', 'info'].flatMap((c) =>
      ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'].map((s) => `bg-${c}-${s}`),
    ),
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '16px' }],
        'caption': ['12px', { lineHeight: '16px' }],
        'body': ['14px', { lineHeight: '20px' }],
        'body-lg': ['15px', { lineHeight: '24px' }],
        'section': ['16px', { lineHeight: '24px' }],
        'page': ['20px', { lineHeight: '28px' }],
        'display': ['24px', { lineHeight: '32px' }],
        'hero': ['30px', { lineHeight: '36px' }],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        '4xl': '20px',
      },
      colors: {
        canvas: 'rgb(var(--bg-canvas) / <alpha-value>)',
        surface: 'rgb(var(--bg-surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--bg-surface-2) / <alpha-value>)',
        elevated: 'rgb(var(--bg-elevated) / <alpha-value>)',
        'text-primary': 'rgb(var(--text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
        'text-tertiary': 'rgb(var(--text-tertiary) / <alpha-value>)',
        'text-inverse': 'rgb(var(--text-inverse) / <alpha-value>)',
        'border-subtle': 'rgb(var(--border-subtle) / <alpha-value>)',
        'border-default': 'rgb(var(--border-default) / <alpha-value>)',
        'border-strong': 'rgb(var(--border-strong) / <alpha-value>)',
        'sidebar-bg': 'rgb(var(--sidebar-bg) / <alpha-value>)',
        'topbar-bg': 'rgb(var(--topbar-bg) / <alpha-value>)',
        accent: {
          50: 'rgb(var(--accent-50) / <alpha-value>)',
          100: 'rgb(var(--accent-100) / <alpha-value>)',
          200: 'rgb(var(--accent-200) / <alpha-value>)',
          300: 'rgb(var(--accent-300) / <alpha-value>)',
          400: 'rgb(var(--accent-400) / <alpha-value>)',
          500: 'rgb(var(--accent-500) / <alpha-value>)',
          600: 'rgb(var(--accent-600) / <alpha-value>)',
          700: 'rgb(var(--accent-700) / <alpha-value>)',
          800: 'rgb(var(--accent-800) / <alpha-value>)',
          900: 'rgb(var(--accent-900) / <alpha-value>)',
        },
        success: {
          50: 'rgb(var(--success-50) / <alpha-value>)',
          100: 'rgb(var(--success-100) / <alpha-value>)',
          500: 'rgb(var(--success-500) / <alpha-value>)',
          700: 'rgb(var(--success-700) / <alpha-value>)',
        },
        warning: {
          50: 'rgb(var(--warning-50) / <alpha-value>)',
          100: 'rgb(var(--warning-100) / <alpha-value>)',
          500: 'rgb(var(--warning-500) / <alpha-value>)',
          700: 'rgb(var(--warning-700) / <alpha-value>)',
        },
        danger: {
          50: 'rgb(var(--danger-50) / <alpha-value>)',
          100: 'rgb(var(--danger-100) / <alpha-value>)',
          500: 'rgb(var(--danger-500) / <alpha-value>)',
          700: 'rgb(var(--danger-700) / <alpha-value>)',
        },
        info: {
          50: 'rgb(var(--info-50) / <alpha-value>)',
          100: 'rgb(var(--info-100) / <alpha-value>)',
          500: 'rgb(var(--info-500) / <alpha-value>)',
          700: 'rgb(var(--info-700) / <alpha-value>)',
        },
      },
      boxShadow: {
        'cx-xs': 'var(--shadow-xs)',
        'cx-sm': 'var(--shadow-sm)',
        'cx-md': 'var(--shadow-md)',
        'cx-lg': 'var(--shadow-lg)',
        'cx-xl': 'var(--shadow-xl)',
      },
      transitionTimingFunction: {
        'cx': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'cx-spin': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'cx-spin': 'cx-spin 0.8s linear infinite',
      },
    },
  },
  plugins: [],
};
