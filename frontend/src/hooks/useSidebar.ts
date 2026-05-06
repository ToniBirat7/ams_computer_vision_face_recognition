'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'ams-sidebar-collapsed'

export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Read persisted state on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) setIsCollapsed(stored === 'true')
  }, [])

  // Track viewport width
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth <= 992
      setIsMobile(mobile)
      if (!mobile) setIsMobileOpen(false)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const toggleCollapsed = useCallback(() => {
    if (isMobile) {
      setIsMobileOpen((v) => !v)
    } else {
      setIsCollapsed((v) => {
        localStorage.setItem(STORAGE_KEY, String(!v))
        return !v
      })
    }
  }, [isMobile])

  const closeMobile = useCallback(() => setIsMobileOpen(false), [])

  return { isCollapsed, isMobileOpen, isMobile, toggleCollapsed, closeMobile }
}
