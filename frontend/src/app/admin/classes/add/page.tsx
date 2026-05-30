'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Select from 'react-select'
import toast from 'react-hot-toast'
import { Users, BookOpen, ArrowLeft, Plus, CheckCircle2 } from 'lucide-react'
import { getStudents, getCourses, addClass } from '@/lib/api'
import type { Student, Course } from '@/types/api'
import { Card, Button, PageHeader, Reveal } from '@/components/ui'

const tips = [
  'Select one or more students to enroll at once.',
  'Choose the course they should be assigned to.',
  'Review your selection before assigning.',
]

interface Opt { value: number; label: string }

export default function AddClassPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selStudents, setSelStudents] = useState<Opt[]>([])
  const [selCourse, setSelCourse] = useState<Opt | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([getStudents(), getCourses()])
      .then(([s, c]) => { setStudents(s); setCourses(c) })
      .catch(() => toast.error('Failed to load data'))
  }, [])

  const studentOptions = students.map((s) => ({ value: s.id, label: `${s.name} (#${s.id})` }))
  const courseOptions = courses.map((c) => ({ value: c.id, label: c.title }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selStudents.length === 0) return toast.error('Select at least one student')
    if (!selCourse) return toast.error('Select a course')
    setLoading(true)
    try {
      const r = await addClass(selStudents.map((s) => s.value), selCourse.value)
      if (r.ok) { toast.success('Class assigned'); router.push('/admin/classes') }
      else toast.error('Assignment failed')
    } catch { toast.error('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <Reveal>
        <PageHeader title="Assign Class" subtitle="Enroll students into a course"
          actions={<Link href="/admin/classes"><Button variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>Back</Button></Link>} />
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Reveal delay={0.05} className="lg:col-span-2">
          <Card className="p-6 h-full bg-[linear-gradient(160deg,var(--brand-soft),transparent)]">
            <div className="w-12 h-12 rounded-2xl bg-brand-soft flex items-center justify-center mb-4"><Users className="w-6 h-6 text-brand" /></div>
            <h2 className="font-bold text-fg text-lg">Guidelines</h2>
            <p className="text-sm text-muted mt-1 mb-5">Enroll students efficiently.</p>
            <ul className="space-y-3">
              {tips.map((t, i) => <li key={i} className="flex items-start gap-2.5 text-sm text-fg-soft"><CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />{t}</li>)}
            </ul>
          </Card>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-3">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="flex items-center gap-1.5 text-[12px] font-semibold text-fg-soft mb-1.5 uppercase tracking-wide"><Users className="w-3.5 h-3.5 text-accent" />Select Students</label>
                <Select isMulti options={studentOptions} value={selStudents}
                  onChange={(v) => setSelStudents(v as Opt[])} placeholder="Search and select students…"
                  classNamePrefix="rs" classNames={{
                    control: () => 'rs__control', menu: () => 'rs__menu', option: (s) => `rs__option ${s.isFocused ? 'rs__option--is-focused' : ''}`,
                    multiValue: () => 'rs__multi-value', multiValueLabel: () => 'rs__multi-value__label', multiValueRemove: () => 'rs__multi-value__remove',
                    placeholder: () => 'rs__placeholder', input: () => 'rs__input-color',
                  }} unstyled />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[12px] font-semibold text-fg-soft mb-1.5 uppercase tracking-wide"><BookOpen className="w-3.5 h-3.5 text-accent" />Select Course</label>
                <Select options={courseOptions} value={selCourse}
                  onChange={(v) => setSelCourse(v as Opt)} placeholder="Select a course…"
                  classNamePrefix="rs" classNames={{
                    control: () => 'rs__control', menu: () => 'rs__menu', option: (s) => `rs__option ${s.isFocused ? 'rs__option--is-focused' : ''}`,
                    singleValue: () => 'rs__single-value', placeholder: () => 'rs__placeholder', input: () => 'rs__input-color',
                  }} unstyled />
              </div>

              <Button type="submit" loading={loading} icon={<Plus className="w-4 h-4" />} className="w-full" size="lg">Assign Class</Button>
            </form>
          </Card>
        </Reveal>
      </div>
    </div>
  )
}
