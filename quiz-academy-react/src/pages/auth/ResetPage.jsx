import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertTriangle } from 'lucide-react'
import AuthShell from '../../components/auth/AuthShell'
import FormField, { PwStrength } from '../../components/auth/FormField'
import Button from '../../components/ui/Button'
import { authApi } from '../../api/auth'

const QUOTE = {
  text:   'It always seems impossible until it is done.',
  author: 'Nelson Mandela',
}

export default function ResetPage() {
  const navigate      = useNavigate()
  const [params]      = useSearchParams()
  const token         = params.get('token')

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [errors,    setErrors]    = useState({})
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)

  // No token in URL
  if (!token) {
    return (
      <AuthShell quote={QUOTE}>
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'var(--red-dim)', border: '1px solid rgba(255,107,138,.3)' }}
          >
            <AlertTriangle size={28} style={{ color: 'var(--red)' }} />
          </div>
          <h1 className="font-display font-bold text-2xl text-primary mb-2">Invalid Link</h1>
          <p className="text-secondary text-sm mb-8">
            This reset link is invalid or has expired. Please request a new one.
          </p>
          <Link to="/forgot-password">
            <Button variant="primary" size="lg" className="w-full">Request New Link</Button>
          </Link>
        </div>
      </AuthShell>
    )
  }

  function validate() {
    const e = {}
    if (!password || password.length < 8) e.password = 'Password must be at least 8 characters'
    if (password !== confirm)             e.confirm  = 'Passwords do not match'
    setErrors(e)
    return !Object.keys(e).length
  }

  async function handleSubmit(ev) {
    ev?.preventDefault()
    if (!validate() || loading) return
    setLoading(true)
    try {
      await authApi.resetPassword(token, password)
      setDone(true)
      // Auto redirect after 2.5s
      setTimeout(() => navigate('/login', { replace: true }), 2500)
    } catch (err) {
      setErrors({ password: err.message || 'Reset failed — link may have expired' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell quote={QUOTE}>
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'var(--green-dim)', border: '1px solid rgba(77,255,195,.3)' }}
            >
              <CheckCircle size={28} style={{ color: 'var(--green)' }} />
            </div>
            <h1 className="font-display font-bold text-2xl text-primary mb-2">Password Updated!</h1>
            <p className="text-secondary text-sm mb-2">Your password has been reset successfully.</p>
            <p className="text-muted text-xs mb-8">Redirecting you to sign in...</p>
            <Link to="/login">
              <Button variant="primary" size="lg" className="w-full">Sign In Now</Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display font-bold text-2xl text-primary mb-1">Set New Password</h1>
            <p className="text-secondary text-sm mb-7">Choose a strong password for your account</p>

            <form onSubmit={handleSubmit}>
              <FormField
                label="New Password"
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(v => ({ ...v, password: '' })) }}
                error={errors.password}
                autoComplete="new-password"
              />
              <PwStrength password={password} />
              <FormField
                label="Confirm New Password"
                id="confirm"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setErrors(v => ({ ...v, confirm: '' })) }}
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
                Set New Password
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  )
}
