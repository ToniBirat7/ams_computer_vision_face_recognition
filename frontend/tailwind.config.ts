import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    screens: {
      '2xl': '1200px',
      xl:    '1024px',
      lg:    '992px',
      md:    '768px',
      sm:    '584px',
      xs:    '480px',
    },
    extend: {
      colors: {
        primary:          '#003b5c',
        secondary:        '#00a4bd',
        accent:           '#e31837',
        background:       '#f5f7fa',
        'text-primary':   '#2d3748',
        'text-secondary': '#4a5568',
        error:            '#e53e3e',
        success:          '#38a169',
        warning:          '#f6ad55',
        'status-present': '#34d399',
        'status-absent':  '#ef4444',
        'status-na':      '#9ca3af',
      },
      boxShadow: {
        sm: '0 2px 4px rgba(0,0,0,0.1)',
        md: '0 4px 6px rgba(0,0,0,0.1)',
        lg: '0 10px 15px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        card:  '12px',
        input: '8px',
        badge: '20px',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        nunito:  ['Nunito',  'sans-serif'],
        inter:   ['Inter',   'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
