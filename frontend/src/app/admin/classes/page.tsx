'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Plus, Trash2, School } from 'lucide-react'
import { getClasses, deleteClass, type ClassEnrollment } from '@/lib/api'
import {
  Card, Button, EmptyState, Spinner, PageHeader, Avatar,
  Table, THead, TBody, TRow, TCell, Reveal,
} from '@/components/ui'

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    getClasses().then(setClasses).catch(() => toast.error('Failed to load enrollments')).finally(() => setLoading(false))
  }, [])

  const remove = async (id: number) => {
    if (!confirm('Remove this student from the class?')) return
    setDeleting(id)
    try {
      const r = await deleteClass(id)
      if (!r.ok) throw new Error()
      setClasses((p) => p.filter((c) => c.id !== id)); toast.success('Student removed')
    } catch { toast.error('Failed to remove') } finally { setDeleting(null) }
  }

  return (
    <div className="space-y-6">
      <Reveal>
        <PageHeader title="Class Enrollments" subtitle={`${classes.length} enrollments`}
          actions={<Link href="/admin/classes/add"><Button icon={<Plus className="w-4 h-4" />}>Assign Class</Button></Link>} />
      </Reveal>

      {loading ? <Spinner /> : classes.length === 0 ? (
        <Card><EmptyState icon={School} title="No enrollments yet" message="Assign students to a course." action={<Link href="/admin/classes/add"><Button icon={<Plus className="w-4 h-4" />}>Assign Class</Button></Link>} /></Card>
      ) : (
        <Reveal>
          <Card className="overflow-hidden">
            <Table>
              <THead columns={[{ label: 'Student' }, { label: 'Course' }, { label: 'Actions', align: 'right' }]} />
              <TBody>
                {classes.map((e) => (
                  <TRow key={e.id}>
                    <TCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={e.student_name} size="sm" />
                        <span className="font-semibold text-fg">{e.student_name}</span>
                      </div>
                    </TCell>
                    <TCell>{e.course_title}</TCell>
                    <TCell align="right">
                      <button onClick={() => remove(e.id)} disabled={deleting === e.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-danger hover:bg-danger-soft rounded-lg text-xs font-semibold transition-colors disabled:opacity-60">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
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
