'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowLeft, BookOpen, Calendar, UserCheck, UserX, Save } from 'lucide-react'
import { alterAttendance, getAttendanceRecord, type AttendanceRecordFull } from '@/lib/api'
import { Card, Button, Avatar, Spinner, Reveal } from '@/components/ui'
import { cn } from '@/lib/utils'

export default function AlterAttendancePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [record, setRecord] = useState<AttendanceRecordFull | null>(null)
  const [status, setStatus] = useState<'P' | 'A'>('P')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getAttendanceRecord(Number(id))
      .then((d) => { setRecord(d); setStatus(d.status) })
      .catch(() => toast.error('Failed to load record'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    if (!record) return
    setSaving(true)
    try {
      await alterAttendance(record.id, { stats: status })
      toast.success('Attendance updated')
      router.push('/admin/attendance/review')
    } catch { toast.error('Failed to update') } finally { setSaving(false) }
  }

  if (loading) return <Spinner />
  if (!record) return (
    <div className="text-center py-20">
      <p className="text-muted">Record not found.</p>
      <Link href="/admin/attendance/review" className="text-accent text-sm mt-2 inline-block hover:underline">Back to Review</Link>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/admin/attendance/review" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Review
      </Link>

      <Reveal>
        <Card className="p-6">
          <h1 className="text-2xl font-extrabold text-fg mb-2">Alter Attendance</h1>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted">
            <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-accent" />{record.course_title}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-accent" />{new Date(record.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </Card>
      </Reveal>

      <Reveal delay={0.05}>
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <Avatar name={record.student_name} size="md" />
              <div>
                <h3 className="font-semibold text-fg text-lg">{record.student_name}</h3>
                <span className="text-sm text-muted">Student ID: #{record.student_id}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStatus('P')}
                className={cn('flex items-center gap-2 px-5 h-12 rounded-input font-semibold text-sm border-2 transition-all',
                  status === 'P' ? 'bg-success border-success text-white shadow-md' : 'border-border text-fg-soft hover:border-success')}>
                <UserCheck className="w-5 h-5" /> Present
              </button>
              <button onClick={() => setStatus('A')}
                className={cn('flex items-center gap-2 px-5 h-12 rounded-input font-semibold text-sm border-2 transition-all',
                  status === 'A' ? 'bg-danger border-danger text-white shadow-md' : 'border-border text-fg-soft hover:border-danger')}>
                <UserX className="w-5 h-5" /> Absent
              </button>
            </div>
          </div>
        </Card>
      </Reveal>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} icon={<Save className="w-4 h-4" />} size="lg">Save Changes</Button>
      </div>
    </div>
  )
}
