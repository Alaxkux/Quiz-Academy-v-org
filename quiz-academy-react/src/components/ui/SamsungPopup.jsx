import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useScrollLock } from './Modal'

/**
 * Samsung-style popup — rounded, centered, clean
 * Usage:
 *   <SamsungPopup open={open} onClose={fn} title="Title" icon="🤖">
 *     <p>Content here</p>
 *   </SamsungPopup>
 */
export default function SamsungPopup({
  open, onClose, title, icon, children,
  maxWidth = '340px', hideClose = false, autoDismiss = 0,
}) {
  useScrollLock(open)

  // Auto dismiss
  useEffect(() => {
    if (!open || !autoDismiss) return
    const t = setTimeout(() => onClose?.(), autoDismiss)
    return () => clearTimeout(t)
  }, [open, autoDismiss])

  // Keyboard close
  useEffect(() => {
    if (!open) return
    const fn = e => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [open])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center p-5"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={e => { if (e.target === e.currentTarget) onClose?.() }}
        >
          <motion.div
            className="samsung-popup w-full relative"
            style={{
              maxWidth,
              background: 'var(--bg1)',
              borderRadius: '28px',
              border: '1px solid var(--border)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}
            initial={{ scale: 0.85, y: 20, opacity: 0 }}
            animate={{ scale: 1,    y: 0,  opacity: 1 }}
            exit={{   scale: 0.85, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Top accent bar */}
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,var(--accent),var(--green))' }} />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {icon && (
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}>
                      {icon}
                    </div>
                  )}
                  {title && (
                    <h3 className="font-display font-bold text-base text-primary leading-tight">{title}</h3>
                  )}
                </div>
                {!hideClose && (
                  <button onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors ml-2 flex-shrink-0"
                    style={{ background: 'var(--bg2)', color: 'var(--t3)' }}>
                    <X size={14} />
                  </button>
                )}
              </div>

              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

// ── AI Credits popup ──
export function AICreditsPopup({ open, onClose, used, limit = 10 }) {
  const remaining = limit - used
  const pct = (used / limit) * 100
  const color = remaining <= 2 ? 'var(--red)' : remaining <= 5 ? 'var(--gold)' : 'var(--green)'

  return (
    <SamsungPopup open={open} onClose={onClose} title="AI Credits" icon="🤖" autoDismiss={4000}>
      <div className="flex flex-col gap-3">
        <div className="flex items-end justify-between">
          <span className="text-sm text-secondary">Used today</span>
          <span className="font-display font-black text-2xl" style={{ color }}>
            {used}<span className="text-base text-muted font-normal">/{limit}</span>
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bg2)' }}>
          <motion.div className="h-full rounded-full"
            style={{ background: pct >= 80 ? 'var(--red)' : pct >= 50 ? 'var(--gold)' : 'linear-gradient(90deg,var(--accent),var(--green))' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        <p className="text-sm text-secondary">
          {remaining <= 0
            ? '🚫 No credits left today. Resets at midnight.'
            : remaining === 1
              ? '⚠️ Last credit remaining for today!'
              : `✨ ${remaining} request${remaining !== 1 ? 's' : ''} remaining today`
          }
        </p>

        <p className="text-xs text-muted">Credits reset daily at midnight. Limit: {limit} AI requests/day.</p>

        <button onClick={onClose}
          className="w-full py-3 rounded-2xl text-sm font-semibold transition-all mt-1"
          style={{ background: 'var(--accent)', color: '#fff' }}>
          Got it
        </button>
      </div>
    </SamsungPopup>
  )
}

// ── Confirm popup — Samsung style ──
export function SamsungConfirm({
  open, onClose, onConfirm,
  title, message, icon = '⚠️',
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  danger = true,
}) {
  return (
    <SamsungPopup open={open} onClose={onClose} title={title} icon={icon} hideClose>
      <p className="text-sm text-secondary leading-relaxed mb-5">{message}</p>
      <div className="flex gap-2">
        <button onClick={onClose}
          className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t2)' }}>
          {cancelLabel}
        </button>
        <button onClick={() => { onClose(); onConfirm?.() }}
          className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white transition-all"
          style={{ background: danger ? 'var(--red)' : 'var(--accent)' }}>
          {confirmLabel}
        </button>
      </div>
    </SamsungPopup>
  )
}

// ── Auto logout warning popup ──
export function AutoLogoutPopup({ open, onStay, onLogout, secondsLeft }) {
  return (
    <SamsungPopup open={open} onClose={onStay} title="Still there?" icon="⏰" hideClose>
      <p className="text-sm text-secondary mb-2">
        You've been inactive. You'll be signed out in <strong style={{ color: 'var(--red)' }}>{secondsLeft}s</strong>.
      </p>
      <div className="h-1.5 rounded-full overflow-hidden mb-5" style={{ background: 'var(--bg2)' }}>
        <motion.div className="h-full rounded-full"
          style={{ background: 'var(--red)' }}
          animate={{ width: `${(secondsLeft / 60) * 100}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>
      <div className="flex gap-2">
        <button onClick={onLogout}
          className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t2)' }}>
          Sign Out
        </button>
        <button onClick={onStay}
          className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white"
          style={{ background: 'var(--accent)' }}>
          Stay Signed In
        </button>
      </div>
    </SamsungPopup>
  )
}
