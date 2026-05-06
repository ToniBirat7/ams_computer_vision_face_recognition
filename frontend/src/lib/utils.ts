/** Merge class names (lightweight, no clsx dependency needed) */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/** Format date string to "Jan 12, 2025" */
export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Format date to "YYYY-MM-DD" for API submission */
export function toISODate(dateStr: string): string {
  return dateStr.split('T')[0]
}

/** Map grade letter to numeric value for ML model */
export const GRADE_NUMERIC: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D':  1.0, 'F': 0.0,
}

/** Colour for predicted grade badge */
export function gradeColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-green-600 bg-green-100'
  if (grade.startsWith('B')) return 'text-blue-600 bg-blue-100'
  if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-100'
  return 'text-red-600 bg-red-100'
}

/** Shift display value */
export function shiftLabel(shift: 'M' | 'D'): string {
  return shift === 'M' ? 'Morning' : 'Day'
}

/** Gender display */
export function genderLabel(sex: 'M' | 'F'): string {
  return sex === 'M' ? 'Male' : 'Female'
}

/** Extract CSRF token from cookies (client-side only) */
export function getCsrfToken(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(/csrftoken=([^;]+)/)
  return match ? match[1] : ''
}
