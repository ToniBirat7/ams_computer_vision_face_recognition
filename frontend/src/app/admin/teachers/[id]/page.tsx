import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, Phone, Calendar, BookOpen, Users, CalendarCheck } from 'lucide-react'
import { serverJson } from '@/lib/api-proxy'
import { Card, Avatar, EmptyState, Badge } from '@/components/ui'

interface CourseDetail {
  id: number; title: string; student_count: number
  attendance_count: number; attendance_percentage: number
}
interface TeacherDetailsData {
  teacher: { id: number; first_name: string; last_name: string; address: string; primary_number: string; dob: string | null; image_url: string | null }
  courses: CourseDetail[]
}

export default async function TeacherDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await serverJson<TeacherDetailsData>(`/api/teacher-details/${id}/`)
  if (!data) notFound()
  const { teacher, courses } = data

  return (
    <div className="space-y-6">
      <Link href="/admin/teachers" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Teachers
      </Link>

      <Card className="overflow-hidden">
        <div className="h-28" style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))' }} />
        <div className="px-6 pb-6 -mt-12">
          <Avatar name={`${teacher.first_name} ${teacher.last_name}`} src={teacher.image_url ? `/media${teacher.image_url}` : null} size="lg" className="ring-4 ring-[color:var(--surface)]" />
          <h1 className="text-2xl font-extrabold text-fg mt-3">{teacher.first_name} {teacher.last_name}</h1>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-2 text-sm text-muted">
            {teacher.address && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-accent" />{teacher.address}</span>}
            {teacher.primary_number && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-accent" />{teacher.primary_number}</span>}
            {teacher.dob && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-accent" />{new Date(teacher.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>}
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-bold text-fg mb-4">Courses Overview</h2>
        {courses.length === 0 ? (
          <Card><EmptyState icon={BookOpen} title="No courses assigned" message="This teacher has no courses yet." /></Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((c) => (
              <Card key={c.id} hover className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-fg">{c.title}</h3>
                  <Badge tone="neutral">#{c.id}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-brand-soft flex items-center justify-center"><Users className="w-4 h-4 text-brand" /></div>
                    <div><p className="text-lg font-bold text-fg leading-none">{c.student_count}</p><p className="text-xs text-muted mt-0.5">Students</p></div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-accent-soft flex items-center justify-center"><CalendarCheck className="w-4 h-4 text-accent" /></div>
                    <div><p className="text-lg font-bold text-fg leading-none">{c.attendance_count}</p><p className="text-xs text-muted mt-0.5">Records</p></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-muted">Attendance rate</span>
                    <span className="text-xs font-bold text-accent">{c.attendance_percentage}%</span>
                  </div>
                  <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${c.attendance_percentage}%`, background: 'var(--accent)' }} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
