'use client'

import { forwardRef } from 'react'
import type { LucideIcon } from 'lucide-react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── FormField (label + icon + error wrapper) ─────────────────────────────────
export function FormField({
  label, icon: Icon, error, hint, children, className,
}: {
  label: string
  icon?: LucideIcon
  error?: string
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="flex items-center gap-1.5 text-[12px] font-semibold text-fg-soft mb-1.5 uppercase tracking-wide">
        {Icon && <Icon className="w-3.5 h-3.5 text-accent" />}
        {label}
      </label>
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-xs text-danger mt-1.5">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted mt-1.5">{hint}</p>
      ) : null}
    </div>
  )
}

const baseInput =
  'w-full h-11 px-3.5 text-sm text-fg bg-surface-2 border rounded-input outline-none ' +
  'placeholder:text-muted transition-all duration-200 ' +
  'focus:bg-surface focus:border-accent focus:shadow-[0_0_0_3px_var(--ring)]'

// ── Input ────────────────────────────────────────────────────────────────────
export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }>(
  function Input({ className, error, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(baseInput, error ? 'border-danger' : 'border-border', className)}
        {...props}
      />
    )
  },
)

// ── Textarea ──────────────────────────────────────────────────────────────────
export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }>(
  function Textarea({ className, error, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(baseInput, 'h-auto py-2.5 resize-y', error ? 'border-danger' : 'border-border', className)}
        {...props}
      />
    )
  },
)

// ── Native Select ─────────────────────────────────────────────────────────────
export const NativeSelect = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }>(
  function NativeSelect({ className, error, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(baseInput, 'appearance-none cursor-pointer pr-9', error ? 'border-danger' : 'border-border', className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
        }}
        {...props}
      >
        {children}
      </select>
    )
  },
)
