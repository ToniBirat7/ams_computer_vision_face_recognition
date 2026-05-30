import { cn } from '@/lib/utils'

/**
 * BCU editorial eyebrow — a small uppercase, letter-spaced cyan label that sits
 * above headings and section titles. A signature element of the BCU brand
 * (used on event/open-day callouts). Cyan is reserved for these labels, tags
 * and pills; gold is reserved for CTAs and numerals.
 */
export function Eyebrow({ className, children }: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-block text-[11px] font-semibold uppercase tracking-[0.14em] text-accent',
        className,
      )}
    >
      {children}
    </span>
  )
}
