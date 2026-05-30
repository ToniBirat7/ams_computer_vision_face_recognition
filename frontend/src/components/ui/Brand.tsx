import { cn } from '@/lib/utils'

export function Monogram({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/bcu-logo.webp"
      alt="BCU"
      className={cn('rounded-xl object-cover shrink-0', className)}
    />
  )
}
