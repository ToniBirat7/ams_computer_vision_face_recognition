'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  Search, Plus, Pencil, Trash2, Phone, User, MapPin, Hash, GraduationCap,
} from 'lucide-react'
import { getStudents, getStudent, updateStudent, deleteStudent } from '@/lib/api'
import type { Student } from '@/types/api'
import {
  Card, Button, Input, FormField, Avatar, EmptyState, SkeletonRows,
  Modal, PageHeader, Reveal, Stagger, StaggerItem,
} from '@/components/ui'

export default function StudentsListPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null)
  const [form, setForm] = useState({ name: '', address: '', phone_number: '', age: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getStudents().then(setStudents).catch(() => toast.error('Failed to load students')).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(
    () => students.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())),
    [students, search],
  )

  const openEdit = async (id: number) => {
    try {
      const d = await getStudent(id)
      setForm({ name: d.name, address: d.address, phone_number: d.phone_number, age: String(d.age) })
      setEditId(id)
    } catch { toast.error('Failed to load student') }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editId) return
    setSaving(true)
    try {
      const res = await updateStudent({ student_id: editId, name: form.name, address: form.address, phone_number: form.phone_number, age: Number(form.age) })
      if (res.status === 'success') {
        setStudents((prev) => prev.map((s) => s.id === editId ? { ...s, name: form.name, address: form.address, phone_number: form.phone_number, age: Number(form.age) } : s))
        toast.success('Student updated'); setEditId(null)
      } else toast.error(res.message || 'Update failed')
    } catch { toast.error('Update failed') } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await deleteStudent(deleteTarget.id)
      if (res.success) { setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id)); toast.success('Student deleted') }
      else toast.error(res.error ?? 'Delete failed')
    } catch { toast.error('Delete failed') } finally { setDeleteTarget(null) }
  }

  return (
    <div className="space-y-6">
      <Reveal>
        <PageHeader
          title="Students"
          subtitle={`${students.length} registered students`}
          actions={
            <>
              <div className="relative">
                <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students…"
                  className="h-11 w-44 sm:w-56 pl-9 pr-3 text-sm text-fg bg-surface-2 border border-border rounded-input outline-none placeholder:text-muted focus:bg-surface focus:border-accent focus:shadow-[0_0_0_3px_var(--ring)] transition-all"
                />
              </div>
              <Link href="/admin/students/add"><Button icon={<Plus className="w-4 h-4" />}>Add Student</Button></Link>
            </>
          }
        />
      </Reveal>

      {loading ? (
        <SkeletonRows rows={6} />
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon={GraduationCap} title="No students found" message={search ? 'Try a different search.' : 'Register your first student.'} /></Card>
      ) : (
        <Stagger className="space-y-3">
          {filtered.map((s) => (
            <StaggerItem key={s.id}>
              <Card hover className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <Avatar name={s.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-muted font-mono">#{s.id}</p>
                  <h3 className="font-semibold text-fg">{s.name}</h3>
                  <p className="text-sm text-muted flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-accent" />{s.address}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted">
                  <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-accent" />{s.phone_number}</span>
                  <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-accent" />Age {s.age}</span>
                </div>
                <div className="flex gap-2 sm:ml-2">
                  <button onClick={() => openEdit(s.id)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-accent-soft text-accent hover:brightness-95 transition" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(s)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-danger-soft text-danger hover:brightness-95 transition" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {/* Edit modal */}
      <Modal open={editId !== null} onClose={() => setEditId(null)} title="Edit Student">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Name" icon={User}><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></FormField>
            <FormField label="Address" icon={MapPin}><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required /></FormField>
            <FormField label="Phone" icon={Phone}><Input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} required pattern="[0-9]{10}" /></FormField>
            <FormField label="Age" icon={Hash}><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required min={1} max={100} /></FormField>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditId(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete modal */}
      <Modal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} title="Delete Student" maxWidth="max-w-md">
        <p className="text-sm text-fg-soft mb-6">Delete <strong className="text-fg">{deleteTarget?.name}</strong>? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" icon={<Trash2 className="w-4 h-4" />} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
