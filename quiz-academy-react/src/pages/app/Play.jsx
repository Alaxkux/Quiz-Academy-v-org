import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, Dumbbell, Search, Star, ChevronRight, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { getAllCourses, getRandomPool, shuffle } from '../../data/quizData'
import { useScrollLock } from '../../components/ui/Modal'
import {
  getDailyChallenge, isDailyChallengeCompleted,
  getDailyCountdown, getWeakTopics, getCategoryMastery
} from '../../utils/gamification'
import PageWrapper, { PageHeader } from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import useQuizStore from '../../store/quizStore'

// ── Review Mistakes Course Picker modal ──
function ReviewPicker({ open, onClose, history, allCourses }) {
  useScrollLock(open)
  const navigate = useNavigate()
  const { setPendingConfig } = useQuizStore()

  // Build list of courses that have wrong answers in recent history
  const coursesWithMistakes = Object.keys(allCourses).filter(cat => {
    const catHistory = history.filter(h => h.category === cat)
    return catHistory.some(h =>
      h.questionData?.some(q => !q.isCorrect && q.userAnswer !== null)
    )
  })

  function startReview(category) {
    const catHistory = history.filter(h => h.category === category)
    const wrongQs = []
    catHistory.slice(-5).forEach(h => {
      h.questionData?.filter(q => !q.isCorrect && q.userAnswer !== null).forEach(q => {
        wrongQs.push({
          q:           q.question,
          opts:        q.options,
          a:           q.correctIndex,
          explanation: q.explanation || '',
          difficulty:  'medium',
        })
      })
    })
    if (!wrongQs.length) return
    onClose()
    navigate('/quiz/config', {
      state: {
        category:  `Review: ${category}`,
        questions: shuffle(wrongQs),
        title:     `Review Mistakes — ${category}`,
      }
    })
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0,  opacity: 1 }}
            exit={{   y: 40, opacity: 0 }}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-display font-bold text-base text-primary">🔍 Review Mistakes</h3>
              <button onClick={onClose} className="text-muted hover:text-primary transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-4">
              {coursesWithMistakes.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-3xl mb-2">🎉</div>
                  <p className="text-sm text-secondary">No mistakes to review! You're doing great.</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-secondary mb-3">
                    Select a course to review your wrong answers
                  </p>
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                    {coursesWithMistakes.map(cat => {
                      const data    = allCourses[cat]
                      const catHist = history.filter(h => h.category === cat)
                      const wrongCount = catHist.reduce((sum, h) =>
                        sum + (h.questionData?.filter(q => !q.isCorrect && q.userAnswer !== null).length || 0), 0
                      )
                      return (
                        <button
                          key={cat}
                          onClick={() => startReview(cat)}
                          className="flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:opacity-80"
                          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
                        >
                          <span className="text-xl">{data?.icon || '📚'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-primary truncate">{cat}</div>
                            <div className="text-xs text-muted">{wrongCount} wrong answer{wrongCount !== 1 ? 's' : ''} to review</div>
                          </div>
                          <ChevronRight size={14} style={{ color: 'var(--t3)' }} />
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

// ── Play mode card ──
function ModeCard({ emoji, title, desc, onClick, accent = false, badge, delay = 0 }) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-start gap-4 p-4 rounded-2xl text-left w-full transition-all"
      style={{
        background:  accent ? 'var(--accent-dim)' : 'var(--bg1)',
        border:      `1px solid ${accent ? 'var(--accent-border)' : 'var(--border)'}`,
        cursor:      'pointer',
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      whileHover={{ y: -1, borderColor: 'var(--accent)' }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: accent ? 'var(--accent)' : 'var(--bg2)', border: `1px solid ${accent ? 'transparent' : 'var(--border)'}` }}
      >
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-display font-semibold text-sm text-primary">{title}</span>
          {badge && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-md"
              style={{ background: 'var(--red)', color: '#fff', fontSize: 9 }}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-secondary leading-snug">{desc}</p>
      </div>
      <ChevronRight size={16} style={{ color: 'var(--t3)', flexShrink: 0, marginTop: 2 }} />
    </motion.button>
  )
}

export default function Play() {
  const navigate         = useNavigate()
  const [params]         = useSearchParams()
  const { user }         = useAuth()
  const history          = user?.history || []
  const allCourses       = getAllCourses()
  const weakTopics       = getWeakTopics(history, allCourses)
  const daily            = getDailyChallenge(allCourses)
  const dailyDone        = isDailyChallengeCompleted(user)
  const hasInProgress    = !!localStorage.getItem('qa_inProgressQuiz')

  const [reviewOpen, setReviewOpen] = useState(params.get('tab') === 'review')

  function goToConfig(state) {
    navigate('/quiz/config', { state })
  }

  function startDaily() {
    if (dailyDone) return
    goToConfig({
      category:        daily.category,
      questions:       daily.questions,
      isDailyChallenge: true,
      title:           `Daily Challenge — ${daily.category}`,
    })
  }

  function startRandom() {
    const pool = getRandomPool(20)
    goToConfig({ category: 'Quick Play', questions: pool, title: 'Quick Play — Mixed Topics' })
  }

  function startWeak() {
    if (!weakTopics.length) return
    const pool = []
    weakTopics.forEach(cat => {
      allCourses[cat]?.questions.forEach(q => pool.push({ ...q, _cat: cat }))
    })
    goToConfig({
      category: 'Weak Topics',
      questions: shuffle(pool),
      title:    `Weak Topics — ${weakTopics.slice(0, 2).join(', ')}${weakTopics.length > 2 ? ` +${weakTopics.length - 2}` : ''}`,
    })
  }

  return (
    <PageWrapper>
      <PageHeader
        title="🎮 Play Quiz"
        subtitle="Choose how you want to play"
      />

      {/* Resume in-progress */}
      {hasInProgress && (
        <motion.div
          className="flex items-center gap-3 p-4 rounded-2xl"
          style={{ background: 'var(--gold-dim)', border: '1px solid rgba(245,200,66,.3)' }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-2xl">▶️</span>
          <div className="flex-1">
            <div className="font-display font-semibold text-sm text-primary">Quiz in Progress</div>
            <div className="text-xs text-secondary">You have an unfinished quiz</div>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigate('/quiz/active')}>
            Resume
          </Button>
          <button
            onClick={() => { localStorage.removeItem('qa_inProgressQuiz'); window.location.reload() }}
            className="text-muted hover:text-red transition-colors"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}

      {/* Daily Challenge */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{
              background: dailyDone ? 'var(--green-dim)' : 'linear-gradient(135deg,var(--accent),var(--green))',
              border:     `1px solid ${dailyDone ? 'rgba(77,255,195,.3)' : 'transparent'}`,
            }}
          >
            {dailyDone ? '✅' : '⭐'}
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-base text-primary mb-0.5">
              Daily Challenge — {daily.category}
            </h3>
            <p className="text-xs text-secondary mb-2">
              {dailyDone
                ? 'Great work! Come back tomorrow for a new challenge.'
                : `5 fresh questions · Earn +50 bonus XP · ${getDailyCountdown()}`}
            </p>
            {!dailyDone && (
              <Button variant="primary" size="sm" onClick={startDaily}>
                Start Daily Challenge
              </Button>
            )}
            {dailyDone && (
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'var(--green-dim)', border: '1px solid rgba(77,255,195,.3)', color: 'var(--green)' }}
              >
                ✓ Completed today!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Play modes */}
      <div>
        <h2 className="font-display font-semibold text-sm text-primary mb-3">Play Modes</h2>
        <div className="flex flex-col gap-2.5">
          <ModeCard
            emoji="🎲" title="Quick Play" badge=""
            desc="Random questions from all categories — great for general practice"
            onClick={startRandom} delay={0.05}
          />
          <ModeCard
            emoji="💪" title="Weak Topics"
            desc={weakTopics.length
              ? `You're below 60% in: ${weakTopics.slice(0,3).join(', ')}${weakTopics.length > 3 ? ` +${weakTopics.length - 3} more` : ''}`
              : 'No weak topics — you\'re doing great! 🎉'}
            onClick={weakTopics.length ? startWeak : undefined}
            delay={0.1}
          />
          <ModeCard
            emoji="🔍" title="Review Mistakes"
            desc="Practice questions you previously got wrong — choose a specific course"
            onClick={() => setReviewOpen(true)} delay={0.15}
          />
          <ModeCard
            emoji="📚" title="Browse All Courses"
            desc="Choose any category and customize your quiz settings"
            onClick={() => navigate('/categories')} delay={0.2}
          />
          <ModeCard
            emoji="🤖" title="AI-Generated Quiz" badge="New"
            desc="Generate custom questions on any topic using Gemini AI"
            onClick={() => navigate('/ai')} delay={0.25}
          />
        </div>
      </div>

      {/* Weak topic mastery breakdown */}
      {weakTopics.length > 0 && (
        <div
          className="rounded-2xl p-4"
          style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
        >
          <h3 className="font-display font-semibold text-sm text-primary mb-3">
            📊 Topic Mastery Breakdown
          </h3>
          <div className="flex flex-col gap-2">
            {weakTopics.map(cat => {
              const mastery = getCategoryMastery(history, cat)
              const data    = allCourses[cat]
              return (
                <button
                  key={cat}
                  onClick={() => navigate('/quiz/config', { state: { category: cat } })}
                  className="flex items-center gap-3 p-2.5 rounded-xl text-left transition-all hover:opacity-80"
                  style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
                >
                  <span className="text-base flex-shrink-0">{data?.icon || '📚'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-primary truncate">{cat}</span>
                      <span className="text-xs font-bold ml-2 flex-shrink-0"
                        style={{ color: mastery >= 60 ? 'var(--gold)' : 'var(--red)' }}>
                        {mastery}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width:      `${mastery}%`,
                          background: mastery >= 60 ? 'var(--gold)' : 'var(--red)',
                        }}
                      />
                    </div>
                  </div>
                  <ChevronRight size={13} style={{ color: 'var(--t3)', flexShrink: 0 }} />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Review Mistakes Modal */}
      <ReviewPicker
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        history={history}
        allCourses={allCourses}
      />
    </PageWrapper>
  )
}
