'use client'

import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { getCsrfToken } from '@/lib/utils'

interface UserOption { id: number; username: string; first_name: string; last_name: string }

const guidelines = [
  { icon: 'bx bx-user-circle', title: 'Personal Information', desc: 'Fill in accurate personal details including name, address, and contact information.' },
  { icon: 'bx bx-phone', title: 'Contact Details', desc: 'Provide both primary and secondary contact numbers for better reachability.' },
  { icon: 'bx bx-image', title: 'Profile Image', desc: 'Upload a clear, professional photo. Supported formats: JPG, PNG (max 5MB).' },
]

export default function AddTeacherPage() {
  const [users, setUsers] = useState<UserOption[]>([])
  const [form, setForm] = useState({
    teacher: '', address: '', primary_number: '', secondary_number: '', dob: '', sex: 'M',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [slide, setSlide] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/django/api/users/', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []))
      .catch(() => toast.error('Failed to load users'))
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.teacher) e.teacher = 'Please select a user'
    if (!form.address.trim()) e.address = 'Address is required'
    if (!/^\d{10}$/.test(form.primary_number)) e.primary_number = 'Primary number must be 10 digits'
    if (form.secondary_number && !/^\d{10}$/.test(form.secondary_number)) e.secondary_number = 'Secondary number must be 10 digits'
    if (!form.dob) e.dob = 'Date of birth is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await fetch('/api/django/', { credentials: 'include' })
      const csrf = getCsrfToken()
      const body = new FormData()
      body.append('teacher', form.teacher)
      body.append('address', form.address)
      body.append('primary_number', form.primary_number)
      body.append('secondary_number', form.secondary_number)
      body.append('dob', form.dob)
      body.append('sex', form.sex)
      if (imageFile) body.append('my_image', imageFile)
      body.append('csrfmiddlewaretoken', csrf)

      const r = await fetch('/api/django/teacher/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRFToken': csrf },
        body,
      })
      if (r.ok) {
        toast.success('Teacher registered successfully')
        setForm({ teacher: '', address: '', primary_number: '', secondary_number: '', dob: '', sex: 'M' })
        setImageFile(null)
        setImagePreview(null)
        setErrors({})
      } else {
        toast.error('Registration failed. Please check the form.')
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
        <h2 className="text-xl font-bold text-[#2d3748]">Teacher Registration Guidelines</h2>
        <div className="relative overflow-hidden min-h-[200px] flex-1">
          {guidelines.map((g, i) => (
            <div key={i} className={`transition-all duration-300 ${i === slide ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}>
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
          <h1 className="text-2xl font-bold text-[#2d3748]">Register New Teacher</h1>
          <p className="text-[#4a5568] text-sm mt-1">Fill in the details below to register a teacher</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User select */}
          <Field label="Select User" icon="bx bx-user" error={errors.teacher}>
            <select value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })}
              className={`w-full px-4 py-3 border rounded-input text-sm outline-none bg-white transition-colors ${errors.teacher ? 'border-[#e31837]' : 'border-gray-200 focus:border-[#00a4bd]'}`}>
              <option value="">Select a user...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.username})</option>
              ))}
            </select>
          </Field>

          <Field label="Address" icon="bx bx-map" error={errors.address}>
            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Enter address"
              className={`w-full px-4 py-3 border rounded-input text-sm outline-none transition-colors ${errors.address ? 'border-[#e31837]' : 'border-gray-200 focus:border-[#00a4bd]'}`} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Primary Number" icon="bx bx-phone" error={errors.primary_number}>
              <input type="tel" value={form.primary_number} onChange={(e) => setForm({ ...form, primary_number: e.target.value })} placeholder="10-digit number"
                className={`w-full px-4 py-3 border rounded-input text-sm outline-none transition-colors ${errors.primary_number ? 'border-[#e31837]' : 'border-gray-200 focus:border-[#00a4bd]'}`} />
            </Field>
            <Field label="Secondary Number" icon="bx bx-phone" error={errors.secondary_number}>
              <input type="tel" value={form.secondary_number} onChange={(e) => setForm({ ...form, secondary_number: e.target.value })} placeholder="10-digit number (optional)"
                className={`w-full px-4 py-3 border rounded-input text-sm outline-none transition-colors ${errors.secondary_number ? 'border-[#e31837]' : 'border-gray-200 focus:border-[#00a4bd]'}`} />
            </Field>
          </div>

          <Field label="Date of Birth" icon="bx bx-calendar" error={errors.dob}>
            <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })}
              className={`w-full px-4 py-3 border rounded-input text-sm outline-none transition-colors ${errors.dob ? 'border-[#e31837]' : 'border-gray-200 focus:border-[#00a4bd]'}`} />
          </Field>

          {/* Gender */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-[#4a5568] mb-2">
              <i className="bx bx-user text-[#00a4bd]" /> Gender
            </label>
            <div className="flex gap-4">
              {[{ val: 'M', label: 'Male', icon: 'bx bx-male' }, { val: 'F', label: 'Female', icon: 'bx bx-female' }].map((g) => (
                <label key={g.val} className={`flex items-center gap-3 flex-1 p-3 border-2 rounded-card cursor-pointer transition-all ${form.sex === g.val ? 'border-[#003b5c] bg-[#003b5c]/5' : 'border-gray-200'}`}>
                  <input type="radio" name="sex" value={g.val} checked={form.sex === g.val} onChange={() => setForm({ ...form, sex: g.val })} className="hidden" />
                  <i className={`${g.icon} text-lg ${form.sex === g.val ? 'text-[#003b5c]' : 'text-[#4a5568]'}`} />
                  <span className={`text-sm font-medium ${form.sex === g.val ? 'text-[#003b5c]' : 'text-[#4a5568]'}`}>{g.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-[#4a5568] mb-2">
              <i className="bx bx-image-add text-[#00a4bd]" /> Profile Image
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-card p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-[#00a4bd] transition-colors"
            >
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <>
                  <i className="bx bx-image-add text-4xl text-gray-300" />
                  <span className="text-sm text-[#4a5568]">Click or drag image here to upload</span>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#003b5c] text-white font-medium text-sm rounded-input hover:bg-[#002d47] transition-colors disabled:opacity-60">
            <i className="bx bx-user-plus text-lg" />
            {loading ? 'Registering...' : 'Register Teacher'}
          </button>
        </form>
      </div>
    </div>
  )
}

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
