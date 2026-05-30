import { cn } from '@/lib/utils'

export function Monogram({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-xl flex items-center justify-center shrink-0', className)}
      style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))' }}
    >
      <span className="text-white font-bold tracking-wider">BCU</span>
    </div>
  )
}
