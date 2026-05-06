import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'BCU AMS',
  description: 'BCU Attendance Management System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: "'Poppins', sans-serif",
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            },
            success: { iconTheme: { primary: '#38a169', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#e53e3e', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
