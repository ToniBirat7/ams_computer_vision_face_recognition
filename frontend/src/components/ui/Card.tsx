import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  accent?: string
}

export function Card({ hover, accent, className, style, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-card shadow-xs',
        hover && 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
        accent && 'border-l-4',
        className,
      )}
      style={accent ? { borderLeftColor: accent, ...style } : style}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between px-5 py-4 border-b border-border', className)} {...props}>
      {children}
    </div>
  )
}

export function CardBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props}>{children}</div>
}
