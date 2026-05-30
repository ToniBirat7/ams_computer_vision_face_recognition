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

      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300',
          isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[280px]',
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 lg:px-6 h-16 flex items-center gap-3">
          <button
            onClick={toggleCollapsed}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Toggle sidebar"
          >
            <i className="bx bx-menu text-xl text-gray-500" />
          </button>

          {/* Mobile brand */}
          <span className="font-bold text-primary text-sm tracking-wide lg:hidden">BCU AMS</span>

          <div className="flex-1" />

          {/* User avatar */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-semibold text-gray-700 leading-none">Admin</span>
              <span className="text-[10px] text-gray-400 mt-0.5">BCU Kathmandu</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">A</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
