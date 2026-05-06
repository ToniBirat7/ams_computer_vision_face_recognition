import Link from 'next/link'
import { redirect } from 'next/navigation'
import { fetchTeacherProfile, fetchTeacherCourses } from '@/lib/api-proxy'

export default async function TeacherProfilePage() {
  const [profile, coursesData] = await Promise.all([
    fetchTeacherProfile(),
    fetchTeacherCourses(),
  ])
  if (!profile) redirect('/')

  const courses = coursesData?.courses ?? []
  const genderLabel = profile.sex === 'M' ? 'Male' : 'Female'
  const totalStudents = courses.reduce((sum, c) => sum + (c.student_count ?? 0), 0)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#2d3748]">Teacher Profile</h1>
        <p className="text-[#4a5568] text-sm mt-1">Manage your personal information and view your courses</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-card shadow-sm p-6 flex flex-col items-center gap-5">
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-[#003b5c] flex items-center justify-center">
              {profile.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/media${profile.image_url}`}
                  alt={`${profile.first_name} ${profile.last_name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <i className="bx bxs-user text-5xl text-white/60" />
              )}
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold text-[#2d3748]">{profile.first_name} {profile.last_name}</h2>
            <p className="text-[#4a5568] text-sm">Teacher</p>
            {profile.address && (
              <p className="flex items-center justify-center gap-1 text-sm text-[#4a5568] mt-2">
                <i className="bx bx-map text-[#00a4bd]" />
                {profile.address}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 w-full border-t border-gray-100 pt-4">
            {[
              { value: courses.length, label: 'Courses' },
              { value: totalStudents, label: 'Students' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-bold text-[#2d3748]">{s.value}</p>
                <p className="text-xs text-[#4a5568]">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 w-full">
            <Link
              href="/teacher/profile/edit"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#003b5c] text-white text-sm font-medium rounded-input hover:bg-[#002d47] transition-colors"
            >
              <i className="bx bx-edit-alt" />
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Contact */}
          <div className="bg-white rounded-card shadow-sm p-6">
            <h3 className="font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
              <i className="bx bx-phone text-[#00a4bd]" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Email', value: profile.email },
                { label: 'Primary Phone', value: profile.primary_number },
                { label: 'Secondary Phone', value: profile.secondary_number },
                { label: 'Address', value: profile.address },
              ].map((item) => (
                <div key={item.label}>
                  <label className="text-xs font-medium text-[#4a5568] uppercase tracking-wide">{item.label}</label>
                  <p className="text-sm text-[#2d3748] mt-0.5">{item.value || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Personal */}
          <div className="bg-white rounded-card shadow-sm p-6">
            <h3 className="font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
              <i className="bx bx-user text-[#00a4bd]" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[#4a5568] uppercase tracking-wide">Date of Birth</label>
                <p className="text-sm text-[#2d3748] mt-0.5">
                  {profile.dob ? new Date(profile.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-[#4a5568] uppercase tracking-wide">Gender</label>
                <p className="text-sm text-[#2d3748] mt-0.5">{genderLabel}</p>
              </div>
            </div>
          </div>

          {/* Courses */}
          <div className="bg-white rounded-card shadow-sm p-6">
            <h3 className="font-semibold text-[#2d3748] mb-4 flex items-center gap-2">
              <i className="bx bx-book text-[#00a4bd]" />
              Current Courses
            </h3>
            {courses.length === 0 ? (
              <p className="text-sm text-[#4a5568]">No courses assigned yet.</p>
            ) : (
              <div className="space-y-3">
                {courses.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-input">
                    <div>
                      <h4 className="font-medium text-[#2d3748] text-sm">{c.title}</h4>
                      <p className="text-xs text-[#4a5568]">{c.shift_display ?? c.shift} shift · {c.duration} weeks</p>
                    </div>
                    <Link
                      href={`/teacher/attendance/${c.id}`}
                      className="text-xs text-[#00a4bd] hover:underline"
                    >
                      Take Attendance
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
