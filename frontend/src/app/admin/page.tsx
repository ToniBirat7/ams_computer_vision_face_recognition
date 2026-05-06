import Link from 'next/link'
import { redirect } from 'next/navigation'
import { fetchDashboard } from '@/lib/api-proxy'
import type { Teacher, Student, Course } from '@/types/api'

export default async function AdminDashboardPage() {
  const data = await fetchDashboard()
  if (!data) redirect('/')

  const { teachers, students, courses, teacher_count, student_count, course_count } = data

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2d3748]">Welcome Back, Admin</h1>
          <p className="text-[#4a5568] text-sm mt-1">Here&apos;s what&apos;s happening today</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          icon="bx bxs-user-detail"
          color="#003b5c"
          label="Total Teachers"
          value={teacher_count}
        />
        <StatCard
          icon="bx bxs-graduation"
          color="#00a4bd"
          label="Total Students"
          value={student_count}
        />
        <StatCard
          icon="bx bxs-book-open"
          color="#e31837"
          label="Active Courses"
          value={course_count}
        />
      </div>

      {/* Teachers Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#2d3748] flex items-center gap-2">
            <i className="bx bxs-user-detail text-[#00a4bd]" />
            Teachers
          </h2>
          <Link
            href="/admin/teachers/add"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#00a4bd] text-white text-sm font-medium rounded-input hover:bg-[#0092a8] transition-colors"
          >
            <i className="bx bx-plus text-base" />
            Add Teacher
          </Link>
        </div>

        {teachers.length === 0 ? (
          <EmptyState icon="bx bxs-user-detail" message="No teachers added yet" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((t) => (
              <TeacherCard key={t.id} teacher={t} />
            ))}
          </div>
        )}
      </section>

      {/* Students Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#2d3748] flex items-center gap-2">
            <i className="bx bxs-graduation text-[#00a4bd]" />
            Recent Students
          </h2>
          <Link
            href="/admin/students/add"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#003b5c] text-white text-sm font-medium rounded-input hover:bg-[#002d47] transition-colors"
          >
            <i className="bx bx-plus text-base" />
            Add Student
          </Link>
        </div>

        {students.length === 0 ? (
          <EmptyState icon="bx bxs-graduation" message="No students added yet" />
        ) : (
          <div className="bg-white rounded-card shadow-sm overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['ID', 'Name', 'Age', 'Address', 'Phone'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-4 text-sm font-medium text-white bg-[#003b5c]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`border-b border-black/5 last:border-0 hover:bg-black/[0.02] transition-colors ${
                      i % 2 === 1 ? 'bg-gray-50/50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-[#4a5568]">#{s.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-[#2d3748]">{s.name}</td>
                    <td className="px-6 py-4 text-sm text-[#4a5568]">{s.age}</td>
                    <td className="px-6 py-4 text-sm text-[#4a5568]">{s.address}</td>
                    <td className="px-6 py-4 text-sm text-[#4a5568]">{s.phone_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Courses Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#2d3748] flex items-center gap-2">
            <i className="bx bxs-book-open text-[#00a4bd]" />
            Active Courses
          </h2>
          <Link
            href="/admin/courses/add"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#e31837] text-white text-sm font-medium rounded-input hover:bg-[#cc1530] transition-colors"
          >
            <i className="bx bx-plus text-base" />
            Add Course
          </Link>
        </div>

        {courses.length === 0 ? (
          <EmptyState icon="bx bxs-book-open" message="No courses added yet" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ icon, color, label, value }: {
  icon: string; color: string; label: string; value: number
}) {
  return (
    <div className="bg-white rounded-card shadow-sm p-6 flex items-center gap-5">
      <div
        className="w-14 h-14 rounded-card flex items-center justify-center flex-shrink-0"
        style={{ background: color }}
      >
        <i className={`${icon} text-2xl text-white`} />
      </div>
      <div>
        <p className="text-3xl font-bold text-[#2d3748]">{value}</p>
        <p className="text-sm text-[#4a5568] mt-0.5">{label}</p>
      </div>
    </div>
  )
}

function TeacherCard({ teacher }: { teacher: Teacher }) {
  return (
    <div className="bg-white rounded-card shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-300">
      <div className="h-48 bg-[#003b5c] relative overflow-hidden">
        {teacher.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/media${teacher.image_url}`}
            alt={`${teacher.first_name} ${teacher.last_name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="bx bxs-user text-6xl text-white/40" />
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-base font-semibold text-[#2d3748] mb-3">
          {teacher.first_name} {teacher.last_name}
        </h3>
        <div className="space-y-2">
          {teacher.address && (
            <div className="flex items-center gap-2 text-[#4a5568] text-sm">
              <i className="bx bx-map text-[#00a4bd] text-lg" />
              <span>{teacher.address}</span>
            </div>
          )}
          {teacher.primary_number && (
            <div className="flex items-center gap-2 text-[#4a5568] text-sm">
              <i className="bx bx-phone text-[#00a4bd] text-lg" />
              <span>{teacher.primary_number}</span>
            </div>
          )}
          {teacher.dob && (
            <div className="flex items-center gap-2 text-[#4a5568] text-sm">
              <i className="bx bx-calendar text-[#00a4bd] text-lg" />
              <span>{new Date(teacher.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CourseCard({ course }: { course: Course }) {
  const shiftLabel = course.shift_display ?? (course.shift === 'M' ? 'Morning' : 'Day')
  return (
    <div className="bg-white rounded-card shadow-sm p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
      <h3 className="text-base font-semibold text-[#2d3748] mb-3">{course.title}</h3>
      <div className="space-y-1.5 text-sm text-[#4a5568]">
        {course.teacher_name && <p>Teacher: {course.teacher_name}</p>}
        {course.duration && <p>Duration: {course.duration} weeks</p>}
        <p>Shift: {shiftLabel}</p>
      </div>
    </div>
  )
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="bg-white rounded-card shadow-sm flex flex-col items-center justify-center py-16 gap-3">
      <i className={`${icon} text-5xl text-gray-200`} />
      <p className="text-[#4a5568] text-sm">{message}</p>
    </div>
  )
}
