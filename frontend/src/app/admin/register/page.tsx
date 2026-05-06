'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { getCsrfToken } from '@/lib/utils'

const guidelines = [
  { icon: 'bx bx-user-circle', title: 'Username Requirements', desc: 'Choose a unique username with 3-15 characters. Use letters, numbers, and underscores only.' },
  { icon: 'bx bx-lock-alt', title: 'Password Guidelines', desc: 'Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.' },
  { icon: 'bx bx-envelope', title: 'Email Verification', desc: 'Use a valid email address. A verification link will be sent to complete registration.' },
  { icon: 'bx bx-shield-quarter', title: 'Account Security', desc: 'Your information is encrypted and securely stored. We never share your data with third parties.' },
]

const STEPS = ['Personal Info', 'Account Details', 'Security']

function passwordStrength(p: string): { level: number; label: string; color: string } {
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  const levels = [
    { level: 0, label: '', color: 'bg-gray-200' },
    { level: 1, label: 'Weak', color: 'bg-red-400' },
    { level: 2, label: 'Fair', color: 'bg-yellow-400' },
    { level: 3, label: 'Good', color: 'bg-blue-400' },
    { level: 4, label: 'Strong', color: 'bg-green-500' },
  ]
  return levels[score]
}

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const [slide, setSlide] = useState(0)
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '', email: '', password1: '', password2: '',
  })
  const [showPass, setShowPass] = useState({ p1: false, p2: false })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const strength = passwordStrength(form.password1)

  const validateStep = (s: number) => {
    const e: Record<string, string> = {}
    if (s === 0) {
      if (!form.first_name.trim()) e.first_name = 'First name is required'
      if (!form.last_name.trim()) e.last_name = 'Last name is required'
    } else if (s === 1) {
      if (!form.username.trim()) e.username = 'Username is required'
      if (form.username.length < 3 || form.username.length > 15) e.username = 'Username must be 3-15 characters'
      if (!form.email.includes('@')) e.email = 'Valid email is required'
    } else {
      if (form.password1.length < 8) e.password1 = 'Password must be at least 8 characters'
      if (form.password1 !== form.password2) e.password2 = 'Passwords do not match'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validateStep(step)) setStep((s) => s + 1) }
  const prev = () => { setStep((s) => s - 1); setErrors({}) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(2)) return
    setLoading(true)
    try {
      await fetch('/api/django/', { credentials: 'include' })
      const csrf = getCsrfToken()
      const body = new URLSearchParams({ ...form, csrfmiddlewaretoken: csrf })
      const r = await fetch('/api/django/register/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-CSRFToken': csrf },
        body: body.toString(),
      })
      if (r.ok) {
        toast.success('User registered successfully')
        setForm({ first_name: '', last_name: '', username: '', email: '', password1: '', password2: '' })
        setStep(0)
        setErrors({})
      } else {
        toast.error('Registration failed. Please try again.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Guidelines */}
      <div className="bg-white rounded-card shadow-sm p-8 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-[#2d3748]">Registration Guidelines</h2>
        <div className="relative overflow-hidden min-h-[220px] flex-1">
          {guidelines.map((g, i) => (
            <div key={i} className={`transition-all duration-300 ${i === slide ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}>
              <div className="flex flex-col items-center text-center gap-4 py-6">
                <div className="w-16 h-16 rounded-full bg-[#003b5c]/10 flex items-center justify-center">
                  <i className={`${g.icon} text-3xl text-[#003b5c]`} />
                </div>
                <h3 className="text-lg font-semibold text-[#2d3748]">{g.title}</h3>
                <p className="text-[#4a5568] text-sm leading-relaxed">{g.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setSlide((s) => (s - 1 + guidelines.length) % guidelines.length)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <i className="bx bx-chevron-left text-xl text-[#4a5568]" />
          </button>
          {guidelines.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} className={`h-2 rounded-full transition-all ${i === slide ? 'bg-[#003b5c] w-4' : 'bg-gray-300 w-2'}`} />
          ))}
          <button onClick={() => setSlide((s) => (s + 1) % guidelines.length)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <i className="bx bx-chevron-right text-xl text-[#4a5568]" />
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-card shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#2d3748]">Create New User Account</h1>
          <p className="text-[#4a5568] text-sm mt-1">Fill in the details below to register a new user</p>

          {/* Progress steps */}
          <div className="flex items-center gap-2 mt-5">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${i <= step ? 'bg-[#003b5c] text-white' : 'bg-gray-200 text-[#4a5568]'}`}>
                  {i < step ? <i className="bx bx-check" /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i <= step ? 'text-[#003b5c]' : 'text-[#4a5568]'}`}>{label}</span>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-[#003b5c]' : 'bg-gray-200'} ml-1`} />}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step 1 */}
          {step === 0 && (
            <div className="space-y-4">
              <Field label="First Name" icon="bx bx-user" error={errors.first_name}>
                <input type="text" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="Enter first name"
                  className={inputCls(errors.first_name)} />
              </Field>
              <Field label="Last Name" icon="bx bx-user" error={errors.last_name}>
                <input type="text" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Enter last name"
                  className={inputCls(errors.last_name)} />
              </Field>
              <div className="flex justify-end">
                <button type="button" onClick={next} className="flex items-center gap-2 px-6 py-2.5 bg-[#003b5c] text-white text-sm font-medium rounded-input hover:bg-[#002d47] transition-colors">
                  Continue <i className="bx bx-right-arrow-alt text-lg" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 1 && (
            <div className="space-y-4">
              <Field label="Username" icon="bx bx-user-circle" error={errors.username}>
                <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="3-15 characters"
                  className={inputCls(errors.username)} />
              </Field>
              <Field label="Email Address" icon="bx bx-envelope" error={errors.email}>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter email"
                  className={inputCls(errors.email)} />
              </Field>
              <div className="flex justify-between">
                <button type="button" onClick={prev} className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#4a5568] border border-gray-200 rounded-input hover:bg-gray-50 transition-colors">
                  <i className="bx bx-left-arrow-alt" /> Back
                </button>
                <button type="button" onClick={next} className="flex items-center gap-2 px-6 py-2.5 bg-[#003b5c] text-white text-sm font-medium rounded-input hover:bg-[#002d47] transition-colors">
                  Continue <i className="bx bx-right-arrow-alt" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 2 && (
            <div className="space-y-4">
              <Field label="Password" icon="bx bx-lock-alt" error={errors.password1}>
                <div className="relative">
                  <input type={showPass.p1 ? 'text' : 'password'} value={form.password1}
                    onChange={(e) => setForm({ ...form, password1: e.target.value })} placeholder="Min. 8 characters"
                    className={`${inputCls(errors.password1)} pr-10`} />
                  <button type="button" onClick={() => setShowPass((s) => ({ ...s, p1: !s.p1 }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a5568]">
                    <i className={`bx ${showPass.p1 ? 'bx-hide' : 'bx-show'} text-lg`} />
                  </button>
                </div>
                {form.password1 && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: `${strength.level * 25}%` }} />
                    </div>
                    <span className="text-xs text-[#4a5568] mt-1">{strength.label}</span>
                  </div>
                )}
              </Field>
              <Field label="Confirm Password" icon="bx bx-lock-alt" error={errors.password2}>
                <div className="relative">
                  <input type={showPass.p2 ? 'text' : 'password'} value={form.password2}
                    onChange={(e) => setForm({ ...form, password2: e.target.value })} placeholder="Confirm password"
                    className={`${inputCls(errors.password2)} pr-10`} />
                  <button type="button" onClick={() => setShowPass((s) => ({ ...s, p2: !s.p2 }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a5568]">
                    <i className={`bx ${showPass.p2 ? 'bx-hide' : 'bx-show'} text-lg`} />
                  </button>
                </div>
              </Field>
              <div className="flex justify-between pt-1">
                <button type="button" onClick={prev} className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#4a5568] border border-gray-200 rounded-input hover:bg-gray-50 transition-colors">
                  <i className="bx bx-left-arrow-alt" /> Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#003b5c] text-white text-sm font-medium rounded-input hover:bg-[#002d47] transition-colors disabled:opacity-60">
                  <i className="bx bx-user-plus" />
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

const inputCls = (err?: string) =>
  `w-full px-4 py-3 border rounded-input text-sm outline-none transition-colors ${err ? 'border-[#e31837]' : 'border-gray-200 focus:border-[#00a4bd]'}`

function Field({ label, icon, error, children }: { label: string; icon: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium text-[#4a5568] mb-1.5">
        <i className={`${icon} text-[#00a4bd]`} />{label}
      </label>
      {children}
      {error && <p className="flex items-center gap-1 text-xs text-[#e31837] mt-1"><i className="bx bx-error-circle" />{error}</p>}
    </div>
  )
}
