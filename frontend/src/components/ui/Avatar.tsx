import { cn } from '@/lib/utils'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const sizeMap = {
  sm: 'w-9 h-9 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-20 h-20 text-xl',
  xl: 'w-28 h-28 text-3xl',
}

export function Avatar({
  name, src, size = 'md', className,
}: {
  name: string
  src?: string | null
  size?: keyof typeof sizeMap
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-white',
        sizeMap[size],
        className,
      )}
      style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))' }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials(name)
      )}
    </div>
  )
}
