'use client'

import { useSidebar } from '@/hooks/useSidebar'
import AdminSidebar from './AdminSidebar'
import { cn } from '@/lib/utils'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed, isMobileOpen, toggleCollapsed, closeMobile } = useSidebar()

  return (
    <div className="min-h-screen bg-background font-poppins flex">
      <AdminSidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onClose={closeMobile}
      />

      {/* Main content area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300',
          isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[280px]',
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[var(--border)] px-4 lg:px-6 py-4 flex items-center gap-4">
          <button
            onClick={toggleCollapsed}
            className="w-9 h-9 flex items-center justify-center rounded-input hover:bg-gray-100 transition-colors"
          >
            <i className="bx bx-menu text-xl text-text-secondary" />
          </button>
          <div id="admin-page-title" className="flex-1 hidden lg:block" />
          <span className="font-semibold text-text-primary text-sm lg:hidden">AMS</span>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
