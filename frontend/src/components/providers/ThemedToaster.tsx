'use client'

import { Toaster } from 'react-hot-toast'

export function ThemedToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'var(--surface)',
          color: 'var(--fg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: '0 16px 40px hsl(var(--shadow-color) / 0.18)',
          fontSize: '14px',
          fontWeight: 500,
        },
        success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--surface)' } },
        error:   { iconTheme: { primary: 'var(--danger)',  secondary: 'var(--surface)' } },
      }}
    />
  )
}
