'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getCsrfToken } from '@/lib/utils'
import type { Teacher } from '@/types/api'

const guidelines = [
  { icon: 'bx bx-book-open', title: 'Course Information', desc: 'Enter accurate course details including title and duration.' },
  { icon: 'bx bx-user-voice', title: 'Teacher Assignment', desc: 'Select a qualified teacher to lead the course.' },
  { icon: 'bx bx-time-five', title: 'Shift Selection', desc: 'Choose appropriate shift timing for the course.' },
]

export default function AddCoursePage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [form, setForm] = useState({ teacher: '', title: '', duration: '', shift: 'M' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    fetch('/api/django/api/teachers/', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setTeachers(d.teachers ?? []))
      .catch(() => toast.error('Failed to load teachers'))
  }, [])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.teacher) e.teacher = 'Please select a teacher'
    if (!form.title.trim()) e.title = 'Course title is required'
    if (!form.duration || Number(form.duration) < 1) e.duration = 'Duration must be at least 1 week'
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
      const body = new URLSearchParams({
        teacher: form.teacher,
        title: form.title,
        duration: form.duration,
        shift: form.shift,
        csrfmiddlewaretoken: csrf,
      })
      const r = await fetch('/api/django/add-course/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRFToken': csrf,
        },
        body: body.toString(),
      })
      if (r.ok) {
        toast.success('Course added successfully')
        setForm({ teacher: '', title: '', duration: '', shift: 'M' })
        setErrors({})
      } else {
        toast.error('Failed to add course. Please try again.')
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
        <h2 className="text-xl font-bold text-[#2d3748]">Course Registration Guidelines</h2>
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

      {/* Form Panel */}
      <div className="bg-white rounded-card shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#2d3748]">Add New Course</h1>
          <p className="text-[#4a5568] text-sm mt-1">Fill in the details below to create a new course</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-[#4a5568] mb-1.5">
              <i className="bx bx-user-voice text-[#00a4bd]" />
              Teacher
            </label>
            <select
              value={form.teacher}
              onChange={(e) => setForm({ ...form, teacher: e.target.value })}
              className={`w-full px-4 py-3 border rounded-input text-sm outline-none transition-colors bg-white ${errors.teacher ? 'border-[#e31837]' : 'border-gray-200 focus:border-[#00a4bd]'}`}
            >
              <option value="">Select a teacher...</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.first_name} {t.last_name}
                </option>
              ))}
            </select>
            {errors.teacher && <p className="flex items-center gap-1 text-xs text-[#e31837] mt-1"><i className="bx bx-error-circle" />{errors.teacher}</p>}
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-[#4a5568] mb-1.5">
              <i className="bx bx-book text-[#00a4bd]" />
              Course Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter course title"
              className={`w-full px-4 py-3 border rounded-input text-sm outline-none transition-colors ${errors.title ? 'border-[#e31837]' : 'border-gray-200 focus:border-[#00a4bd]'}`}
            />
            {errors.title && <p className="flex items-center gap-1 text-xs text-[#e31837] mt-1"><i className="bx bx-error-circle" />{errors.title}</p>}
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-[#4a5568] mb-1.5">
              <i className="bx bx-time text-[#00a4bd]" />
              Duration (weeks)
            </label>
            <input
              type="number"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              placeholder="Number of weeks"
              min="1"
              className={`w-full px-4 py-3 border rounded-input text-sm outline-none transition-colors ${errors.duration ? 'border-[#e31837]' : 'border-gray-200 focus:border-[#00a4bd]'}`}
            />
            {errors.duration && <p className="flex items-center gap-1 text-xs text-[#e31837] mt-1"><i className="bx bx-error-circle" />{errors.duration}</p>}
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-[#4a5568] mb-3">
              <i className="bx bx-time-five text-[#00a4bd]" />
              Shift
            </label>
            <div className="flex gap-4">
              {[{ value: 'M', label: 'Morning', icon: 'bx bx-sun' }, { value: 'D', label: 'Day', icon: 'bx bx-moon' }].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 flex-1 p-4 border-2 rounded-card cursor-pointer transition-all ${form.shift === opt.value ? 'border-[#003b5c] bg-[#003b5c]/5' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <input
                    type="radio"
                    name="shift"
                    value={opt.value}
                    checked={form.shift === opt.value}
                    onChange={() => setForm({ ...form, shift: opt.value })}
                    className="hidden"
                  />
                  <i className={`${opt.icon} text-xl ${form.shift === opt.value ? 'text-[#003b5c]' : 'text-[#4a5568]'}`} />
                  <span className={`font-medium text-sm ${form.shift === opt.value ? 'text-[#003b5c]' : 'text-[#4a5568]'}`}>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#003b5c] text-white font-medium text-sm rounded-input hover:bg-[#002d47] transition-colors disabled:opacity-60"
          >
            <i className="bx bx-plus-circle text-lg" />
            {loading ? 'Adding...' : 'Add Course'}
          </button>
        </form>
      </div>
    </div>
  )
}
