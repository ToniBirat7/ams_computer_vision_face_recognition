import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Users, GraduationCap, BookOpen, Plus, ArrowRight, MapPin, Phone } from 'lucide-react'
import { fetchDashboard } from '@/lib/api-proxy'
import type { Teacher, Course } from '@/types/api'
import {
  Card, StatCard, Avatar, Badge, EmptyState,
  Reveal, Stagger, StaggerItem,
} from '@/components/ui'

export default async function AdminDashboardPage() {
  const data = await fetchDashboard()
  if (!data) redirect('/')

  const { teachers, students, courses, teacher_count, student_count, course_count } = data

  return (
    <div className="space-y-7">
      <Reveal>
        <div>
          <h1 className="text-2xl font-extrabold text-fg tracking-tight">Welcome back, Admin 👋</h1>
          <p className="text-muted text-sm mt-1">Here&apos;s what&apos;s happening across BCU AMS today.</p>
        </div>
      </Reveal>

      {/* Stats */}
      <Stagger className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StaggerItem><StatCard icon={<Users className="w-6 h-6" />}         label="Total Teachers" value={teacher_count} accent="var(--brand)" /></StaggerItem>
        <StaggerItem><StatCard icon={<GraduationCap className="w-6 h-6" />} label="Total Students" value={student_count} accent="var(--accent)" /></StaggerItem>
        <StaggerItem><StatCard icon={<BookOpen className="w-6 h-6" />}      label="Active Courses" value={course_count}  accent="var(--danger)" /></StaggerItem>
      </Stagger>

      {/* Teachers */}
      <Section title="Teachers" count={teacher_count} icon={Users} accent="var(--brand)" addHref="/admin/teachers/add" addLabel="Add Teacher" viewHref="/admin/teachers">
        {teachers.length === 0 ? (
          <EmptyState icon={Users} title="No teachers yet" message="Register your first teacher to get started." />
        ) : (
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.slice(0, 6).map((t) => <StaggerItem key={t.id}><TeacherCard teacher={t} /></StaggerItem>)}
          </Stagger>
        )}
      </Section>

      {/* Students */}
      <Section title="Recent Students" count={student_count} icon={GraduationCap} accent="var(--accent)" addHref="/admin/students/add" addLabel="Add Student" viewHref="/admin/students">
        {students.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No students yet" message="Register your first student to get started." />
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--brand)' }}>
                  {['#', 'Name', 'Age', 'Address', 'Phone'].map((h, i) => (
                    <th key={h} className={`px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white/85 text-left ${i === 0 ? 'rounded-l-xl' : ''} ${i === 4 ? 'rounded-r-xl' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.slice(0, 6).map((s) => (
                  <tr key={s.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-5 py-3 text-muted text-xs font-mono">#{s.id}</td>
                    <td className="px-5 py-3 font-semibold text-fg">{s.name}</td>
                    <td className="px-5 py-3 text-fg-soft">{s.age}</td>
                    <td className="px-5 py-3 text-fg-soft">{s.address}</td>
                    <td className="px-5 py-3 text-fg-soft">{s.phone_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Courses */}
      <Section title="Active Courses" count={course_count} icon={BookOpen} accent="var(--danger)" addHref="/admin/courses/add" addLabel="Add Course" viewHref="/admin/courses">
        {courses.length === 0 ? (
          <EmptyState icon={BookOpen} title="No courses yet" message="Create your first course to get started." />
        ) : (
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {courses.slice(0, 8).map((c) => <StaggerItem key={c.id}><CourseCard course={c} /></StaggerItem>)}
          </Stagger>
        )}
      </Section>
    </div>
  )
}

function Section({ title, count, icon: Icon, accent, addHref, addLabel, viewHref, children }: {
  title: string; count: number; icon: typeof Users; accent: string
  addHref: string; addLabel: string; viewHref: string; children: React.ReactNode
}) {
  return (
    <Reveal>
      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `color-mix(in srgb, ${accent} 14%, transparent)` }}>
              <Icon className="w-[18px] h-[18px]" style={{ color: accent }} />
            </div>
            <div>
              <h2 className="font-bold text-fg text-sm">{title}</h2>
              <p className="text-xs text-muted">{count} total</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={viewHref} className="hidden sm:inline-flex items-center gap-1 text-xs text-muted hover:text-fg transition-colors px-2 py-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link href={addHref} className="inline-flex items-center gap-1.5 px-3 py-2 text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity" style={{ background: accent }}>
              <Plus className="w-4 h-4" /> {addLabel}
            </Link>
          </div>
        </div>
        <div className="p-5">{children}</div>
      </Card>
    </Reveal>
  )
}

function TeacherCard({ teacher }: { teacher: Teacher }) {
  return (
    <Link href={`/admin/teachers/${teacher.id}`} className="block border border-border rounded-card overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 bg-surface">
      <div className="h-24 relative" style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))' }} />
      <div className="px-4 pb-4 -mt-8">
        <Avatar name={`${teacher.first_name} ${teacher.last_name}`} src={teacher.image_url ? `/media${teacher.image_url}` : null} size="md" className="ring-4 ring-[color:var(--surface)]" />
        <h3 className="font-semibold text-fg text-sm mt-2.5">{teacher.first_name} {teacher.last_name}</h3>
        <div className="mt-1.5 space-y-1">
          {teacher.primary_number && <p className="flex items-center gap-1.5 text-xs text-muted"><Phone className="w-3.5 h-3.5 text-accent" />{teacher.primary_number}</p>}
          {teacher.address && <p className="flex items-center gap-1.5 text-xs text-muted truncate"><MapPin className="w-3.5 h-3.5 text-accent" />{teacher.address}</p>}
        </div>
      </div>
    </Link>
  )
}

function CourseCard({ course }: { course: Course }) {
  const shift = course.shift_display ?? (course.shift === 'M' ? 'Morning' : 'Day')
  const tone = course.shift === 'M' ? 'morning' : 'day'
  return (
    <div className="border border-border rounded-card p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 bg-surface">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-brand-soft">
          <BookOpen className="w-[18px] h-[18px] text-brand" />
        </div>
        <Badge tone={tone as 'morning' | 'day'}>{shift}</Badge>
      </div>
      <h3 className="font-semibold text-fg text-sm">{course.title}</h3>
      <p className="text-xs text-muted mt-1">{course.teacher_name ?? 'Unassigned'}</p>
      {course.duration ? <p className="text-xs text-muted mt-0.5">{course.duration} weeks</p> : null}
    </div>
  )
}
