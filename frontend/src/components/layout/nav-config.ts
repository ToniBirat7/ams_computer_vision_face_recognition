import {
  LayoutDashboard, GraduationCap, Users, BookOpen, School,
  CalendarCheck, FileBarChart, UserPlus, type LucideIcon,
} from 'lucide-react'

export interface NavItem { href: string; icon: LucideIcon; label: string }
export interface NavSection { title: string; items: NavItem[] }

export const adminNav: NavSection[] = [
  {
    title: 'Overview',
    items: [{ href: '/admin', icon: LayoutDashboard, label: 'Dashboard' }],
  },
  {
    title: 'Management',
    items: [
      { href: '/admin/teachers', icon: Users,         label: 'Teachers' },
      { href: '/admin/students', icon: GraduationCap, label: 'Students' },
      { href: '/admin/courses',  icon: BookOpen,      label: 'Courses' },
      { href: '/admin/classes',  icon: School,        label: 'Classes' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { href: '/admin/attendance/review', icon: CalendarCheck, label: 'Attendance Review' },
      { href: '/admin/reports',           icon: FileBarChart,  label: 'Student Reports' },
    ],
  },
  {
    title: 'System',
    items: [{ href: '/admin/register', icon: UserPlus, label: 'Register User' }],
  },
]

// Route → page title (longest prefix match wins)
const titleMap: [string, string][] = [
  ['/admin/teachers/add', 'Register Teacher'],
  ['/admin/teachers', 'Teachers'],
  ['/admin/students/add', 'Register Student'],
  ['/admin/students', 'Students'],
  ['/admin/courses/add', 'Add Course'],
  ['/admin/courses', 'Courses'],
  ['/admin/classes/add', 'Assign Class'],
  ['/admin/classes', 'Classes'],
  ['/admin/attendance/review', 'Attendance Review'],
  ['/admin/attendance', 'Alter Attendance'],
  ['/admin/reports', 'Student Reports'],
  ['/admin/register', 'Register User'],
  ['/admin', 'Dashboard'],
]

export function pageTitle(pathname: string): string {
  for (const [prefix, title] of titleMap) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) return title
  }
  return 'Dashboard'
}
