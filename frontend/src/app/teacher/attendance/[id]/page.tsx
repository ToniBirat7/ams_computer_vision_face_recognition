'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  CalendarCheck, Camera, X, ScanFace, Users, UserCheck, UserX,
  CheckCheck, Save, Check, CircleCheck,
} from 'lucide-react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { getAttendanceData, takeAttendance } from '@/lib/api'
import { Card, Button, Badge, Avatar, Spinner, Reveal } from '@/components/ui'
import { cn } from '@/lib/utils'

interface PastRecord { date: string; status: string }
interface Student { id: number; name: string; past_attendance: PastRecord[] }
interface CourseInfo { id: number; title: string; shift: string; shift_display?: string }

const CAPTURE_INTERVAL_MS = 350
const JPEG_QUALITY = 0.6

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
  const [detected, setDetected] = useState<{ id: number; name: string; similarity: number }[]>([])

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const today = new Date()

  const onStudentDetected = useCallback((s: { id: number; name: string; similarity: number }) => {
    setDetected((prev) => prev.some((x) => x.id === s.id) ? prev : [...prev, s])
    setChecked((prev) => ({ ...prev, [s.id]: true }))
  }, [])
  const onStatusChange = useCallback((msg: string, type: 'info' | 'error') => {
    if (type === 'error') toast.error(msg)
  }, [])

  const { isConnected, connect, startStream, sendFrame, stopStream } = useWebSocket({
    courseId: courseIdNum, onStudentDetected, onStatusChange,
  })

  useEffect(() => {
    getAttendanceData(courseId)
      .then((d) => {
        setCourse(d.course)
        setStudents(d.students)
        const dates: string[] = []
        for (let i = 1; i <= 7; i++) { const dt = new Date(); dt.setDate(dt.getDate() - i); dates.push(dt.toISOString().split('T')[0]) }
        setPastDates(dates)
        const init: Record<number, boolean> = {}
        d.students.forEach((s) => { init[s.id] = false })
        setChecked(init)
      })
      .catch(() => toast.error('Failed to load attendance data'))
      .finally(() => setLoading(false))
  }, [courseId])

  // Attach the captured webcam stream once the video element is mounted.
  useEffect(() => {
    if (showVideo && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [showVideo])

  // Once the socket is open, start the stream and pump frames from the canvas.
  useEffect(() => {
    if (!isConnected || !showVideo) return
    startStream()
    const tick = () => {
      const v = videoRef.current, c = canvasRef.current
      if (!v || !c || v.readyState < 2 || !v.videoWidth) return
      c.width = v.videoWidth
      c.height = v.videoHeight
      const ctx = c.getContext('2d')
      if (!ctx) return
      ctx.drawImage(v, 0, 0, c.width, c.height)
      sendFrame(c.toDataURL('image/jpeg', JPEG_QUALITY))
    }
    const id = setInterval(tick, CAPTURE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [isConnected, showVideo, startStream, sendFrame])

  // Release the webcam on unmount.
  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }, [])

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('Camera not supported in this browser')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }, audio: false,
      })
      streamRef.current = stream
      connect()
      setShowVideo(true)
    } catch (err) {
      const name = (err as DOMException)?.name
      if (name === 'NotAllowedError' || name === 'SecurityError') toast.error('Camera permission denied')
      else if (name === 'NotFoundError') toast.error('No camera found')
      else toast.error('Could not access camera')
    }
  }

  const stopCamera = useCallback(() => {
    stopStream()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setShowVideo(false)
    setDetected([])
  }, [stopStream])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const statuses: Record<number, 'P' | 'A'> = {}
      students.forEach((s) => { statuses[s.id] = checked[s.id] ? 'P' : 'A' })
      const r = await takeAttendance(courseId, statuses)
      if (r.ok || r.status === 302) { toast.success('Attendance saved'); stopCamera(); router.push('/teacher') }
      else toast.error('Failed to save attendance')
    } catch { toast.error('Network error') } finally { setSaving(false) }
  }

  const markAll = () => setChecked(() => { const n: Record<number, boolean> = {}; students.forEach((s) => { n[s.id] = true }); return n })

  const presentCount = Object.values(checked).filter(Boolean).length
  const absentCount = students.length - presentCount
  const pastStatus = (s: Student, d: string) => s.past_attendance.find((r) => r.date === d)?.status ?? 'NA'

  if (loading) return <Spinner />

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-fg tracking-tight flex items-center gap-2"><CalendarCheck className="w-6 h-6 text-accent" />Take Attendance</h1>
            {course && <p className="text-muted text-sm mt-1"><span className="font-semibold text-fg">{course.title}</span> · {today.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
          </div>
          {!showVideo ? (
            <Button onClick={startCamera} icon={<Camera className="w-4 h-4" />}>Start Video Attendance</Button>
          ) : (
            <Button variant="danger" onClick={stopCamera} icon={<X className="w-4 h-4" />}>Close Camera</Button>
          )}
        </div>
      </Reveal>

      {/* Video feed */}
      {showVideo && (
        <Reveal>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-fg flex items-center gap-2"><ScanFace className="w-5 h-5 text-accent" />Face Recognition</h3>
              <Badge tone={isConnected ? 'present' : 'na'}>{isConnected ? 'Connected' : 'Connecting…'}</Badge>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full rounded-input border border-border bg-surface-3 aspect-video object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-fg mb-3">Detected ({detected.length})</h4>
                {detected.length === 0 ? (
                  <p className="text-sm text-muted">No students detected yet.</p>
                ) : (
                  <div className="space-y-2">
                    {detected.map((d) => (
                      <div key={d.id} className="flex items-center gap-2.5 p-2.5 bg-success-soft rounded-xl">
                        <CircleCheck className="w-5 h-5 text-success shrink-0" />
                        <div><p className="text-sm font-medium text-fg">{d.name}</p><p className="text-xs text-muted">{(d.similarity * 100).toFixed(1)}% match</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Reveal>
      )}

      <form onSubmit={submit} className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { Icon: Users, color: 'var(--brand)', label: 'Total', value: students.length },
            { Icon: UserCheck, color: 'var(--success)', label: 'Present', value: presentCount },
            { Icon: UserX, color: 'var(--danger)', label: 'Absent', value: absentCount },
          ].map(({ Icon, color, label, value }) => (
            <Card key={label} className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)` }}><Icon className="w-5 h-5" style={{ color }} /></div>
              <div><p className="text-xl font-bold text-fg leading-none">{value}</p><p className="text-xs text-muted mt-0.5">{label}</p></div>
            </Card>
          ))}
        </div>

        {/* Roster */}
        <Card className="overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center gap-4 flex-wrap">
            <h3 className="text-sm font-bold text-fg">Past Week Attendance</h3>
            <div className="flex gap-3 text-xs text-muted">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success" />Present</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-danger" />Absent</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-surface-3" />N/A</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--brand)' }}>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/85 min-w-[180px]">Student</th>
                  {pastDates.map((d) => <th key={d} className="px-2 py-3 text-center text-[11px] font-bold uppercase text-white/85 min-w-[40px]">{new Date(d + 'T00:00:00').getDate()}</th>)}
                  <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-white/85 min-w-[120px]">Today</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5"><Avatar name={s.name} size="sm" className="!w-8 !h-8 !text-[10px]" /><span className="font-medium text-fg">{s.name}</span></div>
                    </td>
                    {pastDates.map((d) => {
                      const st = pastStatus(s, d)
                      return (
                        <td key={d} className="px-2 py-3 text-center">
                          <span className={cn('inline-flex w-7 h-7 rounded-full text-xs font-semibold items-center justify-center',
                            st === 'P' ? 'bg-success-soft text-success' : st === 'A' ? 'bg-danger-soft text-danger' : 'bg-surface-3 text-muted')}>
                            {st === 'NA' ? '–' : st}
                          </span>
                        </td>
                      )
                    })}
                    <td className="px-5 py-3 text-center">
                      <button type="button" onClick={() => setChecked((p) => ({ ...p, [s.id]: !p[s.id] }))}
                        className={cn('inline-flex items-center gap-1.5 px-4 py-1.5 rounded-badge text-xs font-semibold border transition-all',
                          checked[s.id] ? 'bg-success-soft text-success border-success/40' : 'bg-danger-soft text-danger border-danger/30')}>
                        {checked[s.id] ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        {checked[s.id] ? 'Present' : 'Absent'}
                      </button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan={pastDates.length + 2} className="px-5 py-10 text-center text-muted text-sm">No students enrolled in this course.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={markAll} icon={<CheckCheck className="w-4 h-4" />}>Mark All Present</Button>
          <Button type="submit" loading={saving} icon={<Save className="w-4 h-4" />}>Save Attendance</Button>
        </div>
      </form>
    </div>
  )
}
