'use client'

import { getCsrfToken, fileToDataUrl } from '@/lib/utils'
import type {
  Student, Teacher, Course,
  StudentDetail, UpdateStudentPayload, ApiStatus, ApiSuccess,
  TeacherDetail, UpdateTeacherPayload,
  StudentReport, PredictionResult,
  AlterAttendancePayload,
  AdminDashboardData,
} from '@/types/api'

const BASE = '/api/django'

async function djangoFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const csrf = getCsrfToken()
  return fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: {
      'X-CSRFToken': csrf,
      'X-Requested-With': 'XMLHttpRequest',
      ...init.headers,
    },
    ...init,
  })
}

// ── Auth ──────────────────────────────────────────────────────────────────────

/** Login via JSON API - returns role ('admin' | 'teacher') or null on failure */
export async function login(
  username: string,
  password: string,
): Promise<'admin' | 'teacher' | null> {
  try {
    const csrf = getCsrfToken()
    const r = await fetch(`${BASE}/api/login/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf,
      },
      body: JSON.stringify({ username, password }),
    })
    if (!r.ok) return null
    const data = await r.json()
    return (data.role === 'admin' ? 'admin' : 'teacher')
  } catch {
    return null
  }
}

export async function logout(): Promise<void> {
  await djangoFetch('/api/logout/')
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboard(): Promise<AdminDashboardData> {
  const r = await djangoFetch('/api/dashboard/')
  if (!r.ok) throw new Error('Failed to load dashboard')
  return r.json()
}

// ── Students ──────────────────────────────────────────────────────────────────

export async function getStudent(id: number): Promise<StudentDetail> {
  const r = await djangoFetch(`/get-student/${id}/`)
  if (!r.ok) throw new Error('Student not found')
  return r.json()
}

export async function updateStudent(data: UpdateStudentPayload): Promise<ApiStatus> {
  const body = new URLSearchParams({
    student_id: String(data.student_id),
    name: data.name,
    address: data.address,
    phone_number: data.phone_number,
    age: String(data.age),
  })
  const r = await djangoFetch('/update_student/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  return r.json()
}

export async function deleteStudent(id: number): Promise<ApiSuccess> {
  const r = await djangoFetch(`/delete-student/${id}/`, { method: 'POST' })
  return r.json()
}

// ── Teachers ──────────────────────────────────────────────────────────────────

export async function getTeacher(id: number): Promise<TeacherDetail> {
  const r = await djangoFetch(`/get-teacher/${id}/`)
  if (!r.ok) throw new Error('Teacher not found')
  return r.json()
}

export async function updateTeacher(data: UpdateTeacherPayload): Promise<ApiStatus> {
  const body = new URLSearchParams({
    teacher_id: String(data.teacher_id),
    address: data.address,
    primary_number: data.primary_number,
    dob: data.dob,
  })
  if (data.secondary_number) body.append('secondary_number', data.secondary_number)
  const r = await djangoFetch('/update_teacher/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  return r.json()
}

export async function deleteTeacher(id: number): Promise<ApiSuccess> {
  const r = await djangoFetch(`/delete-teacher/${id}/`, { method: 'POST' })
  return r.json()
}

// ── Reports ───────────────────────────────────────────────────────────────────

export async function getStudentReport(studentId: number): Promise<StudentReport> {
  const r = await djangoFetch(`/get-student-report/${studentId}/`)
  if (!r.ok) throw new Error('Student not found')
  return r.json()
}

export async function predictPerformance(
  studentId: number,
  previousGrade: string,
): Promise<PredictionResult> {
  const r = await djangoFetch(`/predict-performance/${studentId}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ previous_grade: previousGrade }),
  })
  if (!r.ok) throw new Error('Prediction failed')
  return r.json()
}

// ── Attendance ────────────────────────────────────────────────────────────────

export async function alterAttendance(
  id: number,
  payload: AlterAttendancePayload,
): Promise<{ message: string }> {
  const r = await djangoFetch(`/alter-attendance/${id}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!r.ok) throw new Error('Failed to update attendance')
  return r.json()
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** GET the Django root once so the csrftoken cookie is set before a mutation. */
async function seedCsrf(): Promise<string> {
  try { await fetch(`${BASE}/`, { credentials: 'include' }) } catch { /* ignore */ }
  return getCsrfToken()
}

async function postForm(path: string, body: URLSearchParams): Promise<Response> {
  const csrf = await seedCsrf()
  body.append('csrfmiddlewaretoken', csrf)
  return djangoFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-CSRFToken': csrf },
    body: body.toString(),
  })
}

// ── List fetchers (client) ───────────────────────────────────────────────────

export interface UserOption { id: number; username: string; first_name: string; last_name: string }
export interface ClassEnrollment {
  id: number; student_id: number; student_name: string; course_id: number; course_title: string
}
export interface AttendanceRecordFull {
  id: number; student_name: string; student_id: number; course_title: string; date: string; status: 'P' | 'A'
}

export async function getStudents(): Promise<Student[]> {
  const r = await djangoFetch('/api/students/'); return (await r.json()).students ?? []
}
export async function getTeachers(): Promise<Teacher[]> {
  const r = await djangoFetch('/api/teachers/'); return (await r.json()).teachers ?? []
}
export async function getCourses(): Promise<Course[]> {
  const r = await djangoFetch('/api/courses/'); return (await r.json()).courses ?? []
}
export async function getClasses(): Promise<ClassEnrollment[]> {
  const r = await djangoFetch('/api/classes/'); return (await r.json()).classes ?? []
}
export async function getUsers(): Promise<UserOption[]> {
  const r = await djangoFetch('/api/users/'); return (await r.json()).users ?? []
}
export async function getReviewAttendance(): Promise<AttendanceRecordFull[]> {
  const r = await djangoFetch('/api/review-attendance/'); return (await r.json()).records ?? []
}
export async function getAttendanceRecord(id: number): Promise<AttendanceRecordFull> {
  const r = await djangoFetch(`/api/attendance-record/${id}/`)
  if (!r.ok) throw new Error('Record not found')
  return r.json()
}

export interface AttendanceData {
  course: { id: number; title: string; shift: string; shift_display?: string }
  students: { id: number; name: string; past_attendance: { date: string; status: string }[] }[]
}
export async function getAttendanceData(courseId: number | string): Promise<AttendanceData> {
  const r = await djangoFetch(`/api/attendance/${courseId}/`, { cache: 'no-store' } as RequestInit)
  if (!r.ok) throw new Error('Failed to load attendance data')
  return r.json()
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function addStudent(form: {
  name: string; address: string; age: string; phone_number: string
}): Promise<ApiSuccess> {
  const r = await postForm('/student/', new URLSearchParams(form))
  return r.json()
}

export async function addCourse(form: {
  teacher: string; title: string; duration: string; shift: string
}): Promise<ApiSuccess> {
  const r = await postForm('/add-course/', new URLSearchParams(form))
  return r.json()
}

export async function addTeacher(fields: {
  teacher: string; address: string; primary_number: string;
  secondary_number: string; dob: string; sex: string
}, image: File | null): Promise<Response> {
  // Sent as JSON (image as a base64 data URL) rather than multipart/form-data — the
  // multipart body did not survive the nginx /api/django proxy, so Django saw an empty
  // POST and rejected every registration. JSON travels reliably (same path as login).
  const csrf = await seedCsrf()
  const image_data = image ? await fileToDataUrl(image) : null
  return djangoFetch('/teacher/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
    body: JSON.stringify({ ...fields, image_data }),
  })
}

export async function addClass(studentIds: number[], courseId: number): Promise<Response> {
  const body = new URLSearchParams()
  studentIds.forEach((id) => body.append('student', String(id)))
  body.append('course', String(courseId))
  return postForm('/add-student-class/', body)
}

export async function registerUser(form: {
  first_name: string; last_name: string; username: string;
  email: string; password1: string; password2: string
}): Promise<Response> {
  return postForm('/register/', new URLSearchParams(form))
}

export async function editProfile(form: {
  email: string; address: string; primary_number: string; secondary_number: string
}): Promise<Response> {
  return postForm('/teacher/edit-profile/', new URLSearchParams(form))
}

export async function takeAttendance(
  courseId: number | string,
  statuses: Record<number, 'P' | 'A'>,
): Promise<Response> {
  const body = new URLSearchParams()
  Object.entries(statuses).forEach(([studentId, st]) => body.append(studentId, st))
  return postForm(`/teacher/attendance/${courseId}/`, body)
}

export async function deleteCourse(id: number): Promise<Response> {
  return djangoFetch(`/delete-course/${id}/`, { method: 'POST' })
}

export async function deleteClass(id: number): Promise<Response> {
  return djangoFetch(`/delete-class/${id}/`, { method: 'POST' })
}

export async function getTeacherProfileClient(): Promise<{
  email: string; address: string; primary_number: string; secondary_number: string
}> {
  const r = await djangoFetch('/api/teacher/profile/', { cache: 'no-store' } as RequestInit)
  return r.json()
}
