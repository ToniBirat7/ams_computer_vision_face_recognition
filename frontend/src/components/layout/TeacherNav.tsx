'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { logout } from '@/lib/api'

const navLinks = [
  { href: '/teacher',         icon: 'bx bxs-dashboard', label: 'Dashboard', exact: true  },
  { href: '/teacher/profile', icon: 'bx bx-user',       label: 'Profile',   exact: false },
]

export default function TeacherNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #003b5c, #00a4bd)' }}
          >
            <span className="text-white text-[11px] font-bold tracking-wider">BCU</span>
          </div>
          <div>
            <p className="text-sm font-bold text-primary leading-none">BCU Kathmandu</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Teacher Portal</p>
          </div>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.href, link.exact)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-secondary/10 text-secondary'
                    : 'text-gray-500 hover:text-secondary hover:bg-secondary/5',
                )}
              >
                <i className={link.icon} />
                {link.label}
              </Link>
            )
          })}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200 ml-1"
          >
            <i className="bx bx-log-out" />
            Logout
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-9 h-9 flex flex-col gap-1.5 items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className={cn('w-5 h-0.5 bg-gray-600 transition-all', mobileOpen && 'rotate-45 translate-y-2')} />
          <span className={cn('w-5 h-0.5 bg-gray-600 transition-all', mobileOpen && 'opacity-0')} />
          <span className={cn('w-5 h-0.5 bg-gray-600 transition-all', mobileOpen && '-rotate-45 -translate-y-2')} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                isActive(link.href, link.exact)
                  ? 'bg-secondary/10 text-secondary'
                  : 'text-gray-500 hover:bg-gray-50',
              )}
            >
              <i className={link.icon} />
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <i className="bx bx-log-out" />
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}
