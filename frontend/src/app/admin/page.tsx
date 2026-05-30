import Link from 'next/link'
import { redirect } from 'next/navigation'
import { fetchDashboard } from '@/lib/api-proxy'
import type { Teacher, Course } from '@/types/api'

export default async function AdminDashboardPage() {
  const data = await fetchDashboard()
  if (!data) redirect('/')

  const { teachers, students, courses, teacher_count, student_count, course_count } = data

  return (
    <div className="space-y-8">

      {/* Page header */}
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of BCU AMS activity</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard icon="bx bxs-user-detail"  accent="#003b5c" label="Total Teachers" value={teacher_count} />
        <StatCard icon="bx bxs-graduation"   accent="#00a4bd" label="Total Students" value={student_count} />
        <StatCard icon="bx bxs-book-open"    accent="#e31837" label="Active Courses" value={course_count}  />
      </div>

      {/* Teachers */}
      <SectionCard
        icon="bx bxs-user-detail"
        title="Teachers"
        count={teacher_count}
        addHref="/admin/teachers/add"
        addLabel="Add Teacher"
        viewHref="/admin/teachers"
      >
        {teachers.length === 0 ? (
          <EmptyState icon="bx bxs-user-detail" message="No teachers added yet" action={{ href: '/admin/teachers/add', label: 'Add first teacher' }} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {teachers.map((t) => <TeacherCard key={t.id} teacher={t} />)}
          </div>
        )}
      </SectionCard>

      {/* Students */}
      <SectionCard
        icon="bx bxs-graduation"
        title="Recent Students"
        count={student_count}
        addHref="/admin/students/add"
        addLabel="Add Student"
        viewHref="/admin/students"
        accentColor="#00a4bd"
      >
        {students.length === 0 ? (
          <EmptyState icon="bx bxs-graduation" message="No students added yet" action={{ href: '/admin/students/add', label: 'Add first student' }} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#003b5c' }}>
                  {['#', 'Name', 'Age', 'Address', 'Phone'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((s, i) => (
                  <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${i % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                    <td className="px-5 py-3.5 text-gray-400 text-xs font-mono">#{s.id}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-900">{s.name}</td>
                    <td className="px-5 py-3.5 text-gray-500">{s.age}</td>
                    <td className="px-5 py-3.5 text-gray-500">{s.address}</td>
                    <td className="px-5 py-3.5 text-gray-500">{s.phone_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Courses */}
      <SectionCard
        icon="bx bxs-book-open"
        title="Active Courses"
        count={course_count}
        addHref="/admin/courses/add"
        addLabel="Add Course"
        viewHref="/admin/courses"
        accentColor="#e31837"
      >
        {courses.length === 0 ? (
          <EmptyState icon="bx bxs-book-open" message="No courses added yet" action={{ href: '/admin/courses/add', label: 'Add first course' }} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {courses.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        )}
      </SectionCard>

    </div>
  )
}

// ── Components ──────────────────────────────────────────────────────────────────

function StatCard({ icon, accent, label, value }: {
  icon: string; accent: string; label: string; value: number
}) {
  return (
    <div className="bg-white rounded-card shadow-sm p-6 flex items-center gap-5 border-l-4" style={{ borderLeftColor: accent }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accent}18` }}>
        <i className={`${icon} text-2xl`} style={{ color: accent }} />
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  )
}

function SectionCard({ icon, title, count, addHref, addLabel, viewHref, accentColor = '#003b5c', children }: {
  icon: string; title: string; count: number; addHref: string; addLabel: string;
  viewHref: string; accentColor?: string; children: React.ReactNode
}) {
  return (
    <section className="bg-white rounded-card shadow-sm overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accentColor}15` }}>
            <i className={`${icon} text-base`} style={{ color: accentColor }} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">{title}</h2>
            <p className="text-xs text-gray-400">{count} total</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={viewHref} className="text-xs text-gray-400 hover:text-gray-700 transition-colors px-2 py-1">
            View all →
          </Link>
          <Link
            href={addHref}
            className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-lg transition-colors hover:opacity-90"
            style={{ background: accentColor }}
          >
            <i className="bx bx-plus text-sm" />
            {addLabel}
          </Link>
        </div>
      </div>
      {/* Section body */}
      <div className="p-5">{children}</div>
    </section>
  )
}

function TeacherCard({ teacher }: { teacher: Teacher }) {
  return (
    <Link
      href={`/admin/teachers/${teacher.id}`}
      className="bg-white border border-gray-100 rounded-card overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 block"
    >
      <div className="h-36 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #003b5c, #00a4bd)' }}>
        {teacher.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/media${teacher.image_url}`} alt={`${teacher.first_name} ${teacher.last_name}`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="bx bxs-user text-5xl text-white/30" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm">{teacher.first_name} {teacher.last_name}</h3>
        <div className="mt-2 space-y-1">
          {teacher.primary_number && (
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              <i className="bx bx-phone text-secondary" />{teacher.primary_number}
            </p>
          )}
          {teacher.address && (
            <p className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
              <i className="bx bx-map text-secondary" />{teacher.address}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

function CourseCard({ course }: { course: Course }) {
  const shift = course.shift_display ?? (course.shift === 'M' ? 'Morning' : course.shift === 'A' ? 'Afternoon' : 'Evening')
  const shiftColor = course.shift === 'M' ? '#f59e0b' : course.shift === 'A' ? '#3b82f6' : '#8b5cf6'
  return (
    <div className="border border-gray-100 rounded-card p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#003b5c15' }}>
          <i className="bx bx-book-open text-base text-primary" />
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg" style={{ background: `${shiftColor}20`, color: shiftColor }}>
          {shift}
        </span>
      </div>
      <h3 className="font-semibold text-gray-900 text-sm mb-1">{course.title}</h3>
      <p className="text-xs text-gray-400">{course.teacher_name ?? 'No teacher'}</p>
      {course.duration && <p className="text-xs text-gray-400 mt-0.5">{course.duration} weeks</p>}
    </div>
  )
}

function EmptyState({ icon, message, action }: {
  icon: string; message: string; action?: { href: string; label: string }
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <i className={`${icon} text-4xl text-gray-200`} />
      <p className="text-gray-400 text-sm">{message}</p>
      {action && (
        <Link href={action.href} className="text-xs text-secondary hover:underline">{action.label}</Link>
      )}
    </div>
  )
}
