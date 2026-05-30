'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Search, Calendar, Pencil, CalendarX, BookOpen } from 'lucide-react'
import { getReviewAttendance, type AttendanceRecordFull } from '@/lib/api'
import {
  Card, Button, Badge, EmptyState, SkeletonRows, PageHeader, Avatar,
  Reveal, Stagger, StaggerItem,
} from '@/components/ui'

export default function ReviewAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecordFull[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    getReviewAttendance().then(setRecords).catch(() => toast.error('Failed to load records')).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => records.filter((r) => {
    const ms = !search || r.course_title.toLowerCase().includes(search.toLowerCase()) || r.student_name.toLowerCase().includes(search.toLowerCase())
    const md = !dateFilter || r.date === dateFilter
    return ms && md
  }), [records, search, dateFilter])

  return (
    <div className="space-y-6">
      <Reveal>
        <PageHeader title="Attendance Review" subtitle={`${records.length} records`}
          actions={
            <>
              <div className="relative">
                <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…"
                  className="h-11 w-40 sm:w-52 pl-9 pr-3 text-sm text-fg bg-surface-2 border border-border rounded-input outline-none placeholder:text-muted focus:bg-surface focus:border-accent focus:shadow-[0_0_0_3px_var(--ring)] transition-all" />
              </div>
              <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
                className="h-11 px-3 text-sm text-fg bg-surface-2 border border-border rounded-input outline-none focus:bg-surface focus:border-accent focus:shadow-[0_0_0_3px_var(--ring)] transition-all" />
            </>
          } />
      </Reveal>

      {loading ? <SkeletonRows rows={6} /> : filtered.length === 0 ? (
        <Card><EmptyState icon={CalendarX} title="No records found" message="Adjust your search or date filter." /></Card>
      ) : (
        <Stagger className="space-y-3">
          {filtered.map((r) => (
            <StaggerItem key={r.id}>
              <Card hover className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-soft flex items-center justify-center shrink-0"><BookOpen className="w-5 h-5 text-brand" /></div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-fg">{r.course_title}</h3>
                  <p className="text-sm text-muted flex items-center gap-1.5"><Avatar name={r.student_name} size="sm" className="!w-5 !h-5 !text-[9px]" />{r.student_name}</p>
                </div>
                <span className="flex items-center gap-1.5 text-sm text-muted"><Calendar className="w-4 h-4 text-accent" />{new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <Badge tone={r.status === 'P' ? 'present' : 'absent'}>{r.status === 'P' ? 'Present' : 'Absent'}</Badge>
                <Link href={`/admin/attendance/${r.id}`}><Button size="sm" variant="secondary" icon={<Pencil className="w-3.5 h-3.5" />}>Alter</Button></Link>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  )
}
