import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from './Card'

// ── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({
  icon: Icon, title, message, action,
}: {
  icon: LucideIcon
  title: string
  message?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 gap-3">
      <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center">
        <Icon className="w-8 h-8 text-muted" />
      </div>
      <div>
        <h3 className="font-semibold text-fg">{title}</h3>
        {message && <p className="text-sm text-muted mt-1 max-w-sm">{message}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-lg', className)} />
}

export function SkeletonCard() {
  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-2.5 w-full" />
    </Card>
  )
}

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i} className="p-4 flex items-center gap-4">
          <Skeleton className="w-11 h-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </Card>
      ))}
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-20', className)}>
      <div className="w-9 h-9 rounded-full border-[3px] border-surface-3 border-t-accent animate-spin" />
    </div>
  )
}
