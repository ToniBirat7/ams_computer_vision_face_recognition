'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface StudentClass {
  id: number
  student_id: number
  student_name: string
  course_id: number
  course_title: string
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<StudentClass[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const r = await fetch('/api/django/api/classes/', { credentials: 'include' })
      if (!r.ok) throw new Error('Failed to load classes')
      const data = await r.json()
      setClasses(data.classes ?? [])
    } catch {
      toast.error('Failed to load class enrollments')
    } finally {
      setLoading(false)
    }
  }

  const deleteClass = async (id: number) => {
    if (!confirm('Are you sure you want to remove this student from the class?')) return
    setDeleting(id)
    try {
      const r = await fetch(`/api/django/delete-class/${id}/`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!r.ok) throw new Error('Failed to delete enrollment')
      setClasses((prev) => prev.filter((c) => c.id !== id))
      toast.success('Student removed from class')
    } catch {
      toast.error('Failed to remove student')
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
          <h1 className="text-2xl font-bold text-[#2d3748]">Class Enrollments</h1>
          <p className="text-[#4a5568] text-sm mt-1">Manage student class assignments</p>
        </div>
        <Link
          href="/admin/classes/add"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#003b5c] text-white text-sm font-medium rounded-input hover:bg-[#002d47] transition-colors"
        >
          <i className="bx bx-plus-circle" />
          Assign Class
        </Link>
      </header>

      <div className="bg-white rounded-card shadow-sm overflow-hidden">
        {classes.length === 0 ? (
          <div className="p-8 text-center">
            <i className="bx bx-group text-5xl text-[#4a5568] opacity-50 mb-2 block" />
            <p className="text-[#4a5568]">No class enrollments yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#003b5c' }}>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/80 uppercase tracking-wider">Student</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/80 uppercase tracking-wider">Course</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-white/80 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {classes.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-[#2d3748]">{enrollment.student_name}</td>
                    <td className="px-5 py-3 text-[#4a5568]">{enrollment.course_title}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => deleteClass(enrollment.id)}
                        disabled={deleting === enrollment.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-input text-xs font-medium transition-colors disabled:opacity-60"
                      >
                        <i className="bx bx-trash" />
                        Remove
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
