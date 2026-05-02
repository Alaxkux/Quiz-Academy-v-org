import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import useQuizStore from '../../store/quizStore'
import { getQuestions, getAllCourses, shuffle } from '../../data/quizData'
import PageWrapper from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import ConfigCard, { ConfigOption } from '../../components/quiz/ConfigCard'
import { useBack } from '../../hooks/useBack'

const DIFFICULTIES = [
  { val: 'all',    label: 'All',    sub: 'Mix of everything' },
  { val: 'easy',   label: 'Easy',   sub: 'Good for beginners' },
  { val: 'medium', label: 'Medium', sub: 'Standard difficulty' },
  { val: 'hard',   label: 'Hard',   sub: 'Challenge yourself' },
]

const REVEAL_MODES = [
  { val: 'after',  label: 'After Quiz',   sub: 'CBT style — no indicators during quiz' },
  { val: 'during', label: 'During Quiz',  sub: 'See right/wrong live as you answer' },
]

export default function QuizConfig() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const goBack     = useBack('/categories')
  const { user }   = useAuth()
  const { startQuiz } = useQuizStore()

  // State passed from navigation
  const {
    category   = '',
    questions: providedQuestions = null,
    isDailyChallenge = false,
    title = '',
  } = location.state || {}

  const displayName = title || category || 'Quiz'

  // Config state
  const [difficulty,  setDifficulty]  = useState('all')
  const [countInput,  setCountInput]  = useState('10')
  const [timeInput,   setTimeInput]   = useState('0')
  const [revealMode,  setRevealMode]  = useState('after')
  const [error,       setError]       = useState('')

  const allCourses = getAllCourses()
  const courseData = allCourses[category]

  // Validate and parse inputs
  function getCount() {
    const n = parseInt(countInput)
    if (isNaN(n) || n < 1) return 1
    const max = providedQuestions?.length || courseData?.questions?.length || 20
    return Math.min(n, max)
  }

  function getTimePerQ() {
    const n = parseInt(timeInput)
    if (isNaN(n) || n < 0) return 0
    return n
  }

  function handleStart() {
    setError('')
    const count    = getCount()
    const timePerQ = getTimePerQ()

    let qs = providedQuestions
      ? [...providedQuestions]
      : courseData?.questions
        ? [...courseData.questions]
        : []

    if (!qs.length) {
      setError('No questions available for this course.')
      return
    }

    // Filter by difficulty
    if (difficulty !== 'all' && !providedQuestions) {
      const filtered = qs.filter(q => q.difficulty === difficulty)
      if (filtered.length) qs = filtered
    }

    // Shuffle and limit
    qs = shuffle(qs).slice(0, count)

    const started = startQuiz({
      category:         category || displayName,
      questions:        qs,
      isDailyChallenge,
      revealMode,
      difficulty,
      timePerQ,
    })

    if (started) navigate('/quiz/active')
    else setError('Could not start quiz. Please try again.')
  }

  const maxQ = providedQuestions?.length || courseData?.questions?.length || 20

  return (
    <PageWrapper>
      {/* Back button */}
      <button
        onClick={goBack}
        className="flex items-center gap-1.5 text-sm text-secondary hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={15} /> Back
      </button>

      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-primary">⚙️ Quiz Setup</h1>
        <p className="text-secondary text-sm mt-1">
          Configure your quiz for <strong style={{ color: 'var(--accent)' }}>{displayName}</strong>
        </p>
        {isDailyChallenge && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full mt-2"
            style={{ background: 'var(--gold-dim)', border: '1px solid rgba(245,200,66,.3)', color: 'var(--gold)' }}>
            ⭐ Daily Challenge — +50 bonus XP
          </span>
        )}
      </div>

      {/* Config grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        {/* Difficulty */}
        <ConfigCard icon="🎯" label="Difficulty" delay={0.05}>
          <div className="grid grid-cols-2 gap-2">
            {DIFFICULTIES.map(d => (
              <ConfigOption
                key={d.val}
                label={d.label}
                sub={d.sub}
                selected={difficulty === d.val}
                onClick={() => setDifficulty(d.val)}
              />
            ))}
          </div>
        </ConfigCard>

        {/* Number of questions — free input */}
        <ConfigCard icon="🔢" label="Number of Questions" delay={0.1}>
          <div className="flex flex-col gap-2">
            <input
              type="number"
              value={countInput}
              onChange={e => setCountInput(e.target.value)}
              min={1}
              max={maxQ}
              placeholder={`1–${maxQ}`}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: 'var(--bg2)',
                border:     '1px solid var(--border)',
                color:      'var(--t1)',
                fontFamily: 'DM Sans, sans-serif',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor  = 'var(--border)'}
            />
            <p className="text-xs text-muted">Max available: {maxQ} questions</p>
          </div>
        </ConfigCard>

        {/* Time per question — free input */}
        <ConfigCard icon="⏱️" label="Time per Question (seconds)" delay={0.15}>
          <div className="flex flex-col gap-2">
            <input
              type="number"
              value={timeInput}
              onChange={e => setTimeInput(e.target.value)}
              min={0}
              max={300}
              placeholder="0 = no limit"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: 'var(--bg2)',
                border:     '1px solid var(--border)',
                color:      'var(--t1)',
                fontFamily: 'DM Sans, sans-serif',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor  = 'var(--border)'}
            />
            <p className="text-xs text-muted">
              {parseInt(timeInput) > 0 ? `${timeInput}s per question` : 'No time limit'}
            </p>
          </div>
        </ConfigCard>

        {/* Reveal mode */}
        <ConfigCard icon="👁️" label="Show Answers" delay={0.2}>
          <div className="flex flex-col gap-2">
            {REVEAL_MODES.map(m => (
              <ConfigOption
                key={m.val}
                label={m.label}
                sub={m.sub}
                selected={revealMode === m.val}
                onClick={() => setRevealMode(m.val)}
              />
            ))}
          </div>
        </ConfigCard>
      </div>

      {/* Summary */}
      <motion.div
        className="rounded-xl px-4 py-3 text-sm text-center text-secondary"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
      >
        Ready: <strong className="text-primary">{getCount()} questions</strong>
        {' · '}{difficulty === 'all' ? 'All difficulties' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        {' · '}{parseInt(timeInput) > 0 ? `${timeInput}s per question` : 'No time limit'}
        {' · '}{revealMode === 'during' ? 'Live feedback' : 'Review after quiz'}
      </motion.div>

      {error && (
        <p className="text-sm text-center" style={{ color: 'var(--red)' }}>{error}</p>
      )}

      {/* Start button */}
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={handleStart}
      >
        ▶ Start Quiz
      </Button>
    </PageWrapper>
  )
}
