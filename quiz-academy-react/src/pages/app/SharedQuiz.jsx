import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { coursesApi } from '../../api/courses'
import SamsungPopup from '../../components/ui/SamsungPopup'
import Button from '../../components/ui/Button'

function SignInPrompt({ open, onClose }) {
  const navigate = useNavigate()
  return (
    <SamsungPopup open={open} onClose={onClose} title="Unlock More Features" icon="🔓">
      <p className="text-sm text-secondary mb-4 leading-relaxed">
        Create a free account to save your scores, earn XP, track your streak, and compete on the leaderboard.
      </p>
      <div className="flex flex-col gap-2">
        <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/signup')}>
          Create Free Account
        </Button>
        <Button variant="secondary" size="lg" className="w-full" onClick={() => navigate('/login')}>
          Sign In
        </Button>
        <button onClick={onClose} className="text-sm text-muted py-2">Continue as guest</button>
      </div>
    </SamsungPopup>
  )
}

export default function SharedQuiz() {
  const { token } = useParams()
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const [course,   setCourse]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [started,  setStarted]  = useState(false)
  const [current,  setCurrent]  = useState(0)
  const [answers,  setAnswers]  = useState({})
  const [done,     setDone]     = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)

  useEffect(() => {
    coursesApi.getShared(token)
      .then(d => setCourse(d))
      .catch(e => setError(e.message || 'Quiz not found'))
      .finally(() => setLoading(false))
  }, [token])

  function handleAnswer(qi, ai) {
    setAnswers(prev => ({ ...prev, [qi]: ai }))
  }

  function finish() {
    setDone(true)
    if (!user) setTimeout(() => setShowSignIn(true), 1500)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg0)' }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ background: 'var(--bg0)' }}>
      <div className="text-5xl">😕</div>
      <h2 className="font-display font-black text-xl text-primary">Quiz not found</h2>
      <p className="text-secondary text-sm">{error}</p>
      <Button variant="primary" onClick={() => navigate('/')}>Go Home</Button>
    </div>
  )

  const questions = course?.questions || []
  const q = questions[current]

  // Results screen
  if (done) {
    const correct = questions.filter((_, i) => answers[i] === questions[i].a).length
    const pct = Math.round((correct / questions.length) * 100)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 py-10" style={{ background: 'var(--bg0)' }}>
        <motion.div className="text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="text-6xl mb-3">{pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '📚'}</div>
          <h1 className="font-display font-black text-3xl text-primary mb-1">
            {pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good Job!' : 'Keep Practicing!'}
          </h1>
          <p className="text-secondary">You scored on <strong style={{ color: 'var(--accent)' }}>{course.name}</strong></p>
        </motion.div>
        <div className="w-36 h-36 relative">
          <svg viewBox="0 0 128 128" className="-rotate-90 w-full h-full">
            <circle cx="64" cy="64" r="54" fill="none" stroke="var(--border)" strokeWidth="10" />
            <motion.circle cx="64" cy="64" r="54" fill="none"
              stroke={pct >= 80 ? 'var(--green)' : pct >= 60 ? 'var(--gold)' : 'var(--red)'}
              strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 339.3} 339.3`}
              initial={{ strokeDasharray: '0 339.3' }}
              animate={{ strokeDasharray: `${(pct / 100) * 339.3} 339.3` }}
              transition={{ duration: 1.2, delay: 0.3 }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display font-black text-3xl text-primary">{pct}%</span>
            <span className="text-xs text-muted">Score</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          <div className="rounded-2xl py-4 text-center" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
            <div className="font-display font-black text-2xl text-primary">{correct}/{questions.length}</div>
            <div className="text-xs text-muted">Correct</div>
          </div>
          <div className="rounded-2xl py-4 text-center" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
            <div className="font-display font-black text-2xl" style={{ color: 'var(--accent)' }}>{pct}%</div>
            <div className="text-xs text-muted">Score</div>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          {user ? (
            <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/categories')}>Browse More Courses</Button>
          ) : (
            <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/signup')}>
              Save Score & Create Account
            </Button>
          )}
          <Button variant="secondary" size="lg" className="w-full" onClick={() => { setDone(false); setStarted(false); setAnswers({}); setCurrent(0) }}>
            Try Again
          </Button>
        </div>
        <SignInPrompt open={showSignIn} onClose={() => setShowSignIn(false)} />
      </div>
    )
  }

  // Pre-start screen
  if (!started) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 py-10" style={{ background: 'var(--bg0)' }}>
      {/* Branding */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-sm"
          style={{ background: 'linear-gradient(135deg,var(--accent),var(--green))' }}>Q</div>
        <span className="font-display font-bold text-base text-primary">Quiz Academy</span>
      </div>

      <motion.div className="w-full max-w-sm rounded-3xl p-6 text-center"
        style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-5xl mb-3">{course.icon}</div>
        <h1 className="font-display font-black text-2xl text-primary mb-1">{course.name}</h1>
        <p className="text-secondary text-sm mb-4">{course.description || 'A shared quiz'}</p>
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="text-center">
            <div className="font-display font-black text-xl text-primary">{questions.length}</div>
            <div className="text-xs text-muted">Questions</div>
          </div>
          <div className="w-px h-8" style={{ background: 'var(--border)' }} />
          <div className="text-center">
            <div className="font-display font-black text-xl text-primary">~{Math.ceil(questions.length * 0.5)}m</div>
            <div className="text-xs text-muted">Est. time</div>
          </div>
        </div>
        <Button variant="primary" size="lg" className="w-full" onClick={() => setStarted(true)}>
          Start Quiz →
        </Button>
        {!user && (
          <p className="text-xs text-muted mt-3">
            <button onClick={() => navigate('/login')} style={{ color: 'var(--accent)' }}>Sign in</button>
            {' '}to save your progress
          </p>
        )}
      </motion.div>
    </div>
  )

  // Quiz screen
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg0)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
        style={{ background: 'var(--bg0)', borderBottom: '1px solid var(--border)' }}>
        <div className="font-display font-bold text-sm text-primary">{course.name}</div>
        <span className="text-sm text-muted">Q{current + 1} / {questions.length}</span>
      </div>

      {/* Progress */}
      <div className="h-1 w-full" style={{ background: 'var(--border)' }}>
        <motion.div className="h-full" style={{ background: 'linear-gradient(90deg,var(--accent),var(--green))' }}
          animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }} />
      </div>

      <div className="flex-1 flex flex-col gap-4 px-5 py-6 max-w-2xl mx-auto w-full">
        <motion.p className="font-display font-semibold text-lg text-primary leading-snug"
          key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          {q.q}
        </motion.p>

        <div className="flex flex-col gap-2.5">
          {q.opts.map((opt, i) => {
            const selected = answers[current] === i
            return (
              <motion.button key={i} onClick={() => handleAnswer(current, i)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all"
                style={{
                  background: selected ? 'var(--accent-dim)' : 'var(--bg1)',
                  border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                }}
                whileTap={{ scale: 0.98 }}>
                <span className="w-7 h-7 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: selected ? 'var(--accent)' : 'var(--bg2)', color: selected ? '#fff' : 'var(--t3)' }}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm text-primary leading-snug">{opt}</span>
              </motion.button>
            )
          })}
        </div>

        <div className="flex gap-3 mt-auto pt-4">
          {current > 0 && (
            <Button variant="secondary" size="lg" onClick={() => setCurrent(c => c - 1)}>← Back</Button>
          )}
          {current < questions.length - 1 ? (
            <Button variant="primary" size="lg" className="flex-1"
              disabled={answers[current] === undefined}
              onClick={() => setCurrent(c => c + 1)}>
              Next →
            </Button>
          ) : (
            <Button variant="primary" size="lg" className="flex-1"
              disabled={answers[current] === undefined}
              onClick={finish}>
              Finish Quiz ✓
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
