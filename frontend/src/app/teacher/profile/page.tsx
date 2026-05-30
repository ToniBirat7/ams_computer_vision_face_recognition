import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Pencil, MapPin, Phone, Mail, Calendar, User, BookOpen, ArrowRight,
} from 'lucide-react'
import { fetchTeacherProfile, fetchTeacherCourses } from '@/lib/api-proxy'
import { Card, Avatar, Button, Badge, Reveal } from '@/components/ui'

export default async function TeacherProfilePage() {
  const [profile, coursesData] = await Promise.all([fetchTeacherProfile(), fetchTeacherCourses()])
  if (!profile) redirect('/')
  const courses = coursesData?.courses ?? []
  const totalStudents = courses.reduce((s, c) => s + (c.student_count ?? 0), 0)
  const fullName = `${profile.first_name} ${profile.last_name}`

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-fg tracking-tight">My Profile</h1>
            <p className="text-muted text-sm mt-1">Your personal information and assigned courses.</p>
          </div>
          <Link href="/teacher/profile/edit"><Button icon={<Pencil className="w-4 h-4" />}>Edit Profile</Button></Link>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Reveal>
          <Card className="overflow-hidden">
            <div className="h-24" style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))' }} />
            <div className="px-6 pb-6 -mt-12 flex flex-col items-center text-center">
              <Avatar name={fullName} src={profile.image_url ? `/media${profile.image_url}` : null} size="xl" className="ring-4 ring-[color:var(--surface)]" />
              <h2 className="text-xl font-bold text-fg mt-3">{fullName}</h2>
              <p className="text-muted text-sm">Teacher</p>
              <div className="grid grid-cols-2 gap-4 w-full border-t border-border mt-5 pt-5">
                <div><p className="text-xl font-bold text-fg">{courses.length}</p><p className="text-xs text-muted">Courses</p></div>
                <div><p className="text-xl font-bold text-fg">{totalStudents}</p><p className="text-xs text-muted">Students</p></div>
              </div>
            </div>
          </Card>
        </Reveal>

        <div className="lg:col-span-2 space-y-6">
          <Reveal delay={0.05}>
            <Card accent="var(--accent)" className="p-6">
              <h3 className="font-bold text-fg mb-4 flex items-center gap-2"><Phone className="w-4 h-4 text-accent" />Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { Icon: Mail, label: 'Email', value: profile.email },
                  { Icon: Phone, label: 'Primary Phone', value: profile.primary_number },
                  { Icon: Phone, label: 'Secondary Phone', value: profile.secondary_number },
                  { Icon: MapPin, label: 'Address', value: profile.address },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-accent" /></div>
                    <div className="min-w-0"><p className="text-[11px] uppercase tracking-wide text-muted">{label}</p><p className="text-sm text-fg truncate">{value || '—'}</p></div>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.1}>
            <Card accent="var(--brand)" className="p-6">
              <h3 className="font-bold text-fg mb-4 flex items-center gap-2"><User className="w-4 h-4 text-accent" />Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center shrink-0"><Calendar className="w-4 h-4 text-accent" /></div>
                  <div><p className="text-[11px] uppercase tracking-wide text-muted">Date of Birth</p><p className="text-sm text-fg">{profile.dob ? new Date(profile.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center shrink-0"><User className="w-4 h-4 text-accent" /></div>
                  <div><p className="text-[11px] uppercase tracking-wide text-muted">Gender</p><p className="text-sm text-fg">{profile.sex === 'M' ? 'Male' : 'Female'}</p></div>
                </div>
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.15}>
            <Card className="p-6">
              <h3 className="font-bold text-fg mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4 text-accent" />Current Courses</h3>
              {courses.length === 0 ? (
                <p className="text-sm text-muted">No courses assigned yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {courses.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-surface-2 rounded-xl">
                      <div>
                        <h4 className="font-medium text-fg text-sm">{c.title}</h4>
                        <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                          <Badge tone={c.shift === 'M' ? 'morning' : 'day'}>{c.shift_display ?? (c.shift === 'M' ? 'Morning' : 'Day')}</Badge>
                          {c.duration} weeks
                        </p>
                      </div>
                      <Link href={`/teacher/attendance/${c.id}`} className="inline-flex items-center gap-1 text-xs text-accent font-medium hover:underline">Take Attendance <ArrowRight className="w-3.5 h-3.5" /></Link>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  )
}
