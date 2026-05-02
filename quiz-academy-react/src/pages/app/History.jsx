import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { historyApi } from '../../api/quiz'
import { dateGroup, scoreColor, scoreEmoji, fmtNum } from '../../utils/format'
import PageWrapper, { PageHeader } from '../../components/layout/PageWrapper'
import { SkeletonPage } from '../../components/ui/Skeleton'
import Button from '../../components/ui/Button'

function HistoryItem({ entry, realIndex, onClick }) {
  const emoji = scoreEmoji(entry.percentage)
  const color = scoreColor(entry.percentage)

  return (
    <motion.div
      className="flex items-center gap-3 py-3 border-b last:border-0 cursor-pointer transition-opacity hover:opacity-75"
      style={{ borderColor: 'var(--border)' }}
      onClick={onClick}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <span className="text-xl flex-shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-primary truncate">
          {entry.category}
          {entry.isDailyChallenge && (
            <span className="ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid rgba(245,200,66,.2)' }}>
              ⭐ Daily
            </span>
          )}
        </div>
        <div className="text-xs text-muted">
          {new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          {' · '}{entry.timeTaken}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right hidden sm:block">
          <div className="text-xs text-secondary">{entry.score}/{entry.total}</div>
          <div className="text-xs font-medium" style={{ color: 'var(--green)' }}>+{entry.points}pts</div>
        </div>
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center font-display font-bold text-xs border-2 flex-shrink-0"
          style={{ borderColor: color, color }}
        >
          {entry.percentage}%
        </div>
      </div>
    </motion.div>
  )
}

export default function History() {
  const navigate   = useNavigate()
  const { user }   = useAuth()
  const [items,    setItems]    = useState([])
  const [page,     setPage]     = useState(1)
  const [hasMore,  setHasMore]  = useState(false)
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => { loadPage(1, true) }, [])

  async function loadPage(p, reset = false) {
    if (reset) setLoading(true)
    else setLoadingMore(true)
    try {
      const data = await historyApi.getPage(p, 10)
      setItems(prev => reset ? data.history : [...prev, ...data.history])
      setHasMore(data.hasMore)
      setTotal(data.total)
      setPage(p)
    } catch {
      // Fallback to local user history
      const local = (user?.history || []).slice().reverse()
      setItems(local.map((h, i) => ({ ...h, _index: (user.history.length - 1 - i), hasReview: !!h.questionData?.length })))
      setTotal(local.length)
      setHasMore(false)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  async function handleClick(entry) {
    // Try to get questionData from server if not present
    if (entry.hasReview !== false) {
      try {
        const data = await historyApi.getEntry(entry._index)
        if (data.entry?.questionData?.length) {
          navigate('/quiz/review', { state: { result: data.entry } })
          return
        }
      } catch {
        // If local entry has questionData, use it
        const local = user?.history?.[entry._index]
        if (local?.questionData?.length) {
          navigate('/quiz/review', { state: { result: local } })
          return
        }
      }
    }
  }

  if (loading) return <PageWrapper><SkeletonPage /></PageWrapper>

  if (!items.length) {
    return (
      <PageWrapper>
        <PageHeader title="📊 History" subtitle="Your past quiz performances" />
        <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--bg1)', border: '1px dashed var(--border)' }}>
          <div className="text-5xl mb-3">📋</div>
          <h3 className="font-display font-bold text-base text-primary mb-2">No history yet</h3>
          <p className="text-sm text-secondary mb-5">Complete your first quiz to see it here</p>
          <Button variant="primary" onClick={() => navigate('/categories')}>Browse Courses</Button>
        </div>
      </PageWrapper>
    )
  }

  // Group by date label
  const grouped = {}
  items.forEach(entry => {
    const group = dateGroup(entry.date)
    if (!grouped[group]) grouped[group] = []
    grouped[group].push(entry)
  })

  const ORDER = ['Today', 'Yesterday', 'This Week', 'Earlier']
  const sortedGroups = ORDER.filter(g => grouped[g])

  return (
    <PageWrapper>
      <PageHeader
        title="📊 History"
        subtitle={`${fmtNum(total)} quiz${total !== 1 ? 'zes' : ''} completed · Tap any to review`}
      />

      <div className="flex flex-col gap-4">
        {sortedGroups.map(group => (
          <div key={group}>
            <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 px-1">
              {group}
            </div>
            <div
              className="rounded-2xl px-4"
              style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
            >
              {grouped[group].map((entry, i) => (
                <HistoryItem
                  key={i}
                  entry={entry}
                  realIndex={entry._index}
                  onClick={() => handleClick(entry)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <Button
          variant="secondary"
          size="md"
          className="w-full"
          loading={loadingMore}
          onClick={() => loadPage(page + 1)}
        >
          Load More
        </Button>
      )}
    </PageWrapper>
  )
}
