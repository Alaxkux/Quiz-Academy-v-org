import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import AuthShell from '../../components/auth/AuthShell'
import FormField from '../../components/auth/FormField'
import Button from '../../components/ui/Button'
import { authApi } from '../../api/auth'

const QUOTE = {
  text:   'Every expert was once a beginner.',
  author: 'Helen Hayes',
}

export default function ForgotPage() {
  const [email,   setEmail]   = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address')
      return
    }
    setLoading(true)
    try {
      await authApi.forgotPassword(email.trim())
      setSent(true)
    } catch (err) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell quote={QUOTE}>
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
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
            <h1 className="font-display font-bold text-2xl text-primary mb-2">Check your inbox</h1>
            <p className="text-secondary text-sm mb-8 leading-relaxed">
              If <strong style={{ color: 'var(--t1)' }}>{email}</strong> is registered, a reset link
              has been sent. Check your spam folder if you don't see it.
            </p>
            <Link to="/login">
              <Button variant="primary" size="lg" className="w-full">Back to Sign In</Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display font-bold text-2xl text-primary mb-1">Reset Password</h1>
            <p className="text-secondary text-sm mb-7">
              Enter your email and we'll send you a reset link
            </p>

            <form onSubmit={handleSubmit}>
              <FormField
                label="Email Address"
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                onKeyPress={e => e.key === 'Enter' && handleSubmit()}
                error={error}
                autoComplete="email"
              />
              <Button
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
                type="submit"
              >
                Send Reset Link
              </Button>
            </form>

            <p className="text-center text-sm text-secondary mt-6">
              Remember it?{' '}
              <Link to="/login" className="font-medium" style={{ color: 'var(--accent)' }}>
                Sign In
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  )
}
