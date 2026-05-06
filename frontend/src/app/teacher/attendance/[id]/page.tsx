'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useWebSocket } from '@/hooks/useWebSocket'

interface PastRecord { date: string; status: string }
interface Student { id: number; name: string; past_attendance: PastRecord[] }
interface CourseInfo { id: number; title: string; shift: string; shift_display?: string }

function getCsrf(): string {
  const m = document.cookie.match(/csrftoken=([^;]+)/)
  return m ? m[1] : ''
}

function statusColor(s: string) {
  if (s === 'P') return 'bg-green-100 text-green-700'
  if (s === 'A') return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-400'
}

export default function AttendancePage() {
  const { id: courseId } = useParams<{ id: string }>()
  const router = useRouter()
  const courseIdNum = parseInt(courseId)

  const [course, setCourse] = useState<CourseInfo | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [pastDates, setPastDates] = useState<string[]>([])
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [videoSrc, setVideoSrc] = useState<string>('')
  const [detected, setDetected] = useState<{ id: number; name: string; similarity: number }[]>([])
  const [wsStatus, setWsStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')

  const today = new Date()
  const monthName = today.toLocaleDateString('en-US', { month: 'long' })

  // WebSocket callbacks
  const handleStudentDetected = useCallback((student: { id: number; name: string; similarity: number }) => {
    setDetected((prev) => {
      if (prev.some((x) => x.id === student.id)) return prev
      return [...prev, student]
    })
    setChecked((prev) => ({ ...prev, [student.id]: true }))
  }, [])

  const handleFrameUpdate = useCallback((frame: string) => {
    setVideoSrc(frame)
  }, [])

  const handleStatusChange = useCallback((msg: string, type: 'info' | 'error') => {
    if (type === 'error') {
      toast.error(msg)
      setWsStatus('error')
    } else {
      if (msg.includes('Connected')) setWsStatus('connected')
      if (msg.includes('Disconnected')) setWsStatus('disconnected')
    }
  }, [])

  const { isConnected, connect, startStream, stopStream } = useWebSocket({
    courseId: courseIdNum,
    onStudentDetected: handleStudentDetected,
    onFrameUpdate: handleFrameUpdate,
    onStatusChange: handleStatusChange,
  })

  useEffect(() => {
    fetch(`/api/django/api/attendance/${courseId}/`, {
      credentials: 'include',
      cache: 'no-store',
    })
      .then((r) => r.json())
      .then((d) => {
        setCourse(d.course)
        setStudents(d.students)

        const dates: string[] = []
        for (let i = 1; i <= 7; i++) {
          const dt = new Date()
          dt.setDate(dt.getDate() - i)
          dates.push(dt.toISOString().split('T')[0])
        }
        setPastDates(dates)

        const initial: Record<number, boolean> = {}
        d.students.forEach((s: Student) => { initial[s.id] = false })
        setChecked(initial)
      })
      .catch(() => toast.error('Failed to load attendance data'))
      .finally(() => setLoading(false))
  }, [courseId])

  const connectWs = () => {
    setWsStatus('connecting')
    connect()
    setShowVideo(true)
    setTimeout(() => startStream(), 100)
  }

  const stopWs = () => {
    stopStream()
    setShowVideo(false)
    setVideoSrc('')
    setDetected([])
  }

  async function submitAttendance(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const body = new URLSearchParams()
      body.append('csrfmiddlewaretoken', getCsrf())
      students.forEach((s) => {
        body.append(String(s.id), checked[s.id] ? 'P' : 'A')
      })

      const res = await fetch(`/api/django/teacher/attendance/${courseId}/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRFToken': getCsrf(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
        redirect: 'manual',
      })

      if (res.ok || res.status === 302 || res.type === 'opaqueredirect') {
        toast.success('Attendance saved successfully')
        stopWs()
        router.push('/teacher')
      } else {
        toast.error('Failed to save attendance')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  function markAllPresent() {
    setChecked((prev) => {
      const next = { ...prev }
      students.forEach((s) => { next[s.id] = true })
      return next
    })
  }

  const presentCount = Object.values(checked).filter(Boolean).length
  const absentCount = students.length - presentCount

  function getPastStatus(student: Student, dateStr: string): string {
    const rec = student.past_attendance.find((r) => r.date === dateStr)
    return rec ? rec.status : 'NA'
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
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2d3748] flex items-center gap-2">
            <i className="bx bx-calendar-check text-[#00a4bd]" />
            Take Attendance
          </h1>
          {course && (
            <div className="mt-1">
              <h2 className="text-lg font-semibold text-[#003b5c]">{course.title}</h2>
              <p className="text-sm text-[#4a5568]">
                {today.getDate()} {monthName} {today.getFullYear()}
              </p>
            </div>
          )}
        </div>

        {/* Video Attendance Button */}
        {!showVideo ? (
          <button
            onClick={connectWs}
            disabled={isConnected}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#003b5c] text-white text-sm font-medium rounded-input hover:bg-[#002d47] disabled:opacity-60 transition-colors"
          >
            {!isConnected && !showVideo ? (
              <i className="bx bx-camera" />
            ) : (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Start Video Attendance
          </button>
        ) : (
          <button
            onClick={stopWs}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#e31837] text-white text-sm font-medium rounded-input hover:bg-red-700 transition-colors"
          >
            <i className="bx bx-x" />
            Close Camera
          </button>
        )}
      </header>

      {/* Video Feed */}
      {showVideo && (
        <div className="bg-white rounded-card shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#2d3748] flex items-center gap-2">
              <i className="bx bx-face text-[#00a4bd]" />
              Face Recognition Attendance
            </h3>
            <span className={`text-xs px-3 py-1 rounded-badge font-medium ${
              isConnected ? 'bg-green-100 text-green-700' : wsStatus === 'error' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {isConnected ? 'Connected' : wsStatus === 'error' ? 'Error' : 'Connecting'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              {videoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={videoSrc} alt="Video Feed" className="w-full h-auto rounded-input border border-gray-100" />
              ) : (
                <div className="w-full h-64 bg-gray-900 rounded-input flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <i className="bx bx-camera text-4xl mb-2 block" />
                    <p className="text-sm">Initializing camera…</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#2d3748] mb-3">Detected Students</h4>
              {detected.length === 0 ? (
                <p className="text-sm text-[#4a5568]">No students detected yet</p>
              ) : (
                <div className="space-y-2">
                  {detected.map((d) => (
                    <div key={d.id} className="flex items-center gap-2 p-2 bg-green-50 rounded-input border border-green-200">
                      <i className="bx bx-check-circle text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-[#2d3748]">{d.name}</p>
                        <p className="text-xs text-[#4a5568]">{(d.similarity * 100).toFixed(1)}% match</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={submitAttendance} className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: 'bx-group', label: 'Total Students', value: students.length, color: 'text-[#003b5c]', bg: 'bg-[#003b5c]/10' },
            { icon: 'bx-user-check', label: 'Present', value: presentCount, color: 'text-green-600', bg: 'bg-green-50' },
            { icon: 'bx-user-x', label: 'Absent', value: absentCount, color: 'text-red-500', bg: 'bg-red-50' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-card shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-input flex items-center justify-center ${s.bg}`}>
                <i className={`bx ${s.icon} text-xl ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-[#2d3748]">{s.value}</p>
                <p className="text-xs text-[#4a5568]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Student Table */}
        <div className="bg-white rounded-card shadow-sm overflow-hidden">
          {/* Legend */}
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-4 flex-wrap">
            <h3 className="text-sm font-semibold text-[#2d3748]">Past Week Attendance</h3>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-400 inline-block" /> Present
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> Absent
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" /> NA
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#4a5568] uppercase tracking-wide min-w-[180px]">Student Name</th>
                  {pastDates.map((d) => (
                    <th key={d} className="px-3 py-3 text-xs font-semibold text-[#4a5568] uppercase text-center min-w-[40px]">
                      {new Date(d + 'T00:00:00').getDate()}
                    </th>
                  ))}
                  <th className="px-5 py-3 text-xs font-semibold text-[#4a5568] uppercase tracking-wide text-center min-w-[120px]">Today</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-[#2d3748]">{student.name}</td>
                    {pastDates.map((d) => {
                      const status = getPastStatus(student, d)
                      return (
                        <td key={d} className="px-3 py-3 text-center">
                          <span className={`inline-block w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center ${statusColor(status)}`}>
                            {status === 'NA' ? '—' : status}
                          </span>
                        </td>
                      )
                    })}
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setChecked((prev) => ({ ...prev, [student.id]: !prev[student.id] }))}
                          className={`relative inline-flex items-center gap-2 px-4 py-1.5 rounded-badge text-xs font-semibold transition-all ${
                            checked[student.id]
                              ? 'bg-green-100 text-green-700 border border-green-300'
                              : 'bg-red-50 text-red-500 border border-red-200'
                          }`}
                        >
                          <i className={`bx ${checked[student.id] ? 'bx-check' : 'bx-x'}`} />
                          {checked[student.id] ? 'Present' : 'Absent'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={pastDates.length + 2} className="px-5 py-10 text-center text-[#4a5568] text-sm">
                      No students enrolled in this course.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={markAllPresent}
            className="flex items-center gap-2 px-5 py-2.5 border border-[#003b5c] text-[#003b5c] text-sm font-medium rounded-input hover:bg-[#003b5c]/5 transition-colors"
          >
            <i className="bx bx-check-double" />
            Mark All Present
          </button>
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
            Save Attendance
          </button>
        </div>
      </form>
    </div>
  )
}
