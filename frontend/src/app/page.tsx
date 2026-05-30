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
import { Monogram, ThemeToggle } from '@/components/ui'

const features = [
  { icon: ScanFace,    title: 'AI Face Recognition', desc: 'Auto-mark attendance from live video' },
  { icon: BarChart3,   title: 'Analytics & Reports', desc: 'Excel exports and grade prediction' },
  { icon: ShieldCheck, title: 'Role-based Access',   desc: 'Separate admin and teacher portals' },
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
      {/* Left brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[46%] p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, var(--sidebar-bg-2), var(--sidebar-bg))' }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-70"
          style={{ backgroundImage: 'radial-gradient(rgba(0,164,189,.14) 1px, transparent 1px)', backgroundSize: '26px 26px' }}
        />
        <div
          className="absolute -bottom-32 -right-24 w-[460px] h-[460px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,164,189,.18), transparent 70%)' }}
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
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-7"
            style={{ background: 'rgba(0,164,189,.16)', border: '1px solid rgba(0,164,189,.3)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
            <span className="text-accent text-xs font-medium tracking-wide">Attendance Management System</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}
            className="text-white text-[42px] font-extrabold leading-[1.1] tracking-tight"
          >
            Smart attendance,<br />
            <span style={{ background: 'linear-gradient(90deg, var(--accent), #5fe0f4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              zero friction.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.24 }}
            className="text-white/50 text-[15px] leading-relaxed max-w-sm mt-4 mb-9"
          >
            Automate classroom attendance with face recognition, real-time dashboards, and instant reporting.
          </motion.p>

          <div className="space-y-3">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,164,189,.18)' }}>
                    <Icon className="w-5 h-5 text-accent" />
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

      {/* Right form panel */}
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

          <div className="w-12 h-1 rounded-full mb-5" style={{ background: 'linear-gradient(90deg, var(--danger), var(--accent))' }} />
          <p className="text-accent text-xs font-bold tracking-[2px] uppercase mb-2">Secure Portal</p>
          <h2 className="text-[32px] font-extrabold text-fg tracking-tight leading-none">Welcome back</h2>
          <p className="text-muted text-sm mt-2 mb-8">Sign in to access your dashboard</p>

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
              className="w-full h-12 rounded-input text-white font-semibold text-sm flex items-center justify-center gap-2 transition-shadow hover:shadow-lg disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))' }}
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in…</>
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
