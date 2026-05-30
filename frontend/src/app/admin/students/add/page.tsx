'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { User, MapPin, Hash, Phone, UserPlus, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { addStudent } from '@/lib/api'
import { Card, Button, Input, FormField, PageHeader, Reveal } from '@/components/ui'

const tips = [
  'Enter the student’s full legal name as it appears on records.',
  'Age must be between 20 and 30 for enrollment eligibility.',
  'Phone number must be a unique 10-digit number.',
]

export default function AddStudentPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', address: '', age: '', phone_number: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.address.trim()) e.address = 'Address is required'
    if (!form.age || Number(form.age) < 20 || Number(form.age) > 30) e.age = 'Age must be between 20 and 30'
    if (!/^\d{10}$/.test(form.phone_number)) e.phone_number = 'Phone must be 10 digits'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await addStudent(form)
      if (res.success) { toast.success('Student registered'); router.push('/admin/students') }
      else toast.error(res.error || res.message || 'Registration failed')
    } catch { toast.error('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <Reveal>
        <PageHeader
          title="Register Student"
          subtitle="Add a new student to the system"
          actions={<Link href="/admin/students"><Button variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>Back</Button></Link>}
        />
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Reveal delay={0.05} className="lg:col-span-2">
          <Card className="p-6 h-full bg-[linear-gradient(160deg,var(--brand-soft),transparent)]">
            <div className="w-12 h-12 rounded-2xl bg-brand-soft flex items-center justify-center mb-4">
              <UserPlus className="w-6 h-6 text-brand" />
            </div>
            <h2 className="font-bold text-fg text-lg">Guidelines</h2>
            <p className="text-sm text-muted mt-1 mb-5">Follow these to ensure a clean record.</p>
            <ul className="space-y-3">
              {tips.map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-fg-soft">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" /> {t}
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-3">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <FormField label="Full Name" icon={User} error={errors.name}>
                <Input value={form.name} error={!!errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter full name" />
              </FormField>
              <FormField label="Address" icon={MapPin} error={errors.address}>
                <Input value={form.address} error={!!errors.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Enter address" />
              </FormField>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Age" icon={Hash} error={errors.age}>
                  <Input type="number" value={form.age} error={!!errors.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="20–30" min={20} max={30} />
                </FormField>
                <FormField label="Phone Number" icon={Phone} error={errors.phone_number}>
                  <Input type="tel" value={form.phone_number} error={!!errors.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit number" />
                </FormField>
              </div>
              <Button type="submit" loading={loading} icon={<UserPlus className="w-4 h-4" />} className="w-full" size="lg">
                Register Student
              </Button>
            </form>
          </Card>
        </Reveal>
      </div>
    </div>
  )
}
