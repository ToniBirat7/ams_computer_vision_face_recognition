'use client'

import { getCsrfToken } from '@/lib/utils'
import type {
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
