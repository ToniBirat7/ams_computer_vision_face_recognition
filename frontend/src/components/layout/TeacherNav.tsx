'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { logout } from '@/lib/api'

const navLinks = [
  { href: '/teacher',         icon: 'bx bx-home',    label: 'Dashboard', exact: true },
  { href: '/teacher/profile', icon: 'bx bx-user',    label: 'Profile',   exact: false },
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
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[var(--border)] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between h-[70px]">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img
            src="/images/Bcu_Transparent.png"
            alt="BCU"
            className="w-10 h-10 object-contain"
          />
          <div className="flex gap-1">
            {['B', 'C', 'U'].map((letter, i) => (
              <span
                key={i}
                className="text-xl font-bold text-primary"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {letter}
              </span>
            ))}
          </div>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-input text-sm font-medium transition-all duration-200',
                isActive(link.href, link.exact)
                  ? 'text-secondary border-b-2 border-secondary'
                  : 'text-text-secondary hover:text-secondary hover:bg-[var(--hover-bg)]',
              )}
            >
              <i className={link.icon} />
              <span>{link.label}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-input text-sm font-medium text-text-secondary hover:text-accent hover:bg-red-50 transition-all duration-200"
          >
            <i className="bx bx-log-out" />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 w-8 h-8 items-center justify-center"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className={cn('w-6 h-0.5 bg-text-primary transition-all', mobileOpen && 'rotate-45 translate-y-2')} />
          <span className={cn('w-6 h-0.5 bg-text-primary transition-all', mobileOpen && 'opacity-0')} />
          <span className={cn('w-6 h-0.5 bg-text-primary transition-all', mobileOpen && '-rotate-45 -translate-y-2')} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-white px-6 py-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-input text-sm font-medium',
                isActive(link.href, link.exact)
                  ? 'bg-[var(--hover-bg)] text-secondary'
                  : 'text-text-secondary hover:bg-gray-50',
              )}
            >
              <i className={link.icon} />
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-input text-sm font-medium text-text-secondary hover:bg-red-50 hover:text-accent"
          >
            <i className="bx bx-log-out" />
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}
