import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import ReviewDots from '../../components/quiz/ReviewDots'
import Button from '../../components/ui/Button'
import { scoreColor } from '../../utils/format'
import { useBack } from '../../hooks/useBack'

export default function Review() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const goBack    = useBack('/quiz/results')
  const { result } = location.state || {}

  const [idx, setIdx] = useState(0)

  if (!result?.questionData?.length) {
    return (
      <PageWrapper>
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="font-display font-bold text-base text-primary mb-2">Review not available</h3>
          <p className="text-secondary text-sm mb-5">Only available for recently completed quizzes.</p>
          <Button variant="primary" onClick={() => navigate('/history')}>View History</Button>
        </div>
      </PageWrapper>
    )
  }

  const { questionData, category, score, total, percentage, timeTaken } = result
  const item    = questionData[idx]
  const correct = questionData.filter(q => q.isCorrect).length

  function go(dir) {
    setIdx(i => Math.max(0, Math.min(questionData.length - 1, i + dir)))
  }

  const icon = item.isCorrect ? '✅' : item.userAnswer === null ? '⏭️' : '❌'
  const scoreCol = scoreColor(percentage)

  return (
    <PageWrapper>
      {/* Back */}
      <button
        onClick={goBack}
        className="flex items-center gap-1.5 text-sm text-secondary hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={15} /> Back to Results
      </button>

      {/* Header */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h2 className="font-display font-bold text-base text-primary">📋 {category}</h2>
            <p className="text-xs text-secondary">
              {correct}/{total} correct
              {' · '}
              <span style={{ color: scoreCol }}>{percentage}%</span>
              {' · '}{timeTaken}
            </p>
          </div>
          <div className="text-sm text-muted flex-shrink-0">
            Q{idx + 1} of {questionData.length}
          </div>
        </div>
        <ReviewDots
          questionData={questionData}
          currentIndex={idx}
          onSelect={setIdx}
        />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          className="rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0  }}
          exit={{   opacity: 0, x: -16 }}
          transition={{ duration: 0.18 }}
        >
          {/* Q number + status */}
          <div className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <span className="text-xs font-medium text-muted uppercase tracking-wider">
              Question {idx + 1}
            </span>
          </div>

          {/* Question text */}
          <p className="font-display font-bold text-sm md:text-base text-primary leading-snug">
            {item.question}
          </p>

          {/* Options */}
          <div className="flex flex-col gap-2">
            {item.options.map((opt, i) => {
              const isCorrect   = i === item.correctIndex
              const isWrong     = i === item.userAnswer && !item.isCorrect
              const isUserAnswer = i === item.userAnswer

              let bg     = 'var(--bg2)'
              let border = 'var(--border)'
              let color  = 'var(--t2)'
              let keyBg  = 'var(--border)'
              let keyCol = 'var(--t3)'

              if (isCorrect) {
                bg = 'var(--green-dim)'; border = 'var(--green)'; color = 'var(--green)'; keyBg = 'var(--green)'; keyCol = '#0a1a12'
              } else if (isWrong) {
                bg = 'var(--red-dim)'; border = 'var(--red)'; color = 'var(--red)'; keyBg = 'var(--red)'; keyCol = '#fff'
              }

              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-xl"
                  style={{ background: bg, border: `1px solid ${border}`, color }}
                >
                  <span
                    className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: keyBg, color: keyCol }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm flex-1">{opt}</span>
                  {isCorrect && <span className="text-sm font-bold flex-shrink-0">✓</span>}
                  {isWrong   && <span className="text-sm font-bold flex-shrink-0">✗</span>}
                </div>
              )
            })}
          </div>

          {/* Skipped note */}
          {item.userAnswer === null && (
            <p className="text-xs" style={{ color: 'var(--gold)' }}>⏰ Skipped — time ran out</p>
          )}

          {/* Explanation */}
          {item.explanation && (
            <div
              className="rounded-xl p-3 text-sm leading-relaxed"
              style={{ background: 'var(--bg2)', borderLeft: '3px solid var(--accent)', color: 'var(--t2)' }}
            >
              💡 {item.explanation}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="secondary" size="md" onClick={() => go(-1)} disabled={idx === 0}>
          <ChevronLeft size={16} /> Prev
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost"     size="sm" onClick={() => navigate('/categories')}>New Quiz</Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/history')}>History</Button>
        </div>
        <Button variant="primary" size="md" onClick={() => go(1)} disabled={idx === questionData.length - 1}>
          Next <ChevronRight size={16} />
        </Button>
      </div>
    </PageWrapper>
  )
}
