'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { logout } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface NavItem {
  href: string
  icon: string
  label: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'Main Menu',
    items: [
      { href: '/admin',          icon: 'bx bxs-dashboard', label: 'Dashboard' },
      { href: '/admin/register', icon: 'bx bx-user-plus',  label: 'User Registration' },
    ],
  },
  {
    title: 'Management',
    items: [
      { href: '/admin/teachers/add', icon: 'bx bx-user',       label: 'Teachers' },
      { href: '/admin/students/add', icon: 'bx bx-user-voice',  label: 'Students' },
      { href: '/admin/courses/add',  icon: 'bx bx-book-alt',    label: 'Courses' },
      { href: '/admin/classes/add',  icon: 'bx bx-chalkboard',  label: 'Classes' },
    ],
  },
  {
    title: 'Lists',
    items: [
      { href: '/admin/students',           icon: 'bx bxs-graduation',    label: 'Students List' },
      { href: '/admin/teachers',           icon: 'bx bxs-user-detail',   label: 'Teachers List' },
      { href: '/admin/attendance/review',  icon: 'bx bx-calendar-check', label: 'Review Attendance' },
    ],
  },
  {
    title: 'Report',
    items: [
      { href: '/admin/reports', icon: 'bx bxs-report', label: 'Student Report' },
    ],
  },
]

interface Props {
  isCollapsed: boolean
  isMobileOpen: boolean
  onClose: () => void
}

export default function AdminSidebar({ isCollapsed, isMobileOpen, onClose }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-screen bg-primary z-50 flex flex-col',
          'transition-all duration-300 overflow-x-hidden',
          // Desktop: collapsed width
          isCollapsed ? 'w-[80px]' : 'w-[280px]',
          // Mobile: slide in/out
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10 min-h-[80px]">
          <img
            src="/images/Bcu_Transparent.png"
            alt="BCU"
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
          {!isCollapsed && (
            <h2 className="text-white font-semibold text-sm whitespace-nowrap">AMS Dashboard</h2>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navSections.map((section) => (
            <div key={section.title} className="mb-2">
              {!isCollapsed && (
                <h3 className="px-5 py-1 text-white/50 text-[10px] font-semibold uppercase tracking-widest">
                  {section.title}
                </h3>
              )}
              <ul>
                {section.items.map((item) => (
                  <li key={item.href} className="relative group">
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all duration-200',
                        'hover:bg-white/10',
                        isActive(item.href)
                          ? 'bg-white/15 text-white border-r-4 border-secondary'
                          : 'text-white/80',
                      )}
                    >
                      <i className={cn(item.icon, 'text-xl shrink-0')} />
                      {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                    </Link>
                    {/* Tooltip when collapsed */}
                    {isCollapsed && (
                      <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {item.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Account / Logout */}
          <div className="mb-2">
            {!isCollapsed && (
              <h3 className="px-5 py-1 text-white/50 text-[10px] font-semibold uppercase tracking-widest">
                Account
              </h3>
            )}
            <div className="relative group">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/80 hover:bg-white/10 transition-all duration-200"
              >
                <i className="bx bx-log-out text-xl shrink-0" />
                {!isCollapsed && <span>Logout</span>}
              </button>
              {isCollapsed && (
                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Logout
                </span>
              )}
            </div>
          </div>
        </nav>
      </aside>
    </>
  )
}
