import { cn } from '@/lib/utils'

type Tone = 'present' | 'absent' | 'na' | 'brand' | 'accent' | 'neutral' | 'morning' | 'day'

const tones: Record<Tone, string> = {
  present: 'bg-success-soft text-success',
  absent:  'bg-danger-soft text-danger',
  na:      'bg-surface-3 text-muted',
  brand:   'bg-brand-soft text-brand',
  accent:  'bg-accent-soft text-accent',
  neutral: 'bg-surface-2 text-fg-soft',
  morning: 'bg-warning-soft text-warning',
  day:     'bg-accent-soft text-accent',
}

export function Badge({ tone = 'neutral', className, children }: {
  tone?: Tone
  className?: string
  children: React.ReactNode
}) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-badge text-[11px] font-semibold whitespace-nowrap',
      tones[tone],
      className,
    )}>
      {children}
    </span>
  )
}
