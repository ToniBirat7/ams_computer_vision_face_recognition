'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { logout } from '@/lib/api'

interface NavItem { href: string; icon: string; label: string }
interface NavSection { title: string; items: NavItem[] }

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { href: '/admin', icon: 'bx bxs-dashboard', label: 'Dashboard' },
    ],
  },
  {
    title: 'Management',
    items: [
      { href: '/admin/teachers', icon: 'bx bxs-user-detail',  label: 'Teachers' },
      { href: '/admin/students', icon: 'bx bxs-graduation',   label: 'Students' },
      { href: '/admin/courses',  icon: 'bx bx-book-alt',      label: 'Courses' },
      { href: '/admin/classes',  icon: 'bx bx-chalkboard',    label: 'Classes' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { href: '/admin/attendance/review', icon: 'bx bx-calendar-check', label: 'Attendance Review' },
      { href: '/admin/reports',           icon: 'bx bxs-report',         label: 'Student Reports' },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/admin/register', icon: 'bx bx-user-plus', label: 'Register User' },
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
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-screen z-50 flex flex-col',
          'transition-all duration-300 overflow-x-hidden',
          isCollapsed ? 'w-[80px]' : 'w-[280px]',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        style={{ background: 'linear-gradient(180deg, #002744 0%, #003b5c 100%)' }}
      >
        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        {/* Brand */}
        <div className="relative flex items-center gap-3 px-5 py-5 border-b border-white/10 min-h-[72px]">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-white/20"
            style={{ background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)' }}
          >
            <span className="text-white text-[11px] font-bold tracking-wider">BCU</span>
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm leading-none whitespace-nowrap">AMS Admin</p>
              <p className="text-white/40 text-[11px] mt-1 whitespace-nowrap">BCU Kathmandu</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="relative flex-1 overflow-y-auto py-3">
          {navSections.map((section) => (
            <div key={section.title} className="mb-1">
              {!isCollapsed && (
                <p className="px-5 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[1.5px] text-white/35">
                  {section.title}
                </p>
              )}
              {isCollapsed && <div className="mx-3 my-1 h-px bg-white/10" />}
              <ul>
                {section.items.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <li key={item.href} className="relative group px-2">
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                          active
                            ? 'bg-white/15 text-white'
                            : 'text-white/65 hover:text-white hover:bg-white/8',
                        )}
                      >
                        <i className={cn(item.icon, 'text-[18px] shrink-0', active ? 'text-secondary' : '')} />
                        {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                        {active && !isCollapsed && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-secondary" />
                        )}
                      </Link>
                      {isCollapsed && (
                        <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                          {item.label}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="relative border-t border-white/10 p-2">
          <div className="relative group">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-red-500/20 transition-all duration-200"
            >
              <i className="bx bx-log-out text-[18px] shrink-0" />
              {!isCollapsed && <span>Logout</span>}
            </button>
            {isCollapsed && (
              <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                Logout
              </span>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
