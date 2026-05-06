import Link from 'next/link'
import { notFound } from 'next/navigation'
import { serverJson } from '@/lib/api-proxy'

interface CourseDetail {
  id: number
  title: string
  student_count: number
  attendance_count: number
  attendance_percentage: number
}

interface TeacherDetailsData {
  teacher: {
    id: number
    first_name: string
    last_name: string
    address: string
    primary_number: string
    dob: string | null
    image_url: string | null
  }
  courses: CourseDetail[]
}

export default async function TeacherDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await serverJson<TeacherDetailsData>(`/api/teacher-details/${id}/`)
  if (!data) notFound()

  const { teacher, courses } = data

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        href="/admin/teachers"
        className="inline-flex items-center gap-2 text-sm text-[#4a5568] hover:text-[#003b5c] transition-colors"
      >
        <i className="bx bx-arrow-back text-lg" />
        Back to Teachers List
      </Link>

      {/* Profile Section */}
      <div className="bg-white rounded-card shadow-sm p-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-[#003b5c] flex-shrink-0 flex items-center justify-center">
            {teacher.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/media${teacher.image_url}`}
                alt={`${teacher.first_name} ${teacher.last_name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <i className="bx bx-user-circle text-5xl text-white/60" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2d3748]">
              {teacher.first_name} {teacher.last_name}
            </h1>
            <div className="mt-3 space-y-2">
              {teacher.address && (
                <p className="flex items-center gap-2 text-sm text-[#4a5568]">
                  <i className="bx bx-map text-[#00a4bd] text-base" />
                  {teacher.address}
                </p>
              )}
              {teacher.primary_number && (
                <p className="flex items-center gap-2 text-sm text-[#4a5568]">
                  <i className="bx bx-phone text-[#00a4bd] text-base" />
                  {teacher.primary_number}
                </p>
              )}
              {teacher.dob && (
                <p className="flex items-center gap-2 text-sm text-[#4a5568]">
                  <i className="bx bx-calendar text-[#00a4bd] text-base" />
                  DOB: {new Date(teacher.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div>
        <h2 className="text-lg font-semibold text-[#2d3748] mb-4">Courses Overview</h2>
        {courses.length === 0 ? (
          <div className="bg-white rounded-card shadow-sm flex flex-col items-center justify-center py-16 gap-3">
            <i className="bx bx-book-open text-5xl text-gray-200" />
            <p className="text-[#4a5568] text-sm">No courses assigned yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-card shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-[#2d3748]">{course.title}</h3>
                  <span className="text-xs text-[#4a5568] bg-gray-100 px-2 py-1 rounded-badge">
                    #{course.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-input bg-[#003b5c]/10 flex items-center justify-center">
                      <i className="bx bxs-user-detail text-[#003b5c]" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[#2d3748]">{course.student_count}</p>
                      <p className="text-xs text-[#4a5568]">Students</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-input bg-[#00a4bd]/10 flex items-center justify-center">
                      <i className="bx bxs-calendar-check text-[#00a4bd]" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[#2d3748]">{course.attendance_count}</p>
                      <p className="text-xs text-[#4a5568]">Records</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-[#4a5568]">Attendance Overview</span>
                    <span className="text-xs font-bold text-[#00a4bd]">{course.attendance_percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00a4bd] rounded-full transition-all"
                      style={{ width: `${course.attendance_percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
