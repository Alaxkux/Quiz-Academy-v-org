import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import useQuizStore from '../../store/quizStore'
import { getQuestions, getAllCourses, shuffle } from '../../data/quizData'
import { coursesApi } from '../../api/courses'
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
  { val: 'after',  label: 'After Quiz',  sub: 'CBT style — no indicators during quiz' },
  { val: 'during', label: 'During Quiz', sub: 'See right/wrong live as you answer' },
]

export default function QuizConfig() {
  const navigate      = useNavigate()
  const location      = useLocation()
  const goBack        = useBack('/categories')
  const { user }      = useAuth()
  const { startQuiz } = useQuizStore()

  const {
    category         = '',
    questions: providedQuestions = null,
    isDailyChallenge = false,
    title            = '',
  } = location.state || {}

  const displayName = title || category || 'Quiz'

  const [difficulty,  setDifficulty]  = useState('all')
  const [countInput,  setCountInput]  = useState('10')
  const [timeInput,   setTimeInput]   = useState('0')
  const [revealMode,  setRevealMode]  = useState('after')
  const [error,       setError]       = useState('')
  const [dbQuestions, setDbQuestions] = useState(null) // fetched from API
  const [fetching,    setFetching]    = useState(false)

  // Try local first, fall back to DB
  const allCourses  = getAllCourses()
  const localCourse = allCourses[category]
  const localQs     = localCourse?.questions || []

  useEffect(() => {
    // If we have provided questions or enough local questions, skip DB fetch
    if (providedQuestions || localQs.length > 0) return
    // Otherwise fetch from DB
    if (!category) return
    setFetching(true)
    coursesApi.getOne(category)
      .then(data => {
        setDbQuestions(data.course?.questions || [])
        const count = data.course?.questions?.length || 0
        setCountInput(String(Math.min(10, count) || 10))
      })
      .catch(() => setDbQuestions([]))
      .finally(() => setFetching(false))
  }, [category])

  // Determine the active questions source
  const activeQuestions = providedQuestions || (localQs.length > 0 ? localQs : dbQuestions || [])

  function getCount() {
    const n = parseInt(countInput)
    if (isNaN(n) || n < 1) return 1
    return Math.min(n, activeQuestions.length || 20)
  }

  function getTimePerQ() {
    const n = parseInt(timeInput)
    if (isNaN(n) || n < 0) return 0
    return n
  }

  function handleStart() {
    setError('')
    if (fetching) { setError('Still loading questions, please wait...'); return }

    let qs = [...activeQuestions]
    if (!qs.length) { setError('No questions available for this course.'); return }

    if (difficulty !== 'all' && !providedQuestions) {
      const filtered = qs.filter(q => q.difficulty === difficulty)
      if (filtered.length) qs = filtered
    }

    qs = shuffle(qs).slice(0, getCount())

    const started = startQuiz({
      category:         category || displayName,
      questions:        qs,
      isDailyChallenge,
      revealMode,
      difficulty,
      timePerQ:         getTimePerQ(),
    })

    if (started) navigate('/quiz/active')
    else setError('Could not start quiz. Please try again.')
  }

  const maxQ    = activeQuestions.length || 20
  const loading = fetching && !providedQuestions && localQs.length === 0

  return (
    <PageWrapper>
      <button
        onClick={goBack}
        className="flex items-center gap-1.5 text-sm text-secondary hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={15} /> Back
      </button>

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
        {loading && (
          <p className="text-xs text-muted mt-1">Loading questions from database...</p>
        )}
        {!loading && activeQuestions.length > 0 && (
          <p className="text-xs mt-1" style={{ color: 'var(--green)' }}>
            ✓ {activeQuestions.length} questions available
          </p>
        )}
        {!loading && !fetching && activeQuestions.length === 0 && (
          <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>
            ⚠️ No questions found for this course
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

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
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
            <p className="text-xs text-muted">
              {loading ? 'Loading...' : `Max available: ${maxQ} questions`}
            </p>
          </div>
        </ConfigCard>

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
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
            <p className="text-xs text-muted">
              {parseInt(timeInput) > 0 ? `${timeInput}s per question` : 'No time limit'}
            </p>
          </div>
        </ConfigCard>

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

      <motion.div
        className="rounded-xl px-4 py-3 text-sm text-center text-secondary"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
      >
        Ready: <strong className="text-primary">{loading ? '...' : getCount()} questions</strong>
        {' · '}{difficulty === 'all' ? 'All difficulties' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        {' · '}{parseInt(timeInput) > 0 ? `${timeInput}s per question` : 'No time limit'}
        {' · '}{revealMode === 'during' ? 'Live feedback' : 'Review after quiz'}
      </motion.div>

      {error && (
        <p className="text-sm text-center" style={{ color: 'var(--red)' }}>{error}</p>
      )}

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={handleStart}
        disabled={loading}
      >
        {loading ? 'Loading questions...' : '▶ Start Quiz'}
      </Button>
    </PageWrapper>
  )
}