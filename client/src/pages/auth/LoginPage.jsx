import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import AuthShell from '../../components/auth/AuthShell'
import FormField from '../../components/auth/FormField'
import Button from '../../components/ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { authApi } from '../../api/auth'

const QUOTE = {
  text:   'An investment in knowledge pays the best interest.',
  author: 'Benjamin Franklin',
}

export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login, googleLogin, addNotification } = useAuth()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [errors,   setErrors]   = useState({})
  const [googleClientId, setGoogleClientId] = useState(null)
  const googleBtnRef = useRef(null)

  const from = location.state?.from?.pathname || '/dashboard'

  // Fetch Google Client ID and render button
  useEffect(() => {
    authApi.getConfig().then(data => {
      if (data?.googleClientId) setGoogleClientId(data.googleClientId)
    })
  }, [])

  useEffect(() => {
    if (!googleClientId || !window.google || !googleBtnRef.current) return
    window.google.accounts.id.initialize({
      client_id:  googleClientId,
      callback:   handleGoogleResponse,
      auto_select: false,
    })
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme:          'outline',
      size:           'large',
      width:          googleBtnRef.current.offsetWidth || 380,
      text:           'continue_with',
      shape:          'rectangular',
      logo_alignment: 'left',
    })
  }, [googleClientId])

  async function handleGoogleResponse(response) {
    try {
      const user = await googleLogin(response.credential)
      addNotification(`Welcome back, ${user.name}! 👋`, 'login')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed')
    }
  }

  function validate() {
    const e = {}
    if (!email.trim())         e.email    = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email'
    if (!password)             e.password = 'Password is required'
    else if (password.length < 8) e.password = 'Password must be at least 8 characters'
    setErrors(e)
    return !Object.keys(e).length
  }

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!validate() || loading) return
    setLoading(true)
    try {
      const user = await login(email, password, remember)
      addNotification(`Welcome back, ${user.name}! 👋`, 'login')
      navigate(from, { replace: true })
    } catch (err) {
      setErrors({ password: err.message || 'Invalid email or password' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell quote={QUOTE}>
      <div>
        <h1 className="font-display font-bold text-2xl text-primary mb-1">Welcome back!</h1>
        <p className="text-secondary text-sm mb-7">Continue your learning journey</p>

        {/* Google button */}
        {googleClientId && (
          <>
            <div ref={googleBtnRef} className="w-full mb-4" />
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-xs text-muted">or continue with email</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>
          </>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <FormField
            label="Email Address"
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: '' })) }}
            error={errors.email}
            autoComplete="email"
          />
          <FormField
            label="Password"
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => { setPassword(e.target.value); setErrors(v => ({ ...v, password: '' })) }}
            onKeyPress={e => e.key === 'Enter' && handleSubmit()}
            error={errors.password}
            autoComplete="current-password"
          />

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between mb-6 -mt-2">
            <label className="flex items-center gap-2 text-sm text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded accent-accent cursor-pointer"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-sm transition-colors"
              style={{ color: 'var(--accent)' }}>
              Forgot password?
            </Link>
          </div>

          <Button
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
            type="submit"
          >
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-secondary mt-6">
          No account?{' '}
          <Link to="/signup" className="font-medium transition-colors" style={{ color: 'var(--accent)' }}>
            Sign Up
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
