'use client'

import { useState, useEffect } from 'react'
import Select from 'react-select'
import toast from 'react-hot-toast'
import { getCsrfToken } from '@/lib/utils'
import type { Student, Course } from '@/types/api'

const guidelines = [
  { icon: 'bx bx-user-pin', title: 'Student Selection', desc: 'Select one or multiple students to assign to the class.' },
  { icon: 'bx bx-book-reader', title: 'Course Assignment', desc: 'Choose the appropriate course for the selected students.' },
  { icon: 'bx bx-check-circle', title: 'Confirmation', desc: 'Review your selection before submitting the assignment.' },
]

const reactSelectStyles = {
  control: (base: object) => ({
    ...base,
    borderRadius: '8px',
    borderColor: 'rgba(0,0,0,0.1)',
    boxShadow: 'none',
    '&:hover': { borderColor: '#00a4bd' },
    padding: '4px 0',
  }),
  option: (base: object, { isFocused }: { isFocused: boolean }) => ({
    ...base,
    background: isFocused ? 'rgba(0,164,189,0.1)' : 'white',
    color: '#2d3748',
  }),
  multiValue: (base: object) => ({ ...base, background: '#003b5c', borderRadius: '20px' }),
  multiValueLabel: (base: object) => ({ ...base, color: 'white', fontSize: '12px', padding: '2px 6px' }),
  multiValueRemove: (base: object) => ({ ...base, color: 'white', ':hover': { background: '#002d47', borderRadius: '0 20px 20px 0' } }),
}

export default function AddClassPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedStudents, setSelectedStudents] = useState<{ value: number; label: string }[]>([])
  const [selectedCourse, setSelectedCourse] = useState<{ value: number; label: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    Promise.all([
      fetch('/api/django/api/students/', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/django/api/courses/', { credentials: 'include' }).then((r) => r.json()),
    ]).then(([sd, cd]) => {
      setStudents(sd.students ?? [])
      setCourses(cd.courses ?? [])
    }).catch(() => toast.error('Failed to load data'))
  }, [])

  const studentOptions = students.map((s) => ({ value: s.id, label: `${s.name} (#${s.id})` }))
  const courseOptions = courses.map((c) => ({ value: c.id, label: c.title }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedStudents.length === 0) { toast.error('Please select at least one student'); return }
    if (!selectedCourse) { toast.error('Please select a course'); return }
    setLoading(true)
    try {
      await fetch('/api/django/', { credentials: 'include' })
      const csrf = getCsrfToken()
      const body = new URLSearchParams()
      selectedStudents.forEach((s) => body.append('student', String(s.value)))
      body.append('course', String(selectedCourse.value))
      body.append('csrfmiddlewaretoken', csrf)

      const r = await fetch('/api/django/add-student-class/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRFToken': csrf,
        },
        body: body.toString(),
      })
      if (r.ok) {
        toast.success('Class assigned successfully')
        setSelectedStudents([])
        setSelectedCourse(null)
      } else {
        toast.error('Assignment failed. Please try again.')
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
        <h2 className="text-xl font-bold text-[#2d3748]">Class Assignment Guidelines</h2>
        <div className="relative overflow-hidden flex-1 min-h-[200px]">
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

      {/* Form Panel */}
      <div className="bg-white rounded-card shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#2d3748]">Assign Class</h1>
          <p className="text-[#4a5568] text-sm mt-1">Select students and assign them to a course</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-[#4a5568] mb-1.5">
              <i className="bx bx-user-pin text-[#00a4bd]" />
              Select Students
            </label>
            <Select
              isMulti
              options={studentOptions}
              value={selectedStudents}
              onChange={(v) => setSelectedStudents(v as typeof selectedStudents)}
              placeholder="Search and select students..."
              styles={reactSelectStyles as never}
              classNamePrefix="rs"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-[#4a5568] mb-1.5">
              <i className="bx bx-book-reader text-[#00a4bd]" />
              Select Course
            </label>
            <Select
              options={courseOptions}
              value={selectedCourse}
              onChange={(v) => setSelectedCourse(v)}
              placeholder="Select a course..."
              styles={reactSelectStyles as never}
              classNamePrefix="rs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#003b5c] text-white font-medium text-sm rounded-input hover:bg-[#002d47] transition-colors disabled:opacity-60"
          >
            <i className="bx bx-plus-circle text-lg" />
            {loading ? 'Assigning...' : 'Assign Class'}
          </button>
        </form>
      </div>
    </div>
  )
}
