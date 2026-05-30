'use client'

import type { ReactNode } from 'react'
import { Card } from './Card'
import { CountUp } from './Motion'

export function StatCard({
  icon, label, value, accent, suffix = '', delta,
}: {
  icon: ReactNode
  label: string
  value: number
  accent: string
  suffix?: string
  delta?: string
}) {
  return (
    <Card hover accent={accent} className="p-5 flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[28px] font-extrabold text-fg leading-none tracking-tight">
          <CountUp value={value} suffix={suffix} />
        </p>
        <p className="text-[13px] text-muted mt-1 truncate">{label}</p>
      </div>
      {delta && <span className="ml-auto text-xs font-semibold text-success">{delta}</span>}
    </Card>
  )
}
