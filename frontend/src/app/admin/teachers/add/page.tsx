'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  UserCircle, MapPin, Phone, Calendar, ImagePlus, UserPlus,
  ArrowLeft, CheckCircle2, User, UserRound,
} from 'lucide-react'
import { getUsers, addTeacher, type UserOption } from '@/lib/api'
import { Card, Button, Input, FormField, NativeSelect, PageHeader, Reveal } from '@/components/ui'
import { cn } from '@/lib/utils'

const tips = [
  'Select an existing user account to link this teacher profile.',
  'Both phone numbers must be unique 10-digit numbers.',
  'Upload a clear, professional photo (JPG/PNG, under 2 MB).',
]

export default function AddTeacherPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserOption[]>([])
  const [form, setForm] = useState({ teacher: '', address: '', primary_number: '', secondary_number: '', dob: '', sex: 'M' })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { getUsers().then(setUsers).catch(() => toast.error('Failed to load users')) }, [])

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file); setPreview(URL.createObjectURL(file))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.teacher) e.teacher = 'Select a user'
    if (!form.address.trim()) e.address = 'Address is required'
    if (!/^\d{10}$/.test(form.primary_number)) e.primary_number = 'Must be 10 digits'
    if (form.secondary_number && !/^\d{10}$/.test(form.secondary_number)) e.secondary_number = 'Must be 10 digits'
    if (!form.dob) e.dob = 'Date of birth is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const r = await addTeacher(form, imageFile)
      if (r.ok) { toast.success('Teacher registered'); router.push('/admin/teachers') }
      else toast.error('Registration failed. Check the form.')
    } catch { toast.error('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <Reveal>
        <PageHeader title="Register Teacher" subtitle="Link a user account and add teacher details"
          actions={<Link href="/admin/teachers"><Button variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>Back</Button></Link>} />
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Reveal delay={0.05} className="lg:col-span-2">
          <Card className="p-6 h-full bg-[linear-gradient(160deg,var(--accent-soft),transparent)]">
            <div className="w-12 h-12 rounded-2xl bg-accent-soft flex items-center justify-center mb-4"><UserPlus className="w-6 h-6 text-accent" /></div>
            <h2 className="font-bold text-fg text-lg">Guidelines</h2>
            <p className="text-sm text-muted mt-1 mb-5">A complete profile improves recognition.</p>
            <ul className="space-y-3">
              {tips.map((t, i) => <li key={i} className="flex items-start gap-2.5 text-sm text-fg-soft"><CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />{t}</li>)}
            </ul>
          </Card>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-3">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <FormField label="Select User" icon={UserCircle} error={errors.teacher}>
                <NativeSelect value={form.teacher} error={!!errors.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })}>
                  <option value="">Select a user…</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.username})</option>)}
                </NativeSelect>
              </FormField>

              <FormField label="Address" icon={MapPin} error={errors.address}>
                <Input value={form.address} error={!!errors.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Enter address" />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Primary Number" icon={Phone} error={errors.primary_number}>
                  <Input type="tel" value={form.primary_number} error={!!errors.primary_number} onChange={(e) => setForm({ ...form, primary_number: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit" />
                </FormField>
                <FormField label="Secondary Number" icon={Phone} error={errors.secondary_number}>
                  <Input type="tel" value={form.secondary_number} error={!!errors.secondary_number} onChange={(e) => setForm({ ...form, secondary_number: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="Optional" />
                </FormField>
              </div>

              <FormField label="Date of Birth" icon={Calendar} error={errors.dob}>
                <Input type="date" value={form.dob} error={!!errors.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
              </FormField>

              <div>
                <p className="text-[12px] font-semibold text-fg-soft uppercase tracking-wide mb-2">Gender</p>
                <div className="grid grid-cols-2 gap-3">
                  {[{ v: 'M', label: 'Male', Icon: User }, { v: 'F', label: 'Female', Icon: UserRound }].map(({ v, label, Icon }) => (
                    <button type="button" key={v} onClick={() => setForm({ ...form, sex: v })}
                      className={cn('flex items-center gap-2.5 p-3 rounded-input border-2 transition-all', form.sex === v ? 'border-brand bg-brand-soft' : 'border-border hover:border-border-strong')}>
                      <Icon className={cn('w-5 h-5', form.sex === v ? 'text-brand' : 'text-muted')} />
                      <span className={cn('text-sm font-medium', form.sex === v ? 'text-brand' : 'text-fg-soft')}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[12px] font-semibold text-fg-soft uppercase tracking-wide mb-2">Profile Image</p>
                <div onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-card p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-accent transition-colors">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <>
                      <ImagePlus className="w-9 h-9 text-muted" />
                      <span className="text-sm text-muted">Click to upload an image</span>
                    </>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImage} />
                </div>
              </div>

              <Button type="submit" loading={loading} icon={<UserPlus className="w-4 h-4" />} className="w-full" size="lg">Register Teacher</Button>
            </form>
          </Card>
        </Reveal>
      </div>
    </div>
  )
}
