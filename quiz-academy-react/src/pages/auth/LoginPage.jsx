import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { authApi } from '../../api/auth'
import { SamsungConfirm } from '../../components/ui/SamsungPopup'

const QUOTES = [
  { text: 'An investment in knowledge pays the best interest.', author: 'Benjamin Franklin' },
  { text: 'The more that you read, the more things you will know.', author: 'Dr. Seuss' },
  { text: 'Education is the passport to the future.', author: 'Malcolm X' },
]

export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login, googleLogin, addNotification } = useAuth()
  const from = location.state?.from?.pathname || '/dashboard'

  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [showPw,     setShowPw]     = useState(false)
  const [remember,   setRemember]   = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [errors,     setErrors]     = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [googleClientId, setGoogleClientId] = useState(null)
  const googleBtnRef = useRef(null)
  const quote = QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length]

  useEffect(() => {
    authApi.getConfig().then(d => { if (d?.googleClientId) setGoogleClientId(d.googleClientId) })
  }, [])

  useEffect(() => {
    if (!googleClientId || !window.google || !googleBtnRef.current) return
    window.google.accounts.id.initialize({ client_id: googleClientId, callback: handleGoogleResponse })
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: 'outline', size: 'large', width: googleBtnRef.current.offsetWidth || 360,
      text: 'continue_with', shape: 'pill', logo_alignment: 'left',
    })
  }, [googleClientId])

  async function handleGoogleResponse(res) {
    try {
      const user = await googleLogin(res.credential)
      addNotification(`Welcome back, ${user.name}! 👋`, 'login')
      navigate(from, { replace: true })
    } catch (err) { toast.error(err.message || 'Google sign-in failed') }
  }

  function validate() {
    const e = {}
    if (!email.trim())    e.email    = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email'
    if (!password)        e.password = 'Password is required'
    else if (password.length < 6) e.password = 'Password must be at least 6 characters'
    setErrors(e)
    return !Object.keys(e).length
  }

  async function doLogin() {
    setLoading(true)
    setConfirmOpen(false)
    try {
      const user = await login(email, password, remember)
      addNotification(`Welcome back, ${user.name}! 👋`, 'login')
      navigate(from, { replace: true })
    } catch (err) {
      setErrors({ password: err.message || 'Invalid email or password' })
    } finally { setLoading(false) }
  }

  function handleSubmit(e) {
    e?.preventDefault()
    if (!validate() || loading) return
    setConfirmOpen(true)
  }

  return (
    <div className="dvh-screen flex items-center justify-center p-0 md:p-6" style={{ background: '#07090E' }}>
      {/* Curved floating auth card on desktop — flush edge-to-edge on mobile.
          Height is locked to the viewport so the two columns below never grow
          past it; each column scrolls independently instead. */}
      <div className="flex w-full h-full md:rounded-[36px] overflow-hidden md:border"
        style={{ maxWidth: 1180, borderColor: 'rgba(108,142,255,0.15)' }}>

      {/* ── Left panel — hidden on mobile ── */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden"
        style={{ width: '46%', flexShrink: 0, background: 'linear-gradient(160deg,#0C1018,#0a0f1a)' }}>
        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(108,142,255,0.07) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        {/* Glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: '#6C8EFF' }} />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: '#4DFFC3' }} />
        {/* Right border */}
        <div className="absolute right-0 top-0 bottom-0 w-px"
          style={{ background: 'linear-gradient(180deg,transparent,rgba(108,142,255,0.3) 30%,rgba(108,142,255,0.3) 70%,transparent)' }} />

        {/* Brand */}
        <div className="relative flex items-center gap-3 p-10">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-lg"
            style={{ background: 'linear-gradient(135deg,#6C8EFF,#4DFFC3)' }}>Q</div>
          <div>
            <div className="font-bold text-base" style={{ color: '#EDF0FA' }}>Quiz Academy</div>
            <div className="text-xs" style={{ color: 'rgba(237,240,250,0.4)' }}>Learn. Level up. Lead.</div>
          </div>
        </div>

        {/* Illustration */}
        <div className="relative flex flex-col items-center justify-center flex-1 px-10 gap-5">
          <motion.div className="w-full max-w-xs"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="rounded-2xl p-5 mb-4"
              style={{ background: 'rgba(7,9,14,0.9)', border: '1px solid rgba(108,142,255,0.2)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(108,142,255,0.1)', border: '1px solid rgba(108,142,255,0.2)' }}>🎯</div>
                <div>
                  <div className="font-bold text-sm" style={{ color: '#EDF0FA' }}>Daily Challenge</div>
                  <div className="text-xs" style={{ color: 'rgba(237,240,250,0.4)' }}>5 fresh questions every day</div>
                </div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#6C8EFF,#4DFFC3)' }}
                  initial={{ width: 0 }} animate={{ width: '70%' }} transition={{ delay: 0.9, duration: 1.2 }} />
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'rgba(237,240,250,0.4)' }}>3/5 correct</span>
                <span style={{ color: '#4DFFC3', fontWeight: 600 }}>+150 XP</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {[['🔥','12','day streak'],['⭐','85%','avg score'],['🏆','#4','this week']].map(([e,v,s]) => (
                <div key={s} className="rounded-xl p-3 text-center"
                  style={{ background: 'rgba(7,9,14,0.8)', border: '1px solid rgba(108,142,255,0.12)' }}>
                  <div className="text-xl mb-1">{e}</div>
                  <div className="font-black text-sm" style={{ color: '#EDF0FA' }}>{v}</div>
                  <div style={{ color: 'rgba(237,240,250,0.35)', fontSize: 11 }}>{s}</div>
                </div>
              ))}
            </div>
            <motion.div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#4DFFC3,#6C8EFF)', color: '#07090E' }}
              animate={{ y: [0,-5,0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
              🎉 +250 XP earned this week
            </motion.div>
          </motion.div>
        </div>

        {/* Quote */}
        <div className="relative p-10">
          <div className="rounded-2xl p-5" style={{ background: 'rgba(7,9,14,0.8)', border: '1px solid rgba(108,142,255,0.15)', borderLeft: '3px solid #6C8EFF' }}>
            <p className="text-sm italic leading-relaxed mb-2" style={{ color: 'rgba(237,240,250,0.7)' }}>"{quote.text}"</p>
            <p className="text-xs" style={{ color: 'rgba(237,240,250,0.35)' }}>— {quote.author}</p>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(108,142,255,0.04) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="h-full flex items-center justify-center overflow-y-auto relative px-6 py-12">

        <motion.div className="relative w-full" style={{ maxWidth: 420 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white"
              style={{ background: 'linear-gradient(135deg,#6C8EFF,#4DFFC3)', fontSize: 16 }}>Q</div>
            <span className="font-bold text-lg" style={{ color: '#EDF0FA' }}>Quiz Academy</span>
          </div>

          <h1 className="font-display font-black mb-1" style={{ fontSize: '2rem', color: '#EDF0FA', letterSpacing: '-0.03em' }}>
            Welcome back
          </h1>
          <p className="mb-8" style={{ color: 'rgba(237,240,250,0.5)', fontSize: '1rem' }}>
            Continue your learning journey
          </p>

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

          {/* Form */}
          <div className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(237,240,250,0.7)' }}>Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(237,240,250,0.3)' }} />
                <input
                  type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(v => ({...v,email:''})) }}
                  placeholder="your@email.com" autoComplete="email"
                  className="w-full pl-11 pr-4 py-4 rounded-2xl text-base outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: `1.5px solid ${errors.email ? '#ff6b8a' : 'rgba(255,255,255,0.1)'}`,
                    color: '#EDF0FA', fontSize: 16,
                  }}
                  onFocus={e => e.target.style.borderColor = '#6C8EFF'}
                  onBlur={e => e.target.style.borderColor = errors.email ? '#ff6b8a' : 'rgba(255,255,255,0.1)'}
                />
              </div>
              {errors.email && <p className="text-xs mt-1.5" style={{ color: '#ff6b8a' }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium" style={{ color: 'rgba(237,240,250,0.7)' }}>Password</label>
                <Link to="/forgot-password" className="text-sm" style={{ color: '#6C8EFF' }}>Forgot?</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(237,240,250,0.3)' }} />
                <input
                  type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(v => ({...v,password:''})) }}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="••••••••" autoComplete="current-password"
                  className="w-full pl-11 pr-12 py-4 rounded-2xl text-base outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: `1.5px solid ${errors.password ? '#ff6b8a' : 'rgba(255,255,255,0.1)'}`,
                    color: '#EDF0FA', fontSize: 16,
                  }}
                  onFocus={e => e.target.style.borderColor = '#6C8EFF'}
                  onBlur={e => e.target.style.borderColor = errors.password ? '#ff6b8a' : 'rgba(255,255,255,0.1)'}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(237,240,250,0.4)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1.5" style={{ color: '#ff6b8a' }}>{errors.password}</p>}
            </div>

            {/* Remember */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${remember ? '' : 'border'}`}
                style={{ background: remember ? '#6C8EFF' : 'transparent', borderColor: 'rgba(255,255,255,0.15)' }}
                onClick={() => setRemember(v => !v)}>
                {remember && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
              </div>
              <span className="text-sm" style={{ color: 'rgba(237,240,250,0.6)' }}>Remember me</span>
            </label>

            {/* Submit */}
            <motion.button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 transition-all mt-2"
              style={{ background: loading ? 'rgba(108,142,255,0.5)' : 'linear-gradient(135deg,#6C8EFF,#4DFFC3)', fontSize: 16 }}
              whileTap={{ scale: 0.98 }}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </motion.button>
          </div>

          <p className="text-center text-sm mt-6" style={{ color: 'rgba(237,240,250,0.4)' }}>
            No account?{' '}
            <Link to="/signup" className="font-semibold" style={{ color: '#6C8EFF' }}>Create one free</Link>
          </p>
        </motion.div>
        </div>
      </div>
      {/* close curved card wrapper */}
      </div>

      {/* Confirm popup */}
      <SamsungConfirm
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doLogin}
        title="Sign in?"
        message={`Log in as ${email}?`}
        icon="🔑"
        confirmLabel="Yes, Sign In"
        cancelLabel="Cancel"
        danger={false}
      />
    </div>
  )
}
