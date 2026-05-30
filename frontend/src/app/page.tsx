'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { login } from '@/lib/api'

const NAVY  = '#003b5c'
const TEAL  = '#00a4bd'
const RED   = '#e31837'
const WHITE = '#ffffff'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userFocus, setUserFocus]  = useState(false)
  const [passFocus, setPassFocus]  = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password')
      return
    }
    setLoading(true)
    try {
      const role = await login(username, password)
      if (role === 'admin')        router.push('/admin')
      else if (role === 'teacher') router.push('/teacher')
      else                         toast.error('Invalid credentials. Please try again.')
    } catch {
      toast.error('Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        @import url('https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          font-family: 'Poppins', sans-serif;
          min-height: 100vh;
          display: flex;
          background: #f8fafc;
        }

        /* ── Left panel ─────────────────────────────── */
        .left-panel {
          width: 45%;
          min-height: 100vh;
          background: ${NAVY};
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 56px;
        }
        @media (max-width: 900px) { .left-panel { display: none; } }

        /* dot-grid texture */
        .left-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(0,164,189,.18) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        /* large accent circle */
        .left-panel::after {
          content: '';
          position: absolute;
          width: 520px; height: 520px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,164,189,.14) 0%, transparent 70%);
          bottom: -120px; right: -100px;
          pointer-events: none;
        }

        .lp-logo {
          display: flex;
          align-items: center;
          gap: 14px;
          position: relative;
          z-index: 1;
          animation: fadeUp .6s ease both;
        }
        .lp-monogram {
          width: 52px; height: 52px;
          border-radius: 14px;
          border: 1.5px solid rgba(255,255,255,.2);
          background: rgba(255,255,255,.07);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 700; color: ${WHITE};
          letter-spacing: 1px;
          backdrop-filter: blur(8px);
        }
        .lp-logo-text p:first-child {
          font-size: 13px; font-weight: 600; color: ${WHITE}; line-height: 1.2;
        }
        .lp-logo-text p:last-child {
          font-size: 11px; color: rgba(255,255,255,.45); margin-top: 2px;
        }

        .lp-center { position: relative; z-index: 1; }

        .lp-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(0,164,189,.18);
          border: 1px solid rgba(0,164,189,.3);
          border-radius: 100px;
          padding: 5px 14px;
          margin-bottom: 28px;
          animation: fadeUp .6s .1s ease both;
        }
        .lp-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${TEAL};
          box-shadow: 0 0 6px ${TEAL};
        }
        .lp-badge span {
          font-size: 11px; font-weight: 500; color: ${TEAL}; letter-spacing: .5px;
        }

        .lp-headline {
          font-size: 42px;
          font-weight: 800;
          color: ${WHITE};
          line-height: 1.12;
          letter-spacing: -1px;
          margin-bottom: 18px;
          animation: fadeUp .6s .18s ease both;
        }
        .lp-headline em {
          font-style: normal;
          background: linear-gradient(90deg, ${TEAL}, #4dd8f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .lp-sub {
          font-size: 14px;
          color: rgba(255,255,255,.5);
          line-height: 1.7;
          max-width: 320px;
          margin-bottom: 48px;
          font-weight: 300;
          animation: fadeUp .6s .24s ease both;
        }

        .lp-features { display: flex; flex-direction: column; gap: 16px; animation: fadeUp .6s .3s ease both; }

        .lp-feature {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 12px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.07);
          transition: background .2s;
        }
        .lp-feature:hover { background: rgba(255,255,255,.07); }

        .lp-feature-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(0,164,189,.2);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .lp-feature-icon i { font-size: 18px; color: ${TEAL}; }
        .lp-feature-text p:first-child {
          font-size: 13px; font-weight: 600; color: rgba(255,255,255,.9);
        }
        .lp-feature-text p:last-child {
          font-size: 11px; color: rgba(255,255,255,.35); margin-top: 1px;
        }

        .lp-footer {
          position: relative; z-index: 1;
          display: flex; align-items: center; gap: 16px;
          animation: fadeUp .6s .36s ease both;
        }
        .lp-divider { flex: 1; height: 1px; background: rgba(255,255,255,.1); }
        .lp-footer-text { font-size: 11px; color: rgba(255,255,255,.25); white-space: nowrap; }

        /* ── Right panel ─────────────────────────────── */
        .right-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 32px;
          background: ${WHITE};
        }

        .form-box {
          width: 100%;
          max-width: 400px;
          animation: fadeUp .5s .1s ease both;
        }

        /* mobile brand */
        .mobile-brand {
          display: none;
          align-items: center;
          gap: 10px;
          margin-bottom: 36px;
        }
        @media (max-width: 900px) { .mobile-brand { display: flex; } }
        .mobile-mono {
          width: 40px; height: 40px; border-radius: 10px;
          background: linear-gradient(135deg, ${NAVY}, ${TEAL});
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: ${WHITE}; letter-spacing: 1px;
        }
        .mobile-brand-text p:first-child { font-size: 14px; font-weight: 700; color: ${NAVY}; }
        .mobile-brand-text p:last-child  { font-size: 11px; color: #94a3b8; }

        .form-eyebrow {
          font-size: 11px; font-weight: 600; letter-spacing: 2px;
          color: ${TEAL}; text-transform: uppercase; margin-bottom: 10px;
        }
        .form-title {
          font-size: 32px; font-weight: 800; color: #0f172a;
          letter-spacing: -1px; line-height: 1.1; margin-bottom: 8px;
        }
        .form-sub { font-size: 13px; color: #64748b; margin-bottom: 40px; font-weight: 400; }

        .field-group { display: flex; flex-direction: column; gap: 24px; }

        .field { display: flex; flex-direction: column; gap: 8px; }
        .field label {
          font-size: 11.5px; font-weight: 600; letter-spacing: .8px;
          color: #374151; text-transform: uppercase;
        }

        .input-wrap { position: relative; }
        .input-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          font-size: 18px; color: #94a3b8; pointer-events: none;
          transition: color .2s;
        }
        .input-focused .input-icon { color: ${TEAL}; }

        .field-input {
          width: 100%;
          padding: 14px 14px 14px 44px;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          color: #0f172a;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          outline: none;
          transition: border-color .2s, background .2s, box-shadow .2s;
          -webkit-appearance: none;
        }
        .field-input::placeholder { color: #cbd5e1; }
        .field-input:focus {
          border-color: ${TEAL};
          background: ${WHITE};
          box-shadow: 0 0 0 4px rgba(0,164,189,.1);
        }

        .eye-btn {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          font-size: 18px; color: #94a3b8; padding: 0;
          transition: color .2s;
          display: flex; align-items: center;
        }
        .eye-btn:hover { color: ${NAVY}; }

        .submit-btn {
          width: 100%;
          margin-top: 8px;
          padding: 15px 24px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, ${NAVY} 0%, #004d7a 50%, ${TEAL} 100%);
          background-size: 200% 200%;
          background-position: 0% 50%;
          color: ${WHITE};
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: .3px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: box-shadow .2s, transform .15s, background-position .4s;
        }
        .submit-btn:hover:not(:disabled) {
          box-shadow: 0 8px 24px rgba(0,59,92,.35);
          transform: translateY(-1px);
          background-position: 100% 50%;
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: .65; cursor: not-allowed; }
        .submit-btn i { font-size: 20px; }

        .spin {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: ${WHITE};
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }

        .form-footer {
          margin-top: 36px;
          padding-top: 24px;
          border-top: 1px solid #f1f5f9;
          text-align: center;
        }
        .form-footer p { font-size: 11.5px; color: #94a3b8; }

        /* ── Accents ─────────────────────────────────── */
        .accent-bar {
          width: 48px; height: 4px; border-radius: 2px;
          background: linear-gradient(90deg, ${RED}, ${TEAL});
          margin-bottom: 20px;
        }

        /* ── Animations ─────────────────────────────── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="login-root">

        {/* ── Left branded panel ── */}
        <div className="left-panel">

          {/* Logo */}
          <div className="lp-logo">
            <div className="lp-monogram">BCU</div>
            <div className="lp-logo-text">
              <p>Birmingham City University</p>
              <p>Kathmandu Campus</p>
            </div>
          </div>

          {/* Center hero */}
          <div className="lp-center">
            <div className="lp-badge">
              <div className="lp-badge-dot" />
              <span>v2.0 — Now with Face Recognition</span>
            </div>

            <h1 className="lp-headline">
              Smart<br />
              <em>Attendance</em><br />
              Platform
            </h1>

            <p className="lp-sub">
              Automate classroom attendance with AI face recognition, real-time dashboards, and Excel reporting — built for BCU Kathmandu.
            </p>

            <div className="lp-features">
              {[
                {
                  icon: 'bx-face',
                  title: 'AI Face Recognition',
                  desc:  'Auto-mark attendance via live webcam',
                },
                {
                  icon: 'bx-bar-chart-alt-2',
                  title: 'Analytics & Reports',
                  desc:  'Download Excel reports, predict grade outcomes',
                },
                {
                  icon: 'bx-shield-quarter',
                  title: 'Role-based Access',
                  desc:  'Separate dashboards for Admin & Teachers',
                },
              ].map((f) => (
                <div className="lp-feature" key={f.icon}>
                  <div className="lp-feature-icon">
                    <i className={`bx ${f.icon}`} />
                  </div>
                  <div className="lp-feature-text">
                    <p>{f.title}</p>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="lp-footer">
            <div className="lp-divider" />
            <p className="lp-footer-text">BCU AMS &copy; {new Date().getFullYear()}</p>
            <div className="lp-divider" />
          </div>
        </div>

        {/* ── Right login panel ── */}
        <div className="right-panel">
          <div className="form-box">

            {/* Mobile brand */}
            <div className="mobile-brand">
              <div className="mobile-mono">BCU</div>
              <div className="mobile-brand-text">
                <p>BCU Kathmandu</p>
                <p>AMS Portal</p>
              </div>
            </div>

            <div className="accent-bar" />
            <p className="form-eyebrow">Secure Portal</p>
            <h2 className="form-title">Welcome<br />back</h2>
            <p className="form-sub">Sign in to access your dashboard</p>

            <form onSubmit={handleSubmit}>
              <div className="field-group">

                {/* Username */}
                <div className="field">
                  <label htmlFor="username">Username</label>
                  <div className={`input-wrap ${userFocus ? 'input-focused' : ''}`}>
                    <i className="bx bx-user input-icon" />
                    <input
                      id="username"
                      type="text"
                      className="field-input"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onFocus={() => setUserFocus(true)}
                      onBlur={() => setUserFocus(false)}
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="field">
                  <label htmlFor="password">Password</label>
                  <div className={`input-wrap ${passFocus ? 'input-focused' : ''}`}>
                    <i className="bx bx-lock-alt input-icon" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="field-input"
                      style={{ paddingRight: '48px' }}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPassFocus(true)}
                      onBlur={() => setPassFocus(false)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <i className={`bx ${showPassword ? 'bx-hide' : 'bx-show'}`} />
                    </button>
                  </div>
                </div>

              </div>

              {/* Submit */}
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <i className="bx bx-right-arrow-alt" />
                  </>
                )}
              </button>
            </form>

            <div className="form-footer">
              <p>BCU AMS &bull; Birmingham City University Kathmandu</p>
            </div>

          </div>
        </div>

      </div>
    </>
  )
}
