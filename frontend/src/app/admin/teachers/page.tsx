'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Search, Plus, Pencil, Trash2, Eye, Phone, Calendar, MapPin, Users } from 'lucide-react'
import { getTeachers, getTeacher, updateTeacher, deleteTeacher } from '@/lib/api'
import type { Teacher } from '@/types/api'
import {
  Card, Button, Input, FormField, Avatar, EmptyState, SkeletonRows,
  Modal, PageHeader, Reveal, Stagger, StaggerItem,
} from '@/components/ui'

export default function TeachersListPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null)
  const [form, setForm] = useState({ address: '', primary_number: '', secondary_number: '', dob: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getTeachers().then(setTeachers).catch(() => toast.error('Failed to load teachers')).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(
    () => teachers.filter((t) => `${t.first_name} ${t.last_name}`.toLowerCase().includes(search.toLowerCase())),
    [teachers, search],
  )

  const openEdit = async (id: number) => {
    try {
      const d = await getTeacher(id)
      setForm({ address: d.address, primary_number: d.primary_number, secondary_number: d.secondary_number ?? '', dob: d.dob ?? '' })
      setEditId(id)
    } catch { toast.error('Failed to load teacher') }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editId) return
    setSaving(true)
    try {
      const res = await updateTeacher({ teacher_id: editId, address: form.address, primary_number: form.primary_number, secondary_number: form.secondary_number || undefined, dob: form.dob })
      if (res.status === 'success') {
        setTeachers((prev) => prev.map((t) => t.id === editId ? { ...t, address: form.address, primary_number: form.primary_number, secondary_number: form.secondary_number, dob: form.dob } : t))
        toast.success('Teacher updated'); setEditId(null)
      } else toast.error(res.message || 'Update failed')
    } catch { toast.error('Update failed') } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await deleteTeacher(deleteTarget.id)
      if (res.success) { setTeachers((prev) => prev.filter((t) => t.id !== deleteTarget.id)); toast.success('Teacher deleted') }
      else toast.error(res.error ?? 'Delete failed')
    } catch { toast.error('Delete failed') } finally { setDeleteTarget(null) }
  }

  return (
    <div className="space-y-6">
      <Reveal>
        <PageHeader
          title="Teachers"
          subtitle={`${teachers.length} registered teachers`}
          actions={
            <>
              <div className="relative">
                <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search teachers…"
                  className="h-11 w-44 sm:w-56 pl-9 pr-3 text-sm text-fg bg-surface-2 border border-border rounded-input outline-none placeholder:text-muted focus:bg-surface focus:border-accent focus:shadow-[0_0_0_3px_var(--ring)] transition-all"
                />
              </div>
              <Link href="/admin/teachers/add"><Button icon={<Plus className="w-4 h-4" />}>Add Teacher</Button></Link>
            </>
          }
        />
      </Reveal>

      {loading ? (
        <SkeletonRows rows={5} />
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon={Users} title="No teachers found" message={search ? 'Try a different search.' : 'Register your first teacher.'} /></Card>
      ) : (
        <Stagger className="space-y-3">
          {filtered.map((t) => (
            <StaggerItem key={t.id}>
              <Card hover className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <Avatar name={`${t.first_name} ${t.last_name}`} src={t.image_url ? `/media${t.image_url}` : null} size="md" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-fg">{t.first_name} {t.last_name}</h3>
                  <p className="text-sm text-muted flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-accent" />{t.address}</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-muted">
                  <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-accent" />{t.primary_number}</span>
                  {t.dob && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-accent" />{t.dob}</span>}
                </div>
                <div className="flex gap-2 sm:ml-2">
                  <button onClick={() => openEdit(t.id)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-accent-soft text-accent hover:brightness-95 transition" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(t)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-danger-soft text-danger hover:brightness-95 transition" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                  <Link href={`/admin/teachers/${t.id}`} className="h-9 px-3 flex items-center gap-1.5 rounded-lg bg-brand-soft text-brand text-sm font-medium hover:brightness-95 transition"><Eye className="w-4 h-4" /><span className="hidden sm:inline">View</span></Link>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      )}

      <Modal open={editId !== null} onClose={() => setEditId(null)} title="Edit Teacher">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Address" icon={MapPin}><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required /></FormField>
            <FormField label="Primary Number" icon={Phone}><Input value={form.primary_number} onChange={(e) => setForm({ ...form, primary_number: e.target.value })} required pattern="[0-9]{10}" /></FormField>
            <FormField label="Secondary Number" icon={Phone}><Input value={form.secondary_number} onChange={(e) => setForm({ ...form, secondary_number: e.target.value })} pattern="[0-9]{10}" /></FormField>
            <FormField label="Date of Birth" icon={Calendar}><Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} required /></FormField>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditId(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      <Modal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} title="Delete Teacher" maxWidth="max-w-md">
        <p className="text-sm text-fg-soft mb-6">Delete <strong className="text-fg">{deleteTarget?.first_name} {deleteTarget?.last_name}</strong>? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" icon={<Trash2 className="w-4 h-4" />} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
