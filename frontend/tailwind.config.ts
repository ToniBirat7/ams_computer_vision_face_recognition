import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    screens: {
      xs: '480px',
      sm: '584px',
      md: '768px',
      lg: '992px',
      xl: '1024px',
      '2xl': '1200px',
    },
    extend: {
      colors: {
        bg:             'var(--bg)',
        surface:        'var(--surface)',
        'surface-2':    'var(--surface-2)',
        'surface-3':    'var(--surface-3)',
        border:         'var(--border)',
        'border-strong':'var(--border-strong)',
        fg:             'var(--fg)',
        'fg-soft':      'var(--fg-soft)',
        muted:          'var(--muted)',

        brand:          'var(--brand)',
        'brand-strong': 'var(--brand-strong)',
        'brand-fg':     'var(--brand-fg)',
        accent:         'var(--accent)',
        'accent-strong':'var(--accent-strong)',
        gold:           'var(--gold)',
        'gold-strong':  'var(--gold-strong)',
        'gold-fg':      'var(--gold-fg)',
        danger:         'var(--danger)',
        success:        'var(--success)',
        warning:        'var(--warning)',

        'brand-soft':   'var(--brand-soft)',
        'accent-soft':  'var(--accent-soft)',
        'gold-soft':    'var(--gold-soft)',
        'danger-soft':  'var(--danger-soft)',
        'success-soft': 'var(--success-soft)',
        'warning-soft': 'var(--warning-soft)',

        sidebar:        'var(--sidebar-bg)',
        'sidebar-2':    'var(--sidebar-bg-2)',
      },
      borderRadius: {
        badge: '999px',
        input: '10px',
        card:  '16px',
        xl2:   '20px',
      },
      boxShadow: {
        xs: '0 1px 2px hsl(var(--shadow-color) / 0.06)',
        sm: '0 2px 8px hsl(var(--shadow-color) / 0.08)',
        md: '0 6px 20px hsl(var(--shadow-color) / 0.10)',
        lg: '0 16px 40px hsl(var(--shadow-color) / 0.14)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
      animation: {
        fadeIn:  'fadeIn .4s ease both',
        scaleIn: 'scaleIn .2s ease both',
      },
    },
  },
  plugins: [],
}

export default config
