'use client'

import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'brand' | 'secondary' | 'ghost' | 'danger' | 'subtle'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  // BCU gold CTA — navy text on gold, the premium institutional signal.
  primary:
    'text-[color:var(--gold-fg)] bg-gold hover:bg-gold-strong shadow-sm hover:shadow-md hover:-translate-y-px',
  // Solid navy — for secondary emphasis where gold would compete.
  brand:
    'text-brand-fg bg-brand hover:bg-brand-strong shadow-sm hover:shadow-md hover:-translate-y-px',
  secondary:
    'border border-border-strong text-fg-soft bg-surface hover:bg-surface-2',
  ghost:
    'text-muted hover:text-fg hover:bg-surface-2',
  danger:
    'text-white bg-danger hover:opacity-90 shadow-sm',
  subtle:
    'text-accent bg-accent-soft hover:brightness-95',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5 rounded-[10px]',
  md: 'h-11 px-5 text-sm gap-2 rounded-input',
  lg: 'h-12 px-6 text-[15px] gap-2 rounded-input',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, icon, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold whitespace-nowrap',
        'transition-all duration-200 focus-ring active:translate-y-0',
        'disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  )
})
