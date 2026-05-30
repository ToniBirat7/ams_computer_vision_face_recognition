'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Mail, MapPin, Phone, User, Save, ArrowLeft } from 'lucide-react'
import { getTeacherProfileClient, editProfile } from '@/lib/api'
import { Card, Button, Input, FormField, Spinner, PageHeader, Reveal } from '@/components/ui'

export default function EditProfilePage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', address: '', primary_number: '', secondary_number: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getTeacherProfileClient()
      .then((d) => setForm({ email: d.email ?? '', address: d.address ?? '', primary_number: d.primary_number ?? '', secondary_number: d.secondary_number ?? '' }))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.primary_number && !/^\d{10}$/.test(form.primary_number)) return toast.error('Primary phone must be 10 digits')
    if (form.secondary_number && !/^\d{10}$/.test(form.secondary_number)) return toast.error('Secondary phone must be 10 digits')
    setSaving(true)
    try {
      const r = await editProfile(form)
      if (r.ok) { toast.success('Profile updated'); router.push('/teacher/profile') }
      else toast.error('Failed to update profile')
    } catch { toast.error('Network error') } finally { setSaving(false) }
  }

  if (loading) return <Spinner />

  return (
    <div className="max-w-3xl space-y-6">
      <Reveal>
        <PageHeader title="Edit Profile" subtitle="Update your contact information"
          actions={<Link href="/teacher/profile"><Button variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>Back</Button></Link>} />
      </Reveal>

      <Reveal delay={0.05}>
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="font-bold text-fg mb-4 flex items-center gap-2"><User className="w-4 h-4 text-accent" />Personal</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Email" icon={Mail}><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" /></FormField>
                <FormField label="Address" icon={MapPin}><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Your address" /></FormField>
              </div>
            </div>
            <div>
              <h2 className="font-bold text-fg mb-4 flex items-center gap-2"><Phone className="w-4 h-4 text-accent" />Contact</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Primary Phone" icon={Phone}><Input type="tel" value={form.primary_number} onChange={(e) => setForm({ ...form, primary_number: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit number" /></FormField>
                <FormField label="Secondary Phone" icon={Phone}><Input type="tel" value={form.secondary_number} onChange={(e) => setForm({ ...form, secondary_number: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit number" /></FormField>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <Link href="/teacher/profile"><Button type="button" variant="secondary">Cancel</Button></Link>
              <Button type="submit" loading={saving} icon={<Save className="w-4 h-4" />}>Save Changes</Button>
            </div>
          </form>
        </Card>
      </Reveal>
    </div>
  )
}
