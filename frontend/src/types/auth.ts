export type UserRole = 'admin' | 'teacher'

export interface SessionUser {
  username: string
  role: UserRole
}
