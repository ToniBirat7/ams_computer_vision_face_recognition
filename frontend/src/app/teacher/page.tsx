import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BookOpen, Clock, Calendar, Users, CalendarCheck, Download, BookMarked } from 'lucide-react'
import { fetchTeacherCourses, fetchTeacherProfile } from '@/lib/api-proxy'
import type { Course } from '@/types/api'
import { Card, Badge, EmptyState, Eyebrow, Reveal, Stagger, StaggerItem } from '@/components/ui'

export default async function TeacherDashboardPage() {
  const [coursesData, profile] = await Promise.all([fetchTeacherCourses(), fetchTeacherProfile()])
  if (!profile) redirect('/')
  const courses = coursesData?.courses ?? []
  const totalStudents = courses.reduce((s, c) => s + (c.student_count ?? 0), 0)

  return (
    <div className="space-y-7">
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Eyebrow className="mb-2">Teacher Portal</Eyebrow>
            <h1 className="text-2xl font-extrabold text-fg tracking-tight">Welcome back, {profile.first_name} 👋</h1>
            <p className="text-muted text-sm mt-1">Manage your courses and track attendance.</p>
          </div>
          <div className="flex gap-3">
            <Card className="px-5 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-soft flex items-center justify-center"><BookOpen className="w-[18px] h-[18px] text-brand" /></div>
              <div><p className="text-xl font-bold text-gold leading-none">{courses.length}</p><p className="text-xs text-muted mt-0.5">Courses</p></div>
            </Card>
            <Card className="px-5 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center"><Users className="w-[18px] h-[18px] text-accent" /></div>
              <div><p className="text-xl font-bold text-gold leading-none">{totalStudents}</p><p className="text-xs text-muted mt-0.5">Students</p></div>
            </Card>
          </div>
        </div>
      </Reveal>

      {courses.length === 0 ? (
        <Card><EmptyState icon={BookMarked} title="No courses assigned" message="You haven't been assigned to any courses yet." /></Card>
      ) : (
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((c) => <StaggerItem key={c.id}><CourseCard course={c} /></StaggerItem>)}
        </Stagger>
      )}
    </div>
  )
}

function CourseCard({ course }: { course: Course }) {
  const shift = course.shift_display ?? (course.shift === 'M' ? 'Morning' : 'Day')
  return (
    <Card hover className="overflow-hidden">
      <div className="h-24 px-5 flex items-center justify-between relative" style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))' }}>
        <BookOpen className="w-8 h-8 text-white/70" />
        <Badge tone={course.shift === 'M' ? 'morning' : 'day'} className="!bg-white/20 !text-white">{shift}</Badge>
      </div>
      <div className="p-5">
        <h2 className="font-bold text-fg text-lg">{course.title}</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-sm text-muted">
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-accent" />{shift}</span>
          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-accent" />{course.duration} weeks</span>
          {course.student_count !== undefined && <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-accent" />{course.student_count}</span>}
        </div>
        <div className="flex gap-2.5 mt-4">
          <Link href={`/teacher/attendance/${course.id}`} className="flex-1 inline-flex items-center justify-center gap-2 h-11 text-white text-sm font-semibold rounded-input hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))' }}>
            <CalendarCheck className="w-4 h-4" /> Take Attendance
          </Link>
          <a href={`/teacher/attendance/${course.id}/download`} className="inline-flex items-center justify-center w-11 h-11 border border-border-strong text-fg-soft rounded-input hover:bg-surface-2 transition-colors" aria-label="Download report">
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>
    </Card>
  )
}
