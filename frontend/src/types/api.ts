// ── Shared ──────────────────────────────────────────────────────────────────

export interface ApiStatus {
  status: 'success' | 'error'
  message: string
}

export interface ApiSuccess {
  success: boolean
  message: string
  error?: string
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  username: string
  password: string
  remember?: boolean
}

// ── Student ──────────────────────────────────────────────────────────────────

export interface StudentDetail {
  name: string
  address: string
  age: number
  phone_number: string
}

export interface Student {
  id: number
  name: string
  address: string
  age: number
  phone_number: string
}

export interface UpdateStudentPayload {
  student_id: number
  name: string
  address: string
  phone_number: string
  age: number | string
}

// ── Teacher ──────────────────────────────────────────────────────────────────

export interface TeacherDetail {
  address: string
  primary_number: string
  secondary_number: string
  dob: string
  image_url: string | null
}

export interface Teacher {
  id: number
  first_name: string
  last_name: string
  username?: string
  address: string
  primary_number: string
  secondary_number?: string
  dob: string | null
  sex?: 'M' | 'F'
  image_url: string | null
}

export interface UpdateTeacherPayload {
  teacher_id: number
  address: string
  primary_number: string
  secondary_number?: string
  dob: string
}

// ── Course ───────────────────────────────────────────────────────────────────

export interface Course {
  id: number
  title: string
  shift: string
  shift_display?: string
  duration: number
  teacher_id?: number
  teacher_name?: string
  student_count?: number
}

// ── Attendance ───────────────────────────────────────────────────────────────

export interface AttendanceRecord {
  id?: number
  date: string
  status: 'P' | 'A'
  student_name?: string
  course_title?: string
}

export interface AlterAttendancePayload {
  stats: 'P' | 'A'
}

// ── Student Report ────────────────────────────────────────────────────────────

export interface CourseAttendance {
  title: string
  present_days: number
  absent_days: number
  attendance_rate: number
}

export interface MonthlyAttendance {
  month: string
  rate: number
}

export interface StudentReport {
  id: number
  name: string
  courses: CourseAttendance[]
  total_present: number
  total_absent: number
  attendance_rate: number
  monthly_attendance: MonthlyAttendance[]
}

// ── Grade Prediction ──────────────────────────────────────────────────────────

export interface PredictionResult {
  predicted_grade: string
  confidence: number
  attendance_rate: number
  present_days: number
  course_performance: 'Good' | 'Average'
  chart_image: string
}

// ── WebSocket ─────────────────────────────────────────────────────────────────

// Client → server
export interface WsStartStream {
  type: 'start_stream'
  courseid: number
}

export interface WsFrame {
  type: 'frame'
  data: string // base64 JPEG data URL captured from the browser webcam
}

export interface WsStopStream {
  type: 'stop_stream'
}

export type WsClientMessage = WsStartStream | WsFrame | WsStopStream

// Server → client
export interface WsStudentDetected {
  type: 'student_detected'
  student: {
    id: number
    name: string
    similarity: number
  }
}

export interface WsStreamStarted {
  type: 'stream_started'
}

export interface WsStreamStopped {
  type: 'stream_stopped'
}

export interface WsError {
  type: 'error'
  message: string
}

export type WsServerMessage = WsStudentDetected | WsStreamStarted | WsStreamStopped | WsError

// ── Admin Dashboard ───────────────────────────────────────────────────────────

export interface AdminDashboardData {
  teachers: Teacher[]
  students: Student[]
  courses: Course[]
  teacher_count: number
  student_count: number
  course_count: number
}

// ── Teacher Dashboard ─────────────────────────────────────────────────────────

export interface StudentClass {
  id: number
  course: Course
  student: Student
}

export interface AttendanceDay {
  [studentId: number]: {
    [day: string]: 'P' | 'A' | 'NA'
  }
}

export interface TakeAttendanceData {
  month_name: string
  today_date: string
  students: StudentClass[]
  past_date: string[]
  status_dict: AttendanceDay
  course: Course
}

// ── Teacher Profile ────────────────────────────────────────────────────────────

export interface TeacherProfile {
  id: number
  first_name: string
  last_name: string
  username: string
  email: string
  address: string
  primary_number: string
  secondary_number: string
  dob: string | null
  sex: 'M' | 'F'
  image_url: string | null
}
