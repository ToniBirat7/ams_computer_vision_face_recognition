import { cn } from '@/lib/utils'

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full text-sm border-collapse', className)}>{children}</table>
    </div>
  )
}

export function THead({ columns }: { columns: { label: string; align?: 'left' | 'right' | 'center' }[] }) {
  return (
    <thead>
      <tr style={{ background: 'var(--brand)' }}>
        {columns.map((c, i) => (
          <th
            key={i}
            className={cn(
              'px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-white/85',
              c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left',
              i === 0 && 'rounded-tl-card',
              i === columns.length - 1 && 'rounded-tr-card',
            )}
          >
            {c.label}
          </th>
        ))}
      </tr>
    </thead>
  )
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>
}

export function TRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn('hover:bg-surface-2 transition-colors', className)}>{children}</tr>
}

export function TCell({ children, className, align }: {
  children: React.ReactNode
  className?: string
  align?: 'left' | 'right' | 'center'
}) {
  return (
    <td className={cn(
      'px-5 py-3.5 text-fg-soft',
      align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left',
      className,
    )}>
      {children}
    </td>
  )
}
