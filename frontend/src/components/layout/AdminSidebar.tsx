'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/lib/api'
import { adminNav } from './nav-config'
import { Monogram } from '@/components/ui'

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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-screen z-50 flex flex-col overflow-x-hidden',
          'transition-[width,transform] duration-300',
          isCollapsed ? 'w-[80px]' : 'w-[280px]',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        style={{ background: 'linear-gradient(180deg, var(--sidebar-bg-2), var(--sidebar-bg))' }}
      >
        {/* dot texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
        />

        {/* Brand */}
        <div className="relative flex items-center gap-3 px-5 h-16 border-b border-white/10 shrink-0">
          <Monogram className="w-9 h-9 text-[11px]" />
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-none whitespace-nowrap">BCU AMS</p>
              <p className="text-[color:var(--sidebar-fg-dim)] text-[11px] mt-1 whitespace-nowrap">Admin Console</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="relative flex-1 overflow-y-auto py-3">
          {adminNav.map((section) => (
            <div key={section.title} className="mb-1">
              {!isCollapsed ? (
                <p className="px-5 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[1.5px] text-[color:var(--sidebar-fg-dim)]">
                  {section.title}
                </p>
              ) : (
                <div className="mx-3 my-2 h-px bg-white/10" />
              )}
              <ul className="px-2 space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href)
                  const Icon = item.icon
                  return (
                    <li key={item.href} className="relative group">
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                          active
                            ? 'bg-[color:var(--sidebar-active)] text-white'
                            : 'text-[color:var(--sidebar-fg)] hover:text-white hover:bg-white/[0.06]',
                        )}
                      >
                        <Icon className={cn('w-[18px] h-[18px] shrink-0', active && 'text-accent')} />
                        {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                        {active && !isCollapsed && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />}
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
        <div className="relative border-t border-white/10 p-2 shrink-0">
          <div className="relative group">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[color:var(--sidebar-fg)] hover:text-white hover:bg-danger/25 transition-colors"
            >
              <LogOut className="w-[18px] h-[18px] shrink-0" />
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
