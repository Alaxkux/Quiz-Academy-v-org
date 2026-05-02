import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'

export default function Modal({ open, onClose, title, icon, children, maxWidth = '400px' }) {
  // Close on Escape key
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={e => { if (e.target === e.currentTarget) onClose?.() }}
        >
          <motion.div
            className="w-full rounded-2xl p-6 text-center"
            style={{ background: 'var(--bg1)', border: '1px solid var(--border)', maxWidth }}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.95, y: 10  }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {icon && <div className="text-4xl mb-3">{icon}</div>}
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
