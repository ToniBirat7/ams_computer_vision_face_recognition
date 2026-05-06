'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { login } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [usernameFocused, setUsernameFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password')
      return
    }
    setLoading(true)
    try {
      const role = await login(username, password)
      if (role === 'admin') {
        router.push('/admin')
      } else if (role === 'teacher') {
        router.push('/teacher')
      } else {
        toast.error('Invalid credentials. Please try again.')
      }
    } catch {
      toast.error('Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .wave {
          position: absolute;
          border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          animation: wave-animation 8s ease-in-out infinite;
          opacity: 0.15;
        }
        .wave-1 {
          width: 400px; height: 400px;
          background: linear-gradient(135deg, #003b5c, #00a4bd);
          top: -100px; left: -100px;
          animation-duration: 8s;
        }
        .wave-2 {
          width: 300px; height: 300px;
          background: linear-gradient(135deg, #00a4bd, #003b5c);
          bottom: 100px; right: 50px;
          animation-duration: 10s;
          animation-direction: reverse;
        }
        .wave-3 {
          width: 200px; height: 200px;
          background: linear-gradient(135deg, #e31837, #003b5c);
          top: 50%; right: -50px;
          animation-duration: 6s;
        }
        .float-anim {
          animation: float 3s ease-in-out infinite;
        }
        .login-card {
          animation: scaleIn 0.5s ease;
        }
        .submit-btn .arrow-icon {
          transition: transform 0.3s ease;
        }
        .submit-btn:hover .arrow-icon {
          transform: translateX(4px);
        }
        .custom-checkbox {
          width: 18px; height: 18px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          background: white;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease;
          cursor: pointer;
          flex-shrink: 0;
        }
        .custom-checkbox.checked {
          background: #003b5c;
          border-color: #003b5c;
        }
        .floating-label {
          position: absolute;
          left: 38px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          font-size: 14px;
          pointer-events: none;
          transition: all 0.2s ease;
        }
        .floating-label.active {
          top: 8px;
          transform: translateY(0);
          font-size: 11px;
          color: #003b5c;
          font-weight: 500;
        }
      `}</style>

      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden font-poppins"
        style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e8f4f8 50%, #f0f9ff 100%)' }}
      >
        {/* Animated background waves */}
        <div className="wave wave-1" />
        <div className="wave wave-2" />
        <div className="wave wave-3" />

        <div className="relative z-10 flex flex-col lg:flex-row gap-8 lg:gap-16 items-center justify-center px-4 w-full max-w-5xl mx-auto">

          {/* Left branding section */}
          <div className="float-anim hidden lg:flex flex-col items-center justify-center text-center">
            <div
              className="rounded-[20px] p-10 flex flex-col items-center justify-center gap-6 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #003b5c, #004b74)', minWidth: 280 }}
            >
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-3xl font-bold text-white tracking-widest">BCU</span>
              </div>
              <div>
                <h1 className="text-white text-xl font-bold leading-snug">
                  Birmingham City<br />University
                </h1>
                <p className="text-white/70 text-sm mt-1">Kathmandu</p>
              </div>
              <div className="border-t border-white/20 pt-4 w-full text-center">
                <p className="text-white/60 text-xs">Attendance Management System</p>
              </div>
            </div>
          </div>

          {/* Login card */}
          <div
            className="login-card w-full max-w-[420px] rounded-[20px] p-8 lg:p-10"
            style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 20px 60px rgba(0,59,92,0.15)',
            }}
          >
            {/* Mobile branding */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #003b5c, #00a4bd)' }}
              >
                <span className="text-white text-xs font-bold">BCU</span>
              </div>
              <div>
                <p className="font-bold text-[#003b5c] text-sm leading-none">BCU Kathmandu</p>
                <p className="text-gray-400 text-xs">AMS Portal</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[#2d3748] mb-1">Welcome Back</h2>
            <p className="text-[#4a5568] text-sm mb-8">Sign in to your account to continue</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Username field */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                  <i className="bx bx-user text-lg" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setUsernameFocused(true)}
                  onBlur={() => setUsernameFocused(false)}
                  className="w-full pt-5 pb-2 px-10 border border-gray-200 rounded-input text-sm text-[#2d3748] outline-none focus:border-[#00a4bd] transition-colors bg-white"
                  style={{ borderColor: usernameFocused ? '#00a4bd' : undefined }}
                  autoComplete="username"
                />
                <label className={`floating-label ${usernameFocused || username ? 'active' : ''}`}>
                  Username
                </label>
              </div>

              {/* Password field */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                  <i className="bx bx-lock-alt text-lg" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className="w-full pt-5 pb-2 px-10 border border-gray-200 rounded-input text-sm text-[#2d3748] outline-none focus:border-[#00a4bd] transition-colors bg-white"
                  style={{ borderColor: passwordFocused ? '#00a4bd' : undefined }}
                  autoComplete="current-password"
                />
                <label className={`floating-label ${passwordFocused || password ? 'active' : ''}`}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#003b5c] transition-colors z-10"
                  tabIndex={-1}
                >
                  <i className={`bx ${showPassword ? 'bx-hide' : 'bx-show'} text-lg`} />
                </button>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setRememberMe((v) => !v)}>
                <div className={`custom-checkbox ${rememberMe ? 'checked' : ''}`}>
                  {rememberMe && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-[#4a5568]">Remember me</span>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="submit-btn relative w-full py-3.5 rounded-input text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                style={{ background: 'linear-gradient(135deg, #003b5c, #00a4bd)' }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <i className="bx bx-right-arrow-alt text-lg arrow-icon" />
                  </>
                )}
              </button>
            </form>

            {/* Footer info */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                BCU AMS &copy; {new Date().getFullYear()} &bull; Birmingham City University Kathmandu
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
