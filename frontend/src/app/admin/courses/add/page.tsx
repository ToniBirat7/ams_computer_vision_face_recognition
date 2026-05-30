'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { BookOpen, UserCheck, Clock, Sun, Sunset, ArrowLeft, Plus, CheckCircle2 } from 'lucide-react'
import { getTeachers, addCourse } from '@/lib/api'
import type { Teacher } from '@/types/api'
import { Card, Button, Input, FormField, NativeSelect, PageHeader, Reveal } from '@/components/ui'
import { cn } from '@/lib/utils'

const tips = [
  'Give the course a clear, descriptive title.',
  'Assign a qualified teacher to lead the course.',
  'Choose the shift that matches the timetable.',
]

export default function AddCoursePage() {
  const router = useRouter()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [form, setForm] = useState({ teacher: '', title: '', duration: '', shift: 'M' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => { getTeachers().then(setTeachers).catch(() => toast.error('Failed to load teachers')) }, [])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.teacher) e.teacher = 'Select a teacher'
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.duration || Number(form.duration) < 1) e.duration = 'At least 1 week'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await addCourse(form)
      if (res.success) { toast.success('Course added'); router.push('/admin/courses') }
      else toast.error(res.error || res.message || 'Failed to add course')
    } catch { toast.error('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <Reveal>
        <PageHeader title="Add Course" subtitle="Create a new course"
          actions={<Link href="/admin/courses"><Button variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>Back</Button></Link>} />
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Reveal delay={0.05} className="lg:col-span-2">
          <Card className="p-6 h-full bg-[linear-gradient(160deg,var(--danger-soft),transparent)]">
            <div className="w-12 h-12 rounded-2xl bg-danger-soft flex items-center justify-center mb-4"><BookOpen className="w-6 h-6 text-danger" /></div>
            <h2 className="font-bold text-fg text-lg">Guidelines</h2>
            <p className="text-sm text-muted mt-1 mb-5">Set up the course correctly.</p>
            <ul className="space-y-3">
              {tips.map((t, i) => <li key={i} className="flex items-start gap-2.5 text-sm text-fg-soft"><CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />{t}</li>)}
            </ul>
          </Card>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-3">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <FormField label="Teacher" icon={UserCheck} error={errors.teacher}>
                <NativeSelect value={form.teacher} error={!!errors.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })}>
                  <option value="">Select a teacher…</option>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
                </NativeSelect>
              </FormField>

              <FormField label="Course Title" icon={BookOpen} error={errors.title}>
                <Input value={form.title} error={!!errors.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Advanced Python" />
              </FormField>

              <FormField label="Duration (weeks)" icon={Clock} error={errors.duration}>
                <Input type="number" value={form.duration} error={!!errors.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="Number of weeks" min={1} />
              </FormField>

              <div>
                <p className="text-[12px] font-semibold text-fg-soft uppercase tracking-wide mb-2">Shift</p>
                <div className="grid grid-cols-2 gap-3">
                  {[{ v: 'M', label: 'Morning', Icon: Sun }, { v: 'D', label: 'Day', Icon: Sunset }].map(({ v, label, Icon }) => (
                    <button type="button" key={v} onClick={() => setForm({ ...form, shift: v })}
                      className={cn('flex items-center gap-2.5 p-4 rounded-input border-2 transition-all', form.shift === v ? 'border-brand bg-brand-soft' : 'border-border hover:border-border-strong')}>
                      <Icon className={cn('w-5 h-5', form.shift === v ? 'text-brand' : 'text-muted')} />
                      <span className={cn('text-sm font-medium', form.shift === v ? 'text-brand' : 'text-fg-soft')}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" loading={loading} icon={<Plus className="w-4 h-4" />} className="w-full" size="lg">Add Course</Button>
            </form>
          </Card>
        </Reveal>
      </div>
    </div>
  )
}
