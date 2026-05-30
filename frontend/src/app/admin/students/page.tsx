'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { getStudent, updateStudent, deleteStudent } from '@/lib/api'
import type { Student } from '@/types/api'

export default function StudentsListPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteName, setDeleteName] = useState('')
  const [form, setForm] = useState({ name: '', address: '', phone_number: '', age: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/django/api/students/', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { setStudents(d.students ?? []); setLoading(false) })
      .catch(() => { toast.error('Failed to load students'); setLoading(false) })
  }, [])

  const filtered = useMemo(
    () => students.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())),
    [students, search],
  )

  const openEdit = async (id: number) => {
    try {
      const data = await getStudent(id)
      setForm({
        name: data.name,
        address: data.address,
        phone_number: data.phone_number,
        age: String(data.age),
      })
      setEditId(id)
    } catch {
      toast.error('Failed to load student details')
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editId) return
    setSaving(true)
    try {
      const res = await updateStudent({
        student_id: editId,
        name: form.name,
        address: form.address,
        phone_number: form.phone_number,
        age: Number(form.age),
      })
      if (res.status === 'success') {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === editId
              ? { ...s, name: form.name, address: form.address, phone_number: form.phone_number, age: Number(form.age) }
              : s,
          ),
        )
        toast.success('Student updated successfully')
        setEditId(null)
      } else {
        toast.error(res.message || 'Update failed')
      }
    } catch {
      toast.error('Update failed')
    } finally {
      setSaving(false)
    }
  }

  const openDelete = (s: Student) => {
    setDeleteId(s.id)
    setDeleteName(s.name)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await deleteStudent(deleteId)
      if (res.success) {
        setStudents((prev) => prev.filter((s) => s.id !== deleteId))
        toast.success('Student deleted successfully')
      } else {
        toast.error(res.error ?? 'Delete failed')
      }
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 text-sm mt-0.5">{students.length} registered students</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search students…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all bg-gray-50 focus:bg-white w-56"
            />
          </div>
          <Link
            href="/admin/students/add"
            className="flex items-center gap-1.5 px-4 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #003b5c, #00a4bd)' }}
          >
            <i className="bx bx-plus text-base" />
            Add Student
          </Link>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin w-8 h-8 text-[#00a4bd]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-card shadow-sm flex flex-col items-center justify-center py-20 gap-3">
          <i className="bx bx-folder-open text-5xl text-gray-200" />
          <p className="text-[#4a5568] text-sm">No students found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-card shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#003b5c]/10 flex items-center justify-center flex-shrink-0">
                  <i className="bx bx-user-circle text-2xl text-[#003b5c]" />
                </div>
                <div>
                  <p className="text-xs text-[#4a5568]">Student ID: #{s.id}</p>
                  <h3 className="font-semibold text-[#2d3748]">{s.name}</h3>
                  <p className="text-sm text-[#4a5568]">{s.address}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-[#4a5568] sm:ml-auto">
                <span className="flex items-center gap-1">
                  <i className="bx bx-phone text-[#00a4bd]" />
                  {s.phone_number}
                </span>
                <span className="flex items-center gap-1">
                  <i className="bx bx-user text-[#00a4bd]" />
                  Age: {s.age}
                </span>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => openEdit(s.id)}
                  className="w-9 h-9 flex items-center justify-center rounded-input bg-[#00a4bd] text-white hover:bg-[#0092a8] transition-colors"
                  title="Edit"
                >
                  <i className="bx bx-edit-alt" />
                </button>
                <button
                  onClick={() => openDelete(s)}
                  className="w-9 h-9 flex items-center justify-center rounded-input bg-[#e31837] text-white hover:bg-[#cc1530] transition-colors"
                  title="Delete"
                >
                  <i className="bx bx-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editId !== null && (
        <Modal title="Edit Student" onClose={() => setEditId(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Name" icon="bx bx-user">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-input text-sm focus:border-[#00a4bd] outline-none transition-colors"
                />
              </FormField>
              <FormField label="Address" icon="bx bx-map">
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-input text-sm focus:border-[#00a4bd] outline-none transition-colors"
                />
              </FormField>
              <FormField label="Phone Number" icon="bx bx-phone">
                <input
                  type="tel"
                  value={form.phone_number}
                  onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                  required
                  pattern="[0-9]{10}"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-input text-sm focus:border-[#00a4bd] outline-none transition-colors"
                />
              </FormField>
              <FormField label="Age" icon="bx bx-user">
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  required
                  min="1"
                  max="100"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-input text-sm focus:border-[#00a4bd] outline-none transition-colors"
                />
              </FormField>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#003b5c] text-white text-sm font-medium rounded-input hover:bg-[#002d47] transition-colors disabled:opacity-60"
              >
                <i className="bx bx-save" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteId !== null && (
        <Modal title="Confirm Delete" onClose={() => setDeleteId(null)}>
          <p className="text-[#4a5568] text-sm mb-6">
            Are you sure you want to delete <strong>{deleteName}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteId(null)}
              className="px-4 py-2 text-sm text-[#4a5568] border border-gray-200 rounded-input hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-[#e31837] rounded-input hover:bg-[#cc1530] transition-colors"
            >
              <i className="bx bx-trash" />
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-card shadow-lg w-full max-w-lg animate-[scaleIn_0.2s_ease]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-semibold text-[#2d3748]">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <i className="bx bx-x text-xl text-[#4a5568]" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function FormField({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a5568] mb-1.5">
        <i className={`${icon} text-[#00a4bd]`} />
        {label}
      </label>
      {children}
    </div>
  )
}
