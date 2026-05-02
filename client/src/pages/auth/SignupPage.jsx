import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import AuthShell from '../../components/auth/AuthShell'
import FormField, { PwStrength } from '../../components/auth/FormField'
import Button from '../../components/ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { authApi } from '../../api/auth'

const QUOTE = {
  text:   'The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.',
  author: 'Brian Herbert',
}

export default function SignupPage() {
  const navigate  = useNavigate()
  const { signup, googleLogin, addNotification } = useAuth()

  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [googleClientId, setGoogleClientId] = useState(null)
  const googleBtnRef = useRef(null)

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
      text:           'signup_with',
      shape:          'rectangular',
      logo_alignment: 'left',
    })
  }, [googleClientId])

  async function handleGoogleResponse(response) {
    try {
      const user = await googleLogin(response.credential)
      addNotification(`Welcome to Quiz Academy, ${user.name}! 🎉`, 'success')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Google sign-up failed')
    }
  }

  function setField(key, val) {
    setForm(v => ({ ...v, [key]: val }))
    setErrors(v => ({ ...v, [key]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters'
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
      if (err.message?.toLowerCase().includes('email')) setErrors(v => ({ ...v, email: err.message }))
      else setErrors(v => ({ ...v, confirm: err.message || 'Signup failed' }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell quote={QUOTE}>
      <div>
        <h1 className="font-display font-bold text-2xl text-primary mb-1">Create Account</h1>
        <p className="text-secondary text-sm mb-7">Start your learning adventure today</p>

        {/* Google */}
        {googleClientId && (
          <>
            <div ref={googleBtnRef} className="w-full mb-4" />
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-xs text-muted">or sign up with email</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit}>
          <FormField
            label="Full Name"
            id="name"
            placeholder="John Doe"
            value={form.name}
            onChange={e => setField('name', e.target.value)}
            error={errors.name}
            maxLength={60}
            autoComplete="name"
          />
          <FormField
            label="Email Address"
            id="email"
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={e => setField('email', e.target.value)}
            error={errors.email}
            autoComplete="email"
          />
          <FormField
            label="Password"
            id="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setField('password', e.target.value)}
            error={errors.password}
            autoComplete="new-password"
          />
          <PwStrength password={form.password} />
          <FormField
            label="Confirm Password"
            id="confirm"
            type="password"
            placeholder="••••••••"
            value={form.confirm}
            onChange={e => setField('confirm', e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSubmit()}
            error={errors.confirm}
            autoComplete="new-password"
          />

          <Button
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mt-2"
            type="submit"
          >
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-secondary mt-6">
          Have an account?{' '}
          <Link to="/login" className="font-medium" style={{ color: 'var(--accent)' }}>
            Sign In
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
