'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle({ onSidebar = false }: { onSidebar?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === 'dark'

  if (!mounted) {
    return <div className={onSidebar ? 'w-9 h-9' : 'w-9 h-9'} />
  }

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className={
        onSidebar
          ? 'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[color:var(--sidebar-fg)] hover:bg-[color:var(--sidebar-active)] transition-colors'
          : 'w-9 h-9 flex items-center justify-center rounded-xl text-muted hover:text-fg hover:bg-surface-2 transition-colors'
      }
    >
      <motion.span
        key={isDark ? 'moon' : 'sun'}
        initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="flex items-center justify-center"
      >
        {isDark ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
      </motion.span>
      {onSidebar && <span>{isDark ? 'Dark mode' : 'Light mode'}</span>}
    </button>
  )
}
