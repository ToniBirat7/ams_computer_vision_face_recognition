'use client'

import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { useSidebar } from '@/hooks/useSidebar'
import { cn } from '@/lib/utils'
import AdminSidebar from './AdminSidebar'
import { pageTitle } from './nav-config'
import { ThemeToggle } from '@/components/ui'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed, isMobileOpen, toggleCollapsed, closeMobile } = useSidebar()
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-bg flex">
      <AdminSidebar isCollapsed={isCollapsed} isMobileOpen={isMobileOpen} onClose={closeMobile} />

      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-[margin] duration-300',
          isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[280px]',
        )}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-surface/80 backdrop-blur-md border-b border-border px-4 lg:px-6 flex items-center gap-3">
          <button
            onClick={toggleCollapsed}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-muted hover:text-fg hover:bg-surface-2 transition-colors shrink-0"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="text-[15px] font-bold text-fg tracking-tight">{pageTitle(pathname)}</h1>

          <div className="flex-1" />

          <ThemeToggle />

          <div className="flex items-center gap-2.5 pl-2.5 border-l border-border">
            <div className="hidden sm:flex flex-col items-end leading-none">
              <span className="text-[13px] font-semibold text-fg">Admin</span>
              <span className="text-[11px] text-muted mt-0.5">BCU Kathmandu</span>
            </div>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))' }}
            >
              A
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
