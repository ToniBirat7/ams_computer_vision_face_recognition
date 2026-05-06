'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { getCsrfToken } from '@/lib/utils'

const guidelines = [
  { icon: 'bx bx-user', title: 'Personal Information', desc: 'Enter accurate student details including full name and address.' },
  { icon: 'bx bx-phone', title: 'Contact Details', desc: 'Provide a valid phone number for communication purposes.' },
  { icon: 'bx bx-info-circle', title: 'Age Verification', desc: 'Ensure the student meets the age requirements for enrollment.' },
]

export default function AddStudentPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', address: '', age: '', phone_number: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [slide, setSlide] = useState(0)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.address.trim()) e.address = 'Address is required'
    if (!form.age || Number(form.age) < 20 || Number(form.age) > 30) e.age = 'Age must be between 20 and 30'
    if (!/^\d{10}$/.test(form.phone_number)) e.phone_number = 'Phone number must be 10 digits'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      // Seed CSRF
      await fetch('/api/django/', { credentials: 'include' })
      const csrf = getCsrfToken()
      const body = new URLSearchParams(form)
      body.append('csrfmiddlewaretoken', csrf)
      const r = await fetch('/api/django/student/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRFToken': csrf,
        },
        body: body.toString(),
      })
      if (r.ok) {
        toast.success('Student registered successfully')
        setForm({ name: '', address: '', age: '', phone_number: '' })
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
      {/* Guidelines Panel */}
      <div className="bg-white rounded-card shadow-sm p-8 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-[#2d3748]">Student Registration Guidelines</h2>
        <div className="relative overflow-hidden flex-1">
          {guidelines.map((g, i) => (
            <div
              key={i}
              className={`transition-all duration-300 ${i === slide ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
            >
              <div className="flex flex-col items-center text-center gap-4 py-8">
                <div className="w-16 h-16 rounded-full bg-[#003b5c]/10 flex items-center justify-center">
                  <i className={`${g.icon} text-3xl text-[#003b5c]`} />
                </div>
                <h3 className="text-lg font-semibold text-[#2d3748]">{g.title}</h3>
                <p className="text-[#4a5568] text-sm leading-relaxed">{g.desc}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Dots */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setSlide((s) => (s - 1 + guidelines.length) % guidelines.length)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <i className="bx bx-chevron-left text-xl text-[#4a5568]" />
          </button>
          {guidelines.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === slide ? 'bg-[#003b5c] w-4' : 'bg-gray-300'}`}
            />
          ))}
          <button
            onClick={() => setSlide((s) => (s + 1) % guidelines.length)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <i className="bx bx-chevron-right text-xl text-[#4a5568]" />
          </button>
        </div>
      </div>

      {/* Form Panel */}
      <div className="bg-white rounded-card shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#2d3748]">Register New Student</h1>
          <p className="text-[#4a5568] text-sm mt-1">Fill in the details below to register a student</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Full Name" icon="bx bx-user" error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter full name"
              className={`w-full px-4 py-3 border rounded-input text-sm outline-none transition-colors ${errors.name ? 'border-[#e31837]' : 'border-gray-200 focus:border-[#00a4bd]'}`}
            />
          </FormField>

          <FormField label="Address" icon="bx bx-map" error={errors.address}>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Enter address"
              className={`w-full px-4 py-3 border rounded-input text-sm outline-none transition-colors ${errors.address ? 'border-[#e31837]' : 'border-gray-200 focus:border-[#00a4bd]'}`}
            />
          </FormField>

          <FormField label="Age" icon="bx bx-calendar" error={errors.age}>
            <input
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              placeholder="Enter age (20-30)"
              min="20"
              max="30"
              className={`w-full px-4 py-3 border rounded-input text-sm outline-none transition-colors ${errors.age ? 'border-[#e31837]' : 'border-gray-200 focus:border-[#00a4bd]'}`}
            />
          </FormField>

          <FormField label="Phone Number" icon="bx bx-phone" error={errors.phone_number}>
            <input
              type="tel"
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              placeholder="10-digit phone number"
              className={`w-full px-4 py-3 border rounded-input text-sm outline-none transition-colors ${errors.phone_number ? 'border-[#e31837]' : 'border-gray-200 focus:border-[#00a4bd]'}`}
            />
          </FormField>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#003b5c] text-white font-medium text-sm rounded-input hover:bg-[#002d47] transition-colors disabled:opacity-60"
          >
            <i className="bx bx-user-plus text-lg" />
            {loading ? 'Registering...' : 'Register Student'}
          </button>
        </form>
      </div>
    </div>
  )
}

function FormField({ label, icon, error, children }: {
  label: string; icon: string; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium text-[#4a5568] mb-1.5">
        <i className={`${icon} text-[#00a4bd]`} />
        {label}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-[#e31837] mt-1">
          <i className="bx bx-error-circle" />
          {error}
        </p>
      )}
    </div>
  )
}
