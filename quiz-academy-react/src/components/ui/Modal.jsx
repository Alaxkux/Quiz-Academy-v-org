import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'

// ── Global scroll lock hook ──
function useScrollLock(active) {
  useEffect(() => {
    if (!active) return
    const prev = document.body.style.overflow
    const prevPos = document.body.style.position
    const scrollY = window.scrollY

    // iOS Safari needs position:fixed to truly lock scroll
    document.body.style.overflow  = 'hidden'
    document.body.style.position  = 'fixed'
    document.body.style.top       = `-${scrollY}px`
    document.body.style.left      = '0'
    document.body.style.right     = '0'

    return () => {
      document.body.style.overflow  = prev
      document.body.style.position  = prevPos
      document.body.style.top       = ''
      document.body.style.left      = ''
      document.body.style.right     = ''
      window.scrollTo(0, scrollY)
    }
  }, [active])
}

export default function Modal({ open, onClose, title, icon, children, maxWidth = '420px' }) {
  useScrollLock(open)

  useEffect(() => {
    if (!open) return
    const handle = e => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={e => { if (e.target === e.currentTarget) onClose?.() }}
        >
          <motion.div
            className="w-full rounded-2xl p-6 text-center"
            style={{
              background: 'var(--bg1)',
              border: '1px solid var(--border)',
              maxWidth,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.93, y: 16  }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            onClick={e => e.stopPropagation()}
          >
            {icon  && <div className="text-4xl mb-3">{icon}</div>}
            {title && <h3 className="font-display font-bold text-lg text-primary mb-2">{title}</h3>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, icon = '⚠️', confirmLabel = 'Confirm', danger = true }) {
  return (
    <Modal open={open} onClose={onClose} title={title} icon={icon}>
      <p className="text-secondary text-sm leading-relaxed mb-5">{message}</p>
      <div className="flex gap-2 justify-center">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={() => { onClose(); onConfirm?.() }}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

// ── Reusable centered overlay wrapper — use this instead of rolling inline modals ──
export function Overlay({ open, onClose, children, maxWidth = '480px' }) {
  useScrollLock(open)

  useEffect(() => {
    if (!open) return
    const handle = e => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={e => { if (e.target === e.currentTarget) onClose?.() }}
        >
          <motion.div
            className="w-full rounded-2xl"
            style={{
              background: 'var(--bg1)',
              border: '1px solid var(--border)',
              maxWidth,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.93, y: 16  }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            onClick={e => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
