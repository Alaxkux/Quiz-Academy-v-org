import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, RotateCcw, Clock, Shuffle } from 'lucide-react'
import { getAllCourses, shuffle } from '../../data/quizData'
import { useAuth } from '../../hooks/useAuth'
import PageWrapper, { PageHeader } from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import ProgressBar from '../../components/ui/ProgressBar'

function FlashCard({ question, flipped, onFlip }) {
  return (
    <div
      className="relative w-full cursor-pointer select-none"
      style={{ perspective: '1000px', minHeight: 220 }}
      onClick={onFlip}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
      >
        {/* Front — question */}
        <div
          className="absolute inset-0 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3"
          style={{
            backfaceVisibility: 'hidden',
            background: 'var(--bg1)',
            border: '1px solid var(--accent-border)',
            minHeight: 220,
          }}
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Question</div>
          <p className="font-display font-bold text-base text-primary leading-snug">{question.q}</p>
          <div className="text-xs text-muted mt-2">Tap to reveal answer</div>
        </div>

        {/* Back — answer */}
        <div
          className="absolute inset-0 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'var(--green-dim)',
            border: '1px solid rgba(77,255,195,.3)',
            minHeight: 220,
          }}
        >
          <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--green)' }}>Answer</div>
          <p className="font-display font-bold text-base text-primary leading-snug">
            {question.opts[question.a]}
          </p>
          {question.explanation && (
            <p className="text-xs text-secondary leading-snug max-w-xs">{question.explanation}</p>
          )}
          <div className="text-xs text-muted mt-1">Tap to see question</div>
        </div>
      </motion.div>
    </div>
  )
}

export default function Brainstorm() {
  const navigate          = useNavigate()
  const { user }          = useAuth()
  const allCourses        = getAllCourses()
  const cats              = Object.keys(allCourses)

  const [selectedCat, setSelectedCat] = useState(cats[0] || '')
  const [cards,       setCards]       = useState([])
  const [idx,         setIdx]         = useState(0)
  const [flipped,     setFlipped]     = useState(false)
  const [known,       setKnown]       = useState([])
  const [unknown,     setUnknown]     = useState([])
  const [sessionDone, setSessionDone] = useState(false)

  // Per-card timer
  const [timeLeft,  setTimeLeft]  = useState(0)
  const [timerOn,   setTimerOn]   = useState(false)
  const [timerSecs, setTimerSecs] = useState(30)

  // Load cards when category changes
  useEffect(() => {
    if (!selectedCat) return
    const qs = allCourses[selectedCat]?.questions || []
    setCards(shuffle([...qs]))
    setIdx(0)
    setFlipped(false)
    setKnown([])
    setUnknown([])
    setSessionDone(false)
    setTimerOn(false)
  }, [selectedCat])

  // Timer countdown
  useEffect(() => {
    if (!timerOn || timeLeft <= 0) return
    const t = setTimeout(() => setTimeLeft(v => v - 1), 1000)
    return () => clearTimeout(t)
  }, [timerOn, timeLeft])

  useEffect(() => {
    if (timerOn && timeLeft === 0) {
      setTimerOn(false)
      handleNext('unknown')
    }
  }, [timeLeft, timerOn])

  function startCard() {
    setFlipped(false)
    if (timerSecs > 0) { setTimeLeft(timerSecs); setTimerOn(true) }
  }

  function handleFlip() {
    setFlipped(f => !f)
    setTimerOn(false)
  }

  function handleNext(result) {
    setTimerOn(false)
    if (result === 'known')   setKnown(k => [...k, idx])
    if (result === 'unknown') setUnknown(u => [...u, idx])
    const next = idx + 1
    if (next >= cards.length) { setSessionDone(true); return }
    setIdx(next)
    setFlipped(false)
    if (timerSecs > 0) { setTimeLeft(timerSecs); setTimerOn(true) }
  }

  function restart() {
    setCards(c => shuffle([...c]))
    setIdx(0); setFlipped(false)
    setKnown([]); setUnknown([])
    setSessionDone(false)
    setTimerOn(false)
  }

  const progress = cards.length ? ((idx) / cards.length) * 100 : 0
  const card     = cards[idx]

  return (
    <PageWrapper>
      <PageHeader
        title="🧠 Brainstorming"
        subtitle="Flip through flashcards to test your recall"
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
            <Clock size={13} /> Time Settings
          </Button>
        }
      />

      {/* Category selector */}
      <div>
        <div className="text-xs text-muted uppercase tracking-wider mb-2">Select Course</div>
        <div className="flex gap-2 flex-wrap">
          {cats.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{
                background:  selectedCat === cat ? 'var(--accent-dim)' : 'var(--bg1)',
                border:      `1px solid ${selectedCat === cat ? 'var(--accent)' : 'var(--border)'}`,
                color:       selectedCat === cat ? 'var(--accent)' : 'var(--t2)',
              }}
            >
              {allCourses[cat]?.icon} {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Timer setting */}
      <div className="flex items-center gap-3 p-3 rounded-xl"
        style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
        <Clock size={14} style={{ color: 'var(--t3)', flexShrink: 0 }} />
        <span className="text-sm text-secondary flex-1">Time per card</span>
        <div className="flex gap-1.5">
          {[0, 15, 30, 60].map(s => (
            <button key={s}
              onClick={() => { setTimerSecs(s); setTimerOn(false) }}
              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
              style={{
                background: timerSecs === s ? 'var(--accent-dim)' : 'var(--bg2)',
                border:     `1px solid ${timerSecs === s ? 'var(--accent)' : 'var(--border)'}`,
                color:      timerSecs === s ? 'var(--accent)' : 'var(--t2)',
              }}>
              {s === 0 ? 'Off' : `${s}s`}
            </button>
          ))}
        </div>
        {/* Link to time limit settings page */}
        <button onClick={() => navigate('/settings')}
          className="text-xs text-muted hover:text-accent transition-colors underline">
          More →
        </button>
      </div>

      {!cards.length ? (
        <div className="text-center py-10 text-muted text-sm">No cards available for this course</div>
      ) : sessionDone ? (
        /* Session complete */
        <motion.div className="rounded-2xl p-8 text-center"
          style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="font-display font-bold text-xl text-primary mb-2">Session Complete!</h3>
          <p className="text-secondary text-sm mb-6">
            You went through all {cards.length} cards
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6 max-w-xs mx-auto">
            <div className="rounded-xl p-3 text-center"
              style={{ background: 'var(--green-dim)', border: '1px solid rgba(77,255,195,.2)' }}>
              <div className="font-display font-black text-2xl" style={{ color: 'var(--green)' }}>{known.length}</div>
              <div className="text-xs text-muted">Knew it ✓</div>
            </div>
            <div className="rounded-xl p-3 text-center"
              style={{ background: 'var(--red-dim)', border: '1px solid rgba(255,107,138,.2)' }}>
              <div className="font-display font-black text-2xl" style={{ color: 'var(--red)' }}>{unknown.length}</div>
              <div className="text-xs text-muted">Still learning</div>
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            <Button variant="primary" onClick={restart}>
              <RotateCcw size={13} /> Study Again
            </Button>
            <Button variant="ghost" onClick={() => navigate('/quiz/config', { state: { category: selectedCat } })}>
              Take Quiz →
            </Button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Progress */}
          <div>
            <div className="flex justify-between text-xs text-muted mb-1.5">
              <span>Card {idx + 1} of {cards.length}</span>
              <div className="flex gap-3">
                {known.length   > 0 && <span style={{ color: 'var(--green)' }}>✓ {known.length}</span>}
                {unknown.length > 0 && <span style={{ color: 'var(--red)' }}>✗ {unknown.length}</span>}
              </div>
            </div>
            <ProgressBar value={idx} max={cards.length} height={4} />
          </div>

          {/* Timer bar */}
          {timerSecs > 0 && timerOn && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted">Time remaining</span>
                <span style={{ color: timeLeft <= 5 ? 'var(--red)' : 'var(--gold)' }}>{timeLeft}s</span>
              </div>
              <ProgressBar
                value={timeLeft} max={timerSecs} height={3}
                color={timeLeft <= 5 ? 'var(--red)' : 'var(--gold)'}
                animated={false}
              />
            </div>
          )}

          {/* Flash card */}
          <AnimatePresence mode="wait">
            <motion.div key={idx}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{   opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              <FlashCard question={card} flipped={flipped} onFlip={handleFlip} />
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          {flipped ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleNext('unknown')}
                className="py-3 rounded-2xl font-display font-semibold text-sm transition-all"
                style={{ background: 'var(--red-dim)', border: '1px solid rgba(255,107,138,.3)', color: 'var(--red)' }}
              >
                ✗ Still Learning
              </button>
              <button
                onClick={() => handleNext('known')}
                className="py-3 rounded-2xl font-display font-semibold text-sm transition-all"
                style={{ background: 'var(--green-dim)', border: '1px solid rgba(77,255,195,.3)', color: 'var(--green)' }}
              >
                ✓ Got It!
              </button>
            </div>
          ) : (
            <div className="flex gap-2 justify-center">
              <Button variant="ghost" size="md" onClick={handleFlip}>
                Reveal Answer
              </Button>
              <Button variant="secondary" size="md" onClick={() => handleNext('unknown')}>
                Skip <ChevronRight size={14} />
              </Button>
            </div>
          )}

          {/* Shuffle */}
          <div className="flex justify-center">
            <button onClick={restart}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors">
              <Shuffle size={12} /> Shuffle & Restart
            </button>
          </div>
        </>
      )}
    </PageWrapper>
  )
}
