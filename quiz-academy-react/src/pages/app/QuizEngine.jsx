import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import useQuizStore from '../../store/quizStore'
import { useAuth } from '../../hooks/useAuth'
import { checkAchievements, updateStreak } from '../../utils/gamification'
import { calculateSmartAverage, getLevelInfo } from '../../data/levels'
import QuizOption from '../../components/quiz/QuizOption'
import QuizProgress from '../../components/quiz/QuizProgress'
import QuizTimer, { ElapsedTimer } from '../../components/quiz/QuizTimer'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

// Tab-leave warning modal
function TabWarningModal({ open, count, onContinue, onQuit }) {
  const tooMany = count >= 3
  return (
    <Modal
      open={open}
      onClose={onContinue}
      icon={tooMany ? '⛔' : '⚠️'}
      title={tooMany ? 'Too Many Tab Switches' : 'Tab Switch Detected'}
    >
      {tooMany ? (
        <>
          <p className="text-secondary text-sm mb-5">
            You've left the quiz <strong>3 times</strong>. Quiz cancelled — your score won't be saved.
          </p>
          <Button variant="danger" className="w-full" onClick={onQuit}>Back to Dashboard</Button>
        </>
      ) : (
        <>
          <p className="text-secondary text-sm mb-5">
            You left the quiz. Warning <strong style={{ color: 'var(--red)' }}>{count}/3</strong> — leaving
            again will cancel your quiz automatically.
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={onQuit}>Quit Quiz</Button>
            <Button variant="primary"   className="flex-1" onClick={onContinue}>Continue Quiz</Button>
          </div>
        </>
      )}
    </Modal>
  )
}

// Quit confirmation modal
function QuitModal({ open, onClose, onConfirm }) {
  return (
    <Modal open={open} onClose={onClose} icon="⚠️" title="Quit Quiz?">
      <p className="text-secondary text-sm mb-5">
        Your progress will be lost and your score won't be saved. Are you sure?
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Stay in Quiz</Button>
        <Button variant="danger"    className="flex-1" onClick={onConfirm}>Quit</Button>
      </div>
    </Modal>
  )
}

export default function QuizEngine() {
  const navigate      = useNavigate()
  const { user, updateUser, addNotification } = useAuth()
  const {
    quiz, timeElapsed, isActive,
    selectAnswer, nextQuestion, prevQuestion,
    tick, tabLeft, quitQuiz, finishQuiz, resumeQuiz,
  } = useQuizStore()

  const [quitOpen,    setQuitOpen]    = useState(false)
  const [tabOpen,     setTabOpen]     = useState(false)
  const [tabCount,    setTabCount]    = useState(0)
  const [perQKey,     setPerQKey]     = useState(0) // key to reset per-Q timer on question change
  const timerRef  = useRef(null)
  const guardRef  = useRef({})
  const expiredRef = useRef(false)

  // Resume if page reloaded mid-quiz
  useEffect(() => {
    if (!isActive) {
      const ok = resumeQuiz()
      if (!ok) navigate('/play', { replace: true })
    }
  }, [])

  // Overall tick timer
  useEffect(() => {
    if (!isActive) return
    timerRef.current = setInterval(tick, 1000)
    return () => clearInterval(timerRef.current)
  }, [isActive])

  // ── EXIT GUARDS ──

  // beforeunload — browser tab/window close
  useEffect(() => {
    const handler = e => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  // visibilitychange — tab switch
  useEffect(() => {
    const handler = () => {
      if (document.hidden && isActive) {
        const count = tabLeft()
        setTabCount(count)
        setTimeout(() => setTabOpen(true), 200)
      }
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [isActive])

  // popstate — back button
  useEffect(() => {
    const handler = () => {
      history.pushState(null, '', location.href)
      setQuitOpen(true)
    }
    history.pushState(null, '', location.href)
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  // ── HANDLERS ──
  function handleQuit() {
    clearInterval(timerRef.current)
    quitQuiz()
    navigate('/dashboard', { replace: true })
  }

  function handleTabQuit() {
    setTabOpen(false)
    clearInterval(timerRef.current)
    quitQuiz()
    navigate('/dashboard', { replace: true })
  }

  function handleSelect(idx) {
    if (!quiz) return
    // In CBT mode or during mode — answers are toggleable until Next is pressed
    selectAnswer(idx)
  }

  function handleNext(force = false) {
    if (!quiz) return
    const hasAnswer = quiz.answers[quiz.currentIndex] !== undefined
    if (!hasAnswer && !force) return
    expiredRef.current = false

    const result = nextQuestion()
    if (result === 'finish') {
      handleFinish()
    } else {
      setPerQKey(k => k + 1) // reset per-question timer
    }
  }

  function handlePrev() {
    prevQuestion()
    setPerQKey(k => k + 1)
  }

  function handlePerQExpire() {
    if (!quiz) return
    if (expiredRef.current) return   // guard against double-fire
    expiredRef.current = true
    // Auto-record as skipped (-1) then force move to next
    if (quiz.answers[quiz.currentIndex] === undefined) {
      selectAnswer(-1)
    }
    setTimeout(() => {
      expiredRef.current = false
      handleNext(true) // force skip regardless of answer
    }, 800)
  }

  function handleFinish() {
    clearInterval(timerRef.current)
    const result = finishQuiz()
    if (!result) { navigate('/dashboard'); return }

    if (user) {
      const prevStats      = user.stats || {}
      const updatedHistory = [...(user.history || []), result]

      // Compute streak separately — do NOT spread old stats inside
      const streakUpdate = updateStreak(prevStats)

      const updatedStats = {
        ...prevStats,
        quizzesTaken:        (prevStats.quizzesTaken        || 0) + 1,
        totalPoints:         (prevStats.totalPoints          || 0) + result.points,
        totalXP:             (prevStats.totalXP              || 0) + result.xpEarned,
        weightedAvgScore:    calculateSmartAverage(updatedHistory),
        // Streak fields come from streakUpdate — applied last so they don't get overwritten
        streak:              streakUpdate.streak,
        lastQuizDate:        streakUpdate.lastQuizDate,
        categoriesPlayed:    [
          ...new Set([...(prevStats.categoriesPlayed || []), result.category])
        ],
        dailyChallengesDone: result.isDailyChallenge
          ? (prevStats.dailyChallengesDone || 0) + 1
          : (prevStats.dailyChallengesDone || 0),
      }

      // Recalculate level from new XP total
      const { current: levelInfo } = getLevelInfo(updatedStats.totalXP)
      updatedStats.currentLevel = levelInfo.level

      const { newAchievements, updatedList } = checkAchievements({
        stats: updatedStats, history: updatedHistory, achievements: user.achievements || []
      })

      let lastDailyChallenge = user.lastDailyChallenge
      if (result.isDailyChallenge) lastDailyChallenge = new Date().toDateString()

      updateUser({
        history:            updatedHistory.slice(-100),
        stats:              updatedStats,
        achievements:       updatedList,
        lastDailyChallenge,
      })

      // Fire notifications
      addNotification(`🎯 Quiz complete! You scored ${result.percentage}% on ${result.category}`, result.percentage >= 80 ? 'success' : 'info')
      newAchievements.forEach(ach => {
        addNotification(`🏆 Achievement unlocked: ${ach.name}`, 'success')
      })
      if (result.isDailyChallenge) {
        addNotification('⭐ Daily Challenge completed! +50 XP bonus', 'success')
      }

      navigate('/quiz/results', {
        state: { result, newAchievements },
        replace: true,
      })
    } else {
      navigate('/quiz/results', { state: { result }, replace: true })
    }
  }

  if (!quiz || !isActive) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-3">🔄</div>
          <p className="text-secondary">Loading quiz...</p>
        </div>
      </div>
    )
  }

  const { questions, currentIndex, answers, revealMode, timePerQ, category } = quiz
  const q          = questions[currentIndex]
  const isCBT      = revealMode === 'after'
  const hasAnswer  = answers[currentIndex] !== undefined
  const isLast     = currentIndex === questions.length - 1

  return (
    <div
      className="flex flex-col gap-3 w-full animate-fade-in pb-24 md:pb-6"
      style={{ minHeight: '80vh' }}
    >
      {/* ── Topbar ── */}
      <div
        className="flex items-center gap-3 p-3 rounded-2xl flex-wrap"
        style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
      >
        <div className="flex-1 min-w-0">
          <QuizProgress current={currentIndex} total={questions.length} category={category} />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ElapsedTimer elapsed={timeElapsed} />
          {timePerQ > 0 && (
            <QuizTimer
              key={`${perQKey}-${currentIndex}`}
              seconds={timePerQ}
              running={!hasAnswer}
              onExpire={handlePerQExpire}
            />
          )}
          {/* Mode tag */}
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full hidden sm:inline-flex"
            style={{
              background: isCBT ? 'var(--gold-dim)'  : 'var(--green-dim)',
              color:      isCBT ? 'var(--gold)'      : 'var(--green)',
              border:     `1px solid ${isCBT ? 'rgba(245,200,66,.2)' : 'rgba(77,255,195,.2)'}`,
            }}
          >
            {isCBT ? '📋 CBT' : '⚡ Live'}
          </span>
          <button
            onClick={() => setQuitOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-muted hover:text-red transition-colors"
            style={{ border: '1px solid var(--border)' }}
          >
            <X size={12} /> Quit
          </button>
        </div>
      </div>

      {/* ── Question body ── */}
      <div
        className="flex-1 rounded-2xl p-5 flex flex-col gap-4"
        style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0  }}
            exit={{   opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            {/* Question */}
            <p className="font-display font-bold text-base md:text-lg text-primary leading-snug">
              {q.q}
            </p>

            {/* Options */}
            <div className="flex flex-col gap-2.5">
              {q.opts.map((opt, i) => {
                const isSelected = answers[currentIndex] === i
                const isCorrect  = hasAnswer && !isCBT && i === q.a
                const isWrong    = hasAnswer && !isCBT && isSelected && i !== q.a

                return (
                  <QuizOption
                    key={i}
                    index={i}
                    text={opt}
                    selected={isSelected}
                    correct={isCorrect}
                    wrong={isWrong}
                    disabled={hasAnswer && !isCBT}
                    revealMode={revealMode}
                    onClick={() => handleSelect(i)}
                  />
                )
              })}
            </div>

            {/* Explanation — live mode only */}
            <AnimatePresence>
              {hasAnswer && !isCBT && q.explanation && (
                <motion.div
                  className="rounded-xl p-3 text-sm leading-relaxed"
                  style={{
                    background:  'var(--bg2)',
                    borderLeft:  '3px solid var(--accent)',
                    color:       'var(--t2)',
                  }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  💡 {q.explanation}
                </motion.div>
              )}
            </AnimatePresence>

            {/* CBT notice */}
            {hasAnswer && isCBT && (
              <p className="text-xs text-center text-muted py-1">
                Answer recorded — all answers reviewed after the quiz
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          size="md"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={16} /> Previous
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={handleNext}
          disabled={!hasAnswer}
          className="flex-1 max-w-xs"
        >
          {isLast ? 'Finish Quiz ✓' : 'Next'} <ChevronRight size={16} />
        </Button>
      </div>

      {/* ── Modals ── */}
      <QuitModal
        open={quitOpen}
        onClose={() => setQuitOpen(false)}
        onConfirm={handleQuit}
      />
      <TabWarningModal
        open={tabOpen}
        count={tabCount}
        onContinue={() => setTabOpen(false)}
        onQuit={handleTabQuit}
      />
    </div>
  )
}