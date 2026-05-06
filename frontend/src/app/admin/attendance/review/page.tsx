'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface AttendanceRecord {
  id: number
  date: string
  student_name: string
  course_title: string
  status: string
}

export default function ReviewAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    fetch('/api/django/api/review-attendance/', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { setRecords(d.records ?? []); setLoading(false) })
      .catch(() => { toast.error('Failed to load attendance records'); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchSearch = !search || r.course_title.toLowerCase().includes(search.toLowerCase()) || r.student_name.toLowerCase().includes(search.toLowerCase())
      const matchDate = !dateFilter || r.date === dateFilter
      return matchSearch && matchDate
    })
  }, [records, search, dateFilter])

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[#2d3748]">Review Attendance</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5568]" />
            <input
              type="text"
              placeholder="Search by course or student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-input text-sm outline-none focus:border-[#00a4bd] transition-colors w-56"
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-input text-sm outline-none focus:border-[#00a4bd] transition-colors"
          />
        </div>
      </div>

      {/* Records */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin w-8 h-8 text-[#00a4bd]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-card shadow-sm flex flex-col items-center justify-center py-20 gap-3">
          <i className="bx bx-calendar-x text-5xl text-gray-200" />
          <p className="text-[#4a5568] text-sm">No attendance records found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-card shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#4a5568] font-mono bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                  #{r.id}
                </span>
                <div>
                  <h3 className="font-semibold text-[#2d3748]">{r.course_title}</h3>
                  <p className="text-sm text-[#4a5568]">{r.student_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-[#4a5568]">
                <span className="flex items-center gap-1">
                  <i className="bx bx-calendar text-[#00a4bd]" />
                  {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span
                  className={`px-3 py-1 rounded-badge text-xs font-medium ${
                    r.status === 'P'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {r.status === 'P' ? 'Present' : 'Absent'}
                </span>
              </div>

              <Link
                href={`/admin/attendance/${r.id}`}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-[#003b5c] rounded-input hover:bg-[#002d47] transition-colors flex-shrink-0"
              >
                <i className="bx bx-edit-alt" />
                Alter
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
