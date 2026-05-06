'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface ProfileData {
  email: string
  address: string
  primary_number: string
  secondary_number: string
}

export default function EditProfilePage() {
  const router = useRouter()
  const [form, setForm] = useState<ProfileData>({
    email: '',
    address: '',
    primary_number: '',
    secondary_number: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/django/api/teacher/profile/', { credentials: 'include', cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        setForm({
          email: d.email ?? '',
          address: d.address ?? '',
          primary_number: d.primary_number ?? '',
          secondary_number: d.secondary_number ?? '',
        })
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  function getCsrf(): string {
    const m = document.cookie.match(/csrftoken=([^;]+)/)
    return m ? m[1] : ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.primary_number && !/^\d{10}$/.test(form.primary_number)) {
      toast.error('Primary phone must be 10 digits')
      return
    }
    if (form.secondary_number && !/^\d{10}$/.test(form.secondary_number)) {
      toast.error('Secondary phone must be 10 digits')
      return
    }
    setSaving(true)
    try {
      const body = new URLSearchParams()
      body.append('email', form.email)
      body.append('address', form.address)
      body.append('primary_number', form.primary_number)
      body.append('secondary_number', form.secondary_number)

      const res = await fetch('/api/django/teacher/edit-profile/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRFToken': getCsrf(),
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: body.toString(),
      })
      if (res.ok) {
        toast.success('Profile updated successfully')
        router.push('/teacher/profile')
      } else {
        toast.error('Failed to update profile')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#003b5c] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h1 className="text-2xl font-bold text-[#2d3748] flex items-center gap-2">
          <i className="bx bx-edit-alt text-[#00a4bd]" />
          Edit Profile
        </h1>
        <p className="text-[#4a5568] text-sm mt-1">Update your personal information</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white rounded-card shadow-sm p-6 space-y-6">
        {/* Personal Information */}
        <div>
          <h2 className="font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <i className="bx bx-user text-[#00a4bd]" />
            Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#4a5568] uppercase tracking-wide mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                minLength={5}
                maxLength={50}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-input text-sm text-[#2d3748] focus:outline-none focus:border-[#00a4bd] focus:ring-1 focus:ring-[#00a4bd]/30 transition"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4a5568] uppercase tracking-wide mb-1">
                Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                minLength={5}
                maxLength={100}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-input text-sm text-[#2d3748] focus:outline-none focus:border-[#00a4bd] focus:ring-1 focus:ring-[#00a4bd]/30 transition"
                placeholder="Your address"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h2 className="font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
            <i className="bx bx-phone text-[#00a4bd]" />
            Contact Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#4a5568] uppercase tracking-wide mb-1">
                Primary Phone
              </label>
              <input
                type="tel"
                value={form.primary_number}
                onChange={(e) => setForm({ ...form, primary_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                pattern="[0-9]{10}"
                maxLength={10}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-input text-sm text-[#2d3748] focus:outline-none focus:border-[#00a4bd] focus:ring-1 focus:ring-[#00a4bd]/30 transition"
                placeholder="10-digit number"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4a5568] uppercase tracking-wide mb-1">
                Secondary Phone
              </label>
              <input
                type="tel"
                value={form.secondary_number}
                onChange={(e) => setForm({ ...form, secondary_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                pattern="[0-9]{10}"
                maxLength={10}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-input text-sm text-[#2d3748] focus:outline-none focus:border-[#00a4bd] focus:ring-1 focus:ring-[#00a4bd]/30 transition"
                placeholder="10-digit number"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <Link
            href="/teacher/profile"
            className="flex items-center gap-2 px-5 py-2.5 border border-[#003b5c] text-[#003b5c] text-sm font-medium rounded-input hover:bg-[#003b5c]/5 transition-colors"
          >
            <i className="bx bx-arrow-back" />
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#003b5c] text-white text-sm font-medium rounded-input hover:bg-[#002d47] disabled:opacity-60 transition-colors"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <i className="bx bx-save" />
            )}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
