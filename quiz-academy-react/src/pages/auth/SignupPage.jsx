import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Mail, Lock, User } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { authApi } from '../../api/auth'

function StrengthBar({ password }) {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length
  const labels = ['','Weak','Fair','Good','Strong']
  const colors = ['','#ff6b8a','#F5C842','#6C8EFF','#4DFFC3']
  if (!password) return null
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex gap-1 flex-1">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all"
            style={{ background: i <= score ? colors[score] : 'rgba(255,255,255,0.1)' }} />
        ))}
      </div>
      <span className="text-xs font-medium" style={{ color: colors[score] }}>{labels[score]}</span>
    </div>
  )
}

function InputField({ label, icon: Icon, type = 'text', value, onChange, error, placeholder, autoComplete, rightSlot }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(237,240,250,0.7)' }}>{label}</label>
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(237,240,250,0.3)' }} />}
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete}
          className="w-full pr-4 py-4 rounded-2xl text-base outline-none transition-all"
          style={{
            paddingLeft: Icon ? '2.75rem' : '1rem',
            background: 'rgba(255,255,255,0.05)',
            border: `1.5px solid ${error ? '#ff6b8a' : focused ? '#6C8EFF' : 'rgba(255,255,255,0.1)'}`,
            color: '#EDF0FA', fontSize: 16,
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightSlot && <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightSlot}</div>}
      </div>
      {error && <p className="text-xs mt-1.5" style={{ color: '#ff6b8a' }}>{error}</p>}
    </div>
  )
}

export default function SignupPage() {
  const navigate = useNavigate()
  const { signup, googleLogin, addNotification } = useAuth()
  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)
  const [googleClientId, setGoogleClientId] = useState(null)
  const googleBtnRef = useRef(null)

  useEffect(() => {
    authApi.getConfig().then(d => { if (d?.googleClientId) setGoogleClientId(d.googleClientId) })
  }, [])

  useEffect(() => {
    if (!googleClientId || !window.google || !googleBtnRef.current) return
    window.google.accounts.id.initialize({ client_id: googleClientId, callback: handleGoogleResponse })
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: 'outline', size: 'large', width: googleBtnRef.current.offsetWidth || 360,
      text: 'signup_with', shape: 'pill', logo_alignment: 'left',
    })
  }, [googleClientId])

  async function handleGoogleResponse(res) {
    try {
      const user = await googleLogin(res.credential)
      addNotification(`Welcome to Quiz Academy, ${user.name}! 🎉`, 'success')
      navigate('/dashboard', { replace: true })
    } catch (err) { toast.error(err.message || 'Google sign-up failed') }
  }

  function set(key, val) { setForm(v => ({...v,[key]:val})); setErrors(v => ({...v,[key]:''})) }

  function validate() {
    const e = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return !Object.keys(e).length
  }

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!validate() || loading) return
    setLoading(true)
    try {
      const user = await signup(form.name.trim(), form.email.trim(), form.password)
      addNotification(`Welcome to Quiz Academy, ${user.name}! 🎉`, 'success')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (err.message?.toLowerCase().includes('email')) setErrors(v => ({...v, email: err.message}))
      else setErrors(v => ({...v, confirm: err.message || 'Signup failed'}))
    } finally { setLoading(false) }
  }

  return (
    <div className="dvh-screen relative flex items-center justify-center p-0 md:p-6" style={{ background: '#07090E' }}>
      {/* Background — sibling of the scrollable card below, NOT a descendant
          of it, and the outer box's height is locked to the viewport. That
          combination is the actual fix: these blobs can never stretch or
          drift with a tall form, and they don't scroll with the form either. */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(108,142,255,0.05) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: '#6C8EFF' }} />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-[0.06] pointer-events-none" style={{ background: '#6C8EFF' }} />

      {/* Curved floating card on desktop, matching LoginPage — this is the
          part that scrolls internally if the form is taller than the screen. */}
      <div className="relative w-full h-full flex items-center justify-center overflow-y-auto md:rounded-[36px] md:border"
        style={{ maxWidth: 640, background: 'rgba(7,9,14,0.4)', borderColor: 'rgba(108,142,255,0.15)' }}>

      <motion.div className="relative w-full mx-auto px-6 py-10" style={{ maxWidth: 460 }}
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

        {/* Brand — centered icon badge above heading, matching reference layout */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-3xl flex items-center justify-center font-black text-white text-2xl mb-4"
            style={{ background: 'linear-gradient(135deg,#6C8EFF,#4DFFC3)', boxShadow: '0 8px 24px rgba(108,142,255,0.35)' }}>
            Q
          </div>
          <h1 className="font-display font-black mb-1" style={{ fontSize: '1.75rem', color: '#EDF0FA', letterSpacing: '-0.03em' }}>
            Create account
          </h1>
          <p style={{ color: 'rgba(237,240,250,0.5)' }}>Start your learning adventure today</p>
        </div>

        {/* Google */}
        {googleClientId && (
          <>
            <div ref={googleBtnRef} className="w-full mb-4 overflow-hidden rounded-2xl" />
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <span className="text-sm" style={{ color: 'rgba(237,240,250,0.3)' }}>or with email</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>
          </>
        )}

        <div className="flex flex-col gap-4">
          <InputField label="Full Name" icon={User} value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="John Doe" error={errors.name} autoComplete="name" />
          <InputField label="Email" icon={Mail} type="email" value={form.email} onChange={e => set('email', e.target.value)}
            placeholder="your@email.com" error={errors.email} autoComplete="email" />
          <div>
            <InputField label="Password" icon={Lock} type={showPw ? 'text' : 'password'}
              value={form.password} onChange={e => set('password', e.target.value)}
              placeholder="Min. 8 characters" error={errors.password} autoComplete="new-password"
              rightSlot={
                <button type="button" onClick={() => setShowPw(v => !v)} style={{ color: 'rgba(237,240,250,0.4)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <StrengthBar password={form.password} />
          </div>
          <InputField label="Confirm Password" icon={Lock} type="password"
            value={form.confirm} onChange={e => set('confirm', e.target.value)}
            placeholder="Repeat password" error={errors.confirm} autoComplete="new-password" />

          <motion.button onClick={handleSubmit} disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 mt-2"
            style={{ background: loading ? 'rgba(108,142,255,0.5)' : 'linear-gradient(135deg,#6C8EFF,#4DFFC3)', fontSize: 16 }}
            whileTap={{ scale: 0.98 }}>
            {loading
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <>Create Account <ArrowRight size={18} /></>
            }
          </motion.button>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: 'rgba(237,240,250,0.4)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold" style={{ color: '#6C8EFF' }}>Sign in</Link>
        </p>
      </motion.div>
      </div>
      {/* close curved card wrapper */}
    </div>
  )
}
