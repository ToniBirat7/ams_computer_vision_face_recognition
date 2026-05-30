import { Eyebrow } from './Eyebrow'

export function PageHeader({
  title, subtitle, actions, eyebrow,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  eyebrow?: string
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        {eyebrow && <Eyebrow className="mb-1.5">{eyebrow}</Eyebrow>}
        <h1 className="text-2xl font-extrabold text-fg tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted text-sm mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  )
}
