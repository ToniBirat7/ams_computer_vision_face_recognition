import Link from 'next/link'
import { redirect } from 'next/navigation'
import { fetchTeacherCourses, fetchTeacherProfile } from '@/lib/api-proxy'

export default async function TeacherDashboardPage() {
  const [coursesData, profile] = await Promise.all([
    fetchTeacherCourses(),
    fetchTeacherProfile(),
  ])
  if (!profile) redirect('/')

  const courses = coursesData?.courses ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2d3748]">
            Welcome Back, {profile.first_name} {profile.last_name}
          </h1>
          <p className="text-[#4a5568] text-sm mt-1">Manage your courses and track attendance</p>
        </div>
        <div className="bg-white rounded-card shadow-sm px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-input bg-[#003b5c]/10 flex items-center justify-center">
            <i className="bx bx-book-open text-xl text-[#003b5c]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#2d3748]">{courses.length}</p>
            <p className="text-xs text-[#4a5568]">Active Courses</p>
          </div>
        </div>
      </header>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-card shadow-sm flex flex-col items-center justify-center py-20 gap-3">
          <i className="bx bx-book text-5xl text-gray-200" />
          <h3 className="font-semibold text-[#2d3748]">No Courses Found</h3>
          <p className="text-[#4a5568] text-sm">You haven&apos;t been assigned to any courses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <article
              key={course.id}
              className="bg-white rounded-card shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              <div className="bg-gradient-to-br from-[#003b5c] to-[#00a4bd] p-5 flex items-center justify-between">
                <i className="bx bx-book-reader text-3xl text-white/80" />
                <span className="text-xs font-medium text-white bg-white/20 px-3 py-1 rounded-badge">
                  Active
                </span>
              </div>

              <div className="p-5">
                <h2 className="font-bold text-[#2d3748] text-lg mb-3">{course.title}</h2>
                <div className="flex gap-4 text-sm text-[#4a5568]">
                  <span className="flex items-center gap-1.5">
                    <i className="bx bx-time text-[#00a4bd]" />
                    {course.shift_display ?? course.shift}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="bx bx-calendar text-[#00a4bd]" />
                    {course.duration} weeks
                  </span>
                  {course.student_count !== undefined && (
                    <span className="flex items-center gap-1.5">
                      <i className="bx bx-group text-[#00a4bd]" />
                      {course.student_count}
                    </span>
                  )}
                </div>
              </div>

              <div className="px-5 pb-5 flex gap-3">
                <Link
                  href={`/teacher/attendance/${course.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#003b5c] text-white text-sm font-medium rounded-input hover:bg-[#002d47] transition-colors"
                >
                  <i className="bx bx-calendar-check" />
                  Take Attendance
                </Link>
                <Link
                  href={`/teacher/attendance/${course.id}/download`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#003b5c] text-[#003b5c] text-sm font-medium rounded-input hover:bg-[#003b5c]/5 transition-colors"
                >
                  <i className="bx bx-download" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
