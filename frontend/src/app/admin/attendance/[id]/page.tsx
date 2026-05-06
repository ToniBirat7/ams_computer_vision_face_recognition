'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { alterAttendance } from '@/lib/api'

interface AttendanceRecord {
  id: number
  student_name: string
  student_id: number
  course_title: string
  date: string
  status: 'P' | 'A'
}

export default function AlterAttendancePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [record, setRecord] = useState<AttendanceRecord | null>(null)
  const [status, setStatus] = useState<'P' | 'A'>('P')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/django/api/attendance-record/${id}/`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        setRecord(d)
        setStatus(d.status)
        setLoading(false)
      })
      .catch(() => { toast.error('Failed to load record'); setLoading(false) })
  }, [id])

  const handleSave = async () => {
    if (!record) return
    setSaving(true)
    try {
      await alterAttendance(record.id, { stats: status })
      toast.success('Attendance updated successfully')
      router.push('/admin/attendance/review')
    } catch {
      toast.error('Failed to update attendance')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin w-8 h-8 text-[#00a4bd]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="text-center py-20">
        <p className="text-[#4a5568]">Attendance record not found.</p>
        <Link href="/admin/attendance/review" className="text-[#00a4bd] text-sm mt-2 inline-block hover:underline">
          Back to Review
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href="/admin/attendance/review"
        className="inline-flex items-center gap-2 text-sm text-[#4a5568] hover:text-[#003b5c] transition-colors"
      >
        <i className="bx bx-arrow-back text-lg" />
        Back to Review
      </Link>

      {/* Header */}
      <div className="bg-white rounded-card shadow-sm p-6">
        <h1 className="text-2xl font-bold text-[#2d3748] mb-2">Alter Attendance</h1>
        <div className="flex flex-wrap gap-3 text-sm text-[#4a5568]">
          <span className="flex items-center gap-1.5">
            <i className="bx bxs-book-open text-[#00a4bd]" />
            {record.course_title}
          </span>
          <span className="flex items-center gap-1.5">
            <i className="bx bx-calendar text-[#00a4bd]" />
            {new Date(record.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Student Row */}
      <div className="bg-white rounded-card shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <h3 className="font-semibold text-[#2d3748] text-lg">{record.student_name}</h3>
            <span className="text-sm text-[#4a5568]">Student ID: #{record.student_id}</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStatus('P')}
              className={`flex items-center gap-2 px-5 py-3 rounded-input font-medium text-sm transition-all border-2 ${
                status === 'P'
                  ? 'bg-green-500 border-green-500 text-white shadow-md'
                  : 'border-gray-200 text-[#4a5568] hover:border-green-300 hover:text-green-600'
              }`}
            >
              <i className="bx bxs-user-check text-lg" />
              Present
            </button>
            <button
              onClick={() => setStatus('A')}
              className={`flex items-center gap-2 px-5 py-3 rounded-input font-medium text-sm transition-all border-2 ${
                status === 'A'
                  ? 'bg-red-500 border-red-500 text-white shadow-md'
                  : 'border-gray-200 text-[#4a5568] hover:border-red-300 hover:text-red-600'
              }`}
            >
              <i className="bx bxs-user-x text-lg" />
              Absent
            </button>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-[#003b5c] text-white font-medium rounded-input hover:bg-[#002d47] transition-colors disabled:opacity-60"
        >
          <i className="bx bx-save text-lg" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
