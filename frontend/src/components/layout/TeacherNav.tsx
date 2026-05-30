'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, User, LogOut, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/lib/api'
import { Monogram, ThemeToggle } from '@/components/ui'

const navLinks = [
  { href: '/teacher',         icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/teacher/profile', icon: User,            label: 'Profile',   exact: false },
]

export default function TeacherNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-5 lg:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Monogram className="w-9 h-9 text-[11px]" />
          <div>
            <p className="text-sm font-bold text-fg leading-none">BCU AMS</p>
            <p className="text-[11px] text-muted mt-0.5">Teacher Portal</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.href, link.exact)
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  active ? 'bg-accent-soft text-accent' : 'text-muted hover:text-accent hover:bg-surface-2',
                )}
              >
                <Icon className="w-[18px] h-[18px]" />
                {link.label}
              </Link>
            )
          })}
          <div className="mx-1"><ThemeToggle /></div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-muted hover:text-danger hover:bg-danger-soft transition-all duration-200"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Logout
          </button>
        </div>

        <div className="flex md:hidden items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-fg hover:bg-surface-2 transition-colors"
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                  isActive(link.href, link.exact) ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-surface-2',
                )}
              >
                <Icon className="w-[18px] h-[18px]" />
                {link.label}
              </Link>
            )
          })}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted hover:bg-danger-soft hover:text-danger transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}
