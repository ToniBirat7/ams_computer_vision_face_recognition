import { cookies } from 'next/headers'
import type { AdminDashboardData, Teacher, Student, Course, AttendanceRecord, TeacherProfile } from '@/types/api'

const DJANGO = process.env.DJANGO_INTERNAL_URL ?? 'http://127.0.0.1:8000'

async function serverFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('sessionid')?.value ?? ''
  const csrfToken = cookieStore.get('csrftoken')?.value ?? ''

  return fetch(`${DJANGO}${path}`, {
    ...init,
    headers: {
      Cookie: `sessionid=${sessionId}; csrftoken=${csrfToken}`,
      'X-CSRFToken': csrfToken,
      'X-Requested-With': 'XMLHttpRequest',
      'X-Forwarded-Proto': 'https',
      ...init.headers,
    },
    cache: 'no-store',
    redirect: 'error',
  })
}

export async function serverJson<T>(path: string): Promise<T | null> {
  try {
    const r = await serverFetch(path)
    if (!r.ok) return null
    return r.json() as Promise<T>
  } catch {
    return null
  }
}

export async function fetchDashboard(): Promise<AdminDashboardData | null> {
  return serverJson<AdminDashboardData>('/api/dashboard/')
}

export async function fetchTeachersList(): Promise<{ teachers: Teacher[] } | null> {
  return serverJson<{ teachers: Teacher[] }>('/api/teachers/')
}

export async function fetchStudentsList(): Promise<{ students: Student[] } | null> {
  return serverJson<{ students: Student[] }>('/api/students/')
}

export async function fetchCoursesList(): Promise<{ courses: Course[] } | null> {
  return serverJson<{ courses: Course[] }>('/api/courses/')
}

export async function fetchTeacherProfile(): Promise<TeacherProfile | null> {
  return serverJson<TeacherProfile>('/api/teacher/profile/')
}

export async function fetchTeacherCourses(): Promise<{ courses: Course[] } | null> {
  return serverJson<{ courses: Course[] }>('/api/teacher/courses/')
}

export async function fetchAttendanceData(courseId: number) {
  return serverJson<{
    course: { id: number; title: string; shift: string; shift_display: string }
    students: Array<{ id: number; name: string; past_attendance: AttendanceRecord[] }>
  }>(`/api/attendance/${courseId}/`)
}

export async function fetchReviewAttendance(): Promise<{
  records: Array<{
    id: number; date: string; student_name: string; course_title: string; status: string
  }>
} | null> {
  return serverJson('/api/review-attendance/')
}
