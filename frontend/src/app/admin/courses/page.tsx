'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Plus, Trash2, BookOpen } from 'lucide-react'
import { getCourses, deleteCourse } from '@/lib/api'
import type { Course } from '@/types/api'
import {
  Card, Button, Badge, EmptyState, Spinner, PageHeader,
  Table, THead, TBody, TRow, TCell, Reveal,
} from '@/components/ui'

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    getCourses().then(setCourses).catch(() => toast.error('Failed to load courses')).finally(() => setLoading(false))
  }, [])

  const remove = async (id: number) => {
    if (!confirm('Delete this course?')) return
    setDeleting(id)
    try {
      const r = await deleteCourse(id)
      if (!r.ok) throw new Error()
      setCourses((p) => p.filter((c) => c.id !== id)); toast.success('Course deleted')
    } catch { toast.error('Failed to delete course') } finally { setDeleting(null) }
  }

  return (
    <div className="space-y-6">
      <Reveal>
        <PageHeader title="Courses" subtitle={`${courses.length} courses`}
          actions={<Link href="/admin/courses/add"><Button icon={<Plus className="w-4 h-4" />}>Add Course</Button></Link>} />
      </Reveal>

      {loading ? <Spinner /> : courses.length === 0 ? (
        <Card><EmptyState icon={BookOpen} title="No courses yet" message="Create your first course." action={<Link href="/admin/courses/add"><Button icon={<Plus className="w-4 h-4" />}>Add Course</Button></Link>} /></Card>
      ) : (
        <Reveal>
          <Card className="overflow-hidden">
            <Table>
              <THead columns={[{ label: 'Title' }, { label: 'Teacher' }, { label: 'Duration' }, { label: 'Shift' }, { label: 'Actions', align: 'right' }]} />
              <TBody>
                {courses.map((c) => (
                  <TRow key={c.id}>
                    <TCell className="font-semibold text-fg">{c.title}</TCell>
                    <TCell>{c.teacher_name ?? '—'}</TCell>
                    <TCell>{c.duration} weeks</TCell>
                    <TCell><Badge tone={c.shift === 'M' ? 'morning' : 'day'}>{c.shift_display ?? (c.shift === 'M' ? 'Morning' : 'Day')}</Badge></TCell>
                    <TCell align="right">
                      <button onClick={() => remove(c.id)} disabled={deleting === c.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-danger hover:bg-danger-soft rounded-lg text-xs font-semibold transition-colors disabled:opacity-60">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </TCell>
                  </TRow>
                ))}
              </TBody>
            </Table>
          </Card>
        </Reveal>
      )}
    </div>
  )
}
