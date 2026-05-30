'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  User, Lock, Eye, EyeOff, ArrowRight, ScanFace,
  BarChart3, ShieldCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { login } from '@/lib/api'
import { Monogram, ThemeToggle, Eyebrow } from '@/components/ui'

const features = [
  { icon: ScanFace,    title: 'AI Face Recognition', desc: 'Auto-mark attendance from live video' },
  { icon: BarChart3,   title: 'Analytics & Reports', desc: 'Excel exports and grade prediction' },
  { icon: ShieldCheck, title: 'Role-based Access',   desc: 'Separate admin and teacher portals' },
]

// Gold-numeral stat row — the BCU navy+gold signal.
const stats = [
  { value: '99%',  label: 'Match accuracy' },
  { value: '2',    label: 'Capture modes' },
  { value: '<1s',  label: 'Live detection' },
]

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password')
      return
    }
    setLoading(true)
    try {
      const role = await login(username, password)
      if (role === 'admin') router.push('/admin')
      else if (role === 'teacher') router.push('/teacher')
      else toast.error('Invalid credentials. Please try again.')
    } catch {
      toast.error('Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-bg">
      {/* ── Left brand panel — deep navy, editorial ─────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[46%] p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(155deg, #002a52 0%, #001e3c 55%, #001226 100%)' }}
      >
        {/* faint dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px)', backgroundSize: '26px 26px' }}
        />
        {/* gold glow, bottom-right */}
        <div
          className="absolute -bottom-32 -right-24 w-[460px] h-[460px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(200,169,110,.18), transparent 70%)' }}
        />
        {/* cyan glow, top-left */}
        <div
          className="absolute -top-28 -left-24 w-[360px] h-[360px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,181,226,.12), transparent 70%)' }}
        />

        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative flex items-center gap-3"
        >
          <Monogram className="w-12 h-12 text-sm rounded-2xl" />
          <div>
            <p className="text-white font-bold leading-none">Birmingham City University</p>
            <p className="text-white/45 text-sm mt-1">Kathmandu Campus</p>
          </div>
        </motion.div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Eyebrow className="mb-5">Attendance Management System</Eyebrow>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}
            className="text-white text-[clamp(40px,4.4vw,56px)] font-extrabold leading-[1.02] tracking-tight"
          >
            Smart attendance,<br />
            <span style={{ color: 'var(--gold)' }}>zero friction.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.24 }}
            className="text-white/55 text-[15px] leading-relaxed max-w-sm mt-5 mb-8"
          >
            Automate classroom attendance with face recognition, real-time dashboards, and instant reporting.
          </motion.p>

          {/* gold-numeral stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-3 gap-5 max-w-sm py-6 mb-8 border-y border-white/10"
          >
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-[30px] font-extrabold leading-none" style={{ color: 'var(--gold)' }}>{s.value}</p>
                <p className="text-white/45 text-[11px] mt-2 leading-tight">{s.label}</p>
              </div>
            ))}
          </motion.div>

          <div className="space-y-3">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.38 + i * 0.08 }}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--gold-soft)' }}>
                    <Icon className="w-5 h-5" style={{ color: 'var(--gold)' }} />
                  </div>
                  <div>
                    <p className="text-white/90 text-sm font-semibold">{f.title}</p>
                    <p className="text-white/40 text-xs">{f.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        <p className="relative text-white/25 text-xs">BCU AMS © {new Date().getFullYear()} · Birmingham City University Kathmandu</p>
      </div>

      {/* ── Right form panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute top-5 right-5"><ThemeToggle /></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Monogram className="w-10 h-10 text-[11px]" />
            <div>
              <p className="text-fg font-bold text-sm leading-none">BCU AMS</p>
              <p className="text-muted text-xs mt-0.5">Kathmandu Campus</p>
            </div>
          </div>

          <div className="w-12 h-1 rounded-full mb-5" style={{ background: 'linear-gradient(90deg, var(--gold), var(--gold-strong))' }} />
          <Eyebrow className="mb-2.5">Secure Portal</Eyebrow>
          <h2 className="text-[32px] font-extrabold text-fg tracking-tight leading-none">Welcome back</h2>
          <p className="text-muted text-sm mt-2.5 mb-8">Sign in to access your dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[12px] font-semibold text-fg-soft uppercase tracking-wide mb-1.5 block">Username</label>
              <div className="relative">
                <User className="w-[18px] h-[18px] text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username" placeholder="Enter your username"
                  className="w-full h-12 pl-11 pr-4 text-sm text-fg bg-surface-2 border border-border rounded-input outline-none placeholder:text-muted transition-all focus:bg-surface focus:border-accent focus:shadow-[0_0_0_3px_var(--ring)]"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-fg-soft uppercase tracking-wide mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="w-[18px] h-[18px] text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password" placeholder="Enter your password"
                  className="w-full h-12 pl-11 pr-11 text-sm text-fg bg-surface-2 border border-border rounded-input outline-none placeholder:text-muted transition-all focus:bg-surface focus:border-accent focus:shadow-[0_0_0_3px_var(--ring)]"
                />
                <button
                  type="button" onClick={() => setShowPass((v) => !v)} tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-fg transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit" disabled={loading}
              whileHover={{ y: -1 }} whileTap={{ y: 0, scale: 0.99 }}
              className="w-full h-12 rounded-input font-semibold text-sm flex items-center justify-center gap-2 transition-shadow hover:shadow-lg disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-strong))', color: 'var(--gold-fg)' }}
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-[color:var(--gold-fg)]/30 border-t-[color:var(--gold-fg)] rounded-full animate-spin" /> Signing in…</>
              ) : (
                <>Sign In <ArrowRight className="w-[18px] h-[18px]" /></>
              )}
            </motion.button>
          </form>

          <p className="text-center text-xs text-muted mt-8 pt-6 border-t border-border">
            Birmingham City University Kathmandu
          </p>
        </motion.div>
      </div>
    </div>
  )
}
