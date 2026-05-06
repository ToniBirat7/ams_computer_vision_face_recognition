'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import type { Course } from '@/types/api'

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const r = await fetch('/api/django/api/courses/', { credentials: 'include' })
      if (!r.ok) throw new Error('Failed to load courses')
      const data = await r.json()
      setCourses(data.courses ?? [])
    } catch {
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const deleteCourse = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return
    setDeleting(id)
    try {
      const r = await fetch(`/api/django/delete-course/${id}/`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!r.ok) throw new Error('Failed to delete course')
      setCourses((prev) => prev.filter((c) => c.id !== id))
      toast.success('Course deleted successfully')
    } catch {
      toast.error('Failed to delete course')
    } finally {
      setDeleting(null)
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
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2d3748]">Courses</h1>
          <p className="text-[#4a5568] text-sm mt-1">Manage all courses</p>
        </div>
        <Link
          href="/admin/courses/add"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#003b5c] text-white text-sm font-medium rounded-input hover:bg-[#002d47] transition-colors"
        >
          <i className="bx bx-plus-circle" />
          Add Course
        </Link>
      </header>

      <div className="bg-white rounded-card shadow-sm overflow-hidden">
        {courses.length === 0 ? (
          <div className="p-8 text-center">
            <i className="bx bx-book text-5xl text-[#4a5568] opacity-50 mb-2 block" />
            <p className="text-[#4a5568]">No courses found. Create one to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#4a5568] uppercase tracking-wide">Title</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#4a5568] uppercase tracking-wide">Teacher</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#4a5568] uppercase tracking-wide">Duration</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#4a5568] uppercase tracking-wide">Shift</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-[#4a5568] uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-[#2d3748]">{course.title}</td>
                    <td className="px-5 py-3 text-[#4a5568]">{course.teacher_name}</td>
                    <td className="px-5 py-3 text-[#4a5568]">{course.duration} weeks</td>
                    <td className="px-5 py-3 text-[#4a5568]">{course.shift_display ?? course.shift}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => deleteCourse(course.id)}
                        disabled={deleting === course.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-input text-xs font-medium transition-colors disabled:opacity-60"
                      >
                        <i className="bx bx-trash" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
