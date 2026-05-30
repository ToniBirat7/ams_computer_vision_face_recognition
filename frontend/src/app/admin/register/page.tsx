'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User, AtSign, Lock, Eye, EyeOff, Check, ArrowRight, ArrowLeft, UserPlus, ShieldCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { registerUser } from '@/lib/api'
import { Card, Button, Input, FormField, PageHeader, Reveal } from '@/components/ui'
import { cn } from '@/lib/utils'

const STEPS = ['Personal', 'Account', 'Security']

function strengthOf(p: string) {
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  const meta = [
    { label: '', color: 'bg-surface-3' },
    { label: 'Weak', color: 'bg-danger' },
    { label: 'Fair', color: 'bg-warning' },
    { label: 'Good', color: 'bg-accent' },
    { label: 'Strong', color: 'bg-success' },
  ]
  return { score: s, ...meta[s] }
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ first_name: '', last_name: '', username: '', email: '', password1: '', password2: '' })
  const [show, setShow] = useState({ p1: false, p2: false })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const strength = strengthOf(form.password1)

  const validate = (s: number) => {
    const e: Record<string, string> = {}
    if (s === 0) {
      if (!form.first_name.trim()) e.first_name = 'First name is required'
      if (!form.last_name.trim()) e.last_name = 'Last name is required'
    } else if (s === 1) {
      if (form.username.length < 3 || form.username.length > 15) e.username = 'Username must be 3–15 characters'
      if (!form.email.includes('@')) e.email = 'Valid email required'
    } else {
      if (form.password1.length < 8) e.password1 = 'At least 8 characters'
      if (form.password1 !== form.password2) e.password2 = 'Passwords do not match'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate(2)) return
    setLoading(true)
    try {
      const r = await registerUser(form)
      if (r.ok) {
        toast.success('User registered successfully')
        router.push('/admin/teachers/add')
      } else toast.error('Registration failed. Try again.')
    } catch { toast.error('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <Reveal><PageHeader title="Register User" subtitle="Create a new account, then link it to a teacher profile" /></Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Reveal delay={0.05} className="lg:col-span-2">
          <Card className="p-6 h-full bg-[linear-gradient(160deg,var(--accent-soft),transparent)]">
            <div className="w-12 h-12 rounded-2xl bg-accent-soft flex items-center justify-center mb-4"><ShieldCheck className="w-6 h-6 text-accent" /></div>
            <h2 className="font-bold text-fg text-lg">Account Setup</h2>
            <p className="text-sm text-muted mt-1 mb-6">Create credentials a teacher will use to sign in.</p>
            <div className="space-y-3">
              {STEPS.map((label, i) => (
                <div key={label} className={cn('flex items-center gap-3 p-3 rounded-xl border transition-all', i === step ? 'border-accent bg-accent-soft' : i < step ? 'border-border bg-surface-2' : 'border-border')}>
                  <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0', i <= step ? 'bg-brand text-white' : 'bg-surface-3 text-muted')}>
                    {i < step ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={cn('text-sm font-medium', i <= step ? 'text-fg' : 'text-muted')}>{label} Information</span>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-3">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 0 && (
                <>
                  <FormField label="First Name" icon={User} error={errors.first_name}><Input value={form.first_name} error={!!errors.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="Enter first name" /></FormField>
                  <FormField label="Last Name" icon={User} error={errors.last_name}><Input value={form.last_name} error={!!errors.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Enter last name" /></FormField>
                  <div className="flex justify-end"><Button type="button" icon={<ArrowRight className="w-4 h-4" />} onClick={() => validate(0) && setStep(1)}>Continue</Button></div>
                </>
              )}

              {step === 1 && (
                <>
                  <FormField label="Username" icon={User} error={errors.username}><Input value={form.username} error={!!errors.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="3–15 characters" /></FormField>
                  <FormField label="Email" icon={AtSign} error={errors.email}><Input type="email" value={form.email} error={!!errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" /></FormField>
                  <div className="flex justify-between">
                    <Button type="button" variant="secondary" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => { setStep(0); setErrors({}) }}>Back</Button>
                    <Button type="button" icon={<ArrowRight className="w-4 h-4" />} onClick={() => validate(1) && setStep(2)}>Continue</Button>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <FormField label="Password" icon={Lock} error={errors.password1}>
                    <div className="relative">
                      <Input type={show.p1 ? 'text' : 'password'} value={form.password1} error={!!errors.password1} onChange={(e) => setForm({ ...form, password1: e.target.value })} placeholder="Min. 8 characters" className="pr-10" />
                      <button type="button" onClick={() => setShow((s) => ({ ...s, p1: !s.p1 }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg">{show.p1 ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}</button>
                    </div>
                    {form.password1 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden"><div className={cn('h-full rounded-full transition-all', strength.color)} style={{ width: `${strength.score * 25}%` }} /></div>
                        <span className="text-xs text-muted w-12">{strength.label}</span>
                      </div>
                    )}
                  </FormField>
                  <FormField label="Confirm Password" icon={Lock} error={errors.password2}>
                    <div className="relative">
                      <Input type={show.p2 ? 'text' : 'password'} value={form.password2} error={!!errors.password2} onChange={(e) => setForm({ ...form, password2: e.target.value })} placeholder="Re-enter password" className="pr-10" />
                      <button type="button" onClick={() => setShow((s) => ({ ...s, p2: !s.p2 }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg">{show.p2 ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}</button>
                    </div>
                  </FormField>
                  <div className="flex justify-between pt-1">
                    <Button type="button" variant="secondary" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => { setStep(1); setErrors({}) }}>Back</Button>
                    <Button type="submit" loading={loading} icon={<UserPlus className="w-4 h-4" />}>Create Account</Button>
                  </div>
                </>
              )}
            </form>
          </Card>
        </Reveal>
      </div>
    </div>
  )
}
