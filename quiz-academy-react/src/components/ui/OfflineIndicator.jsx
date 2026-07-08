import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi } from 'lucide-react'

export default function OfflineIndicator() {
  const [offline,    setOffline]    = useState(!navigator.onLine)
  const [showBack,   setShowBack]   = useState(false)

  useEffect(() => {
    function goOffline() { setOffline(true); setShowBack(false) }
    function goOnline()  { setOffline(false); setShowBack(true); setTimeout(() => setShowBack(false), 3000) }
    window.addEventListener('offline', goOffline)
    window.addEventListener('online',  goOnline)
    return () => { window.removeEventListener('offline', goOffline); window.removeEventListener('online', goOnline) }
  }, [])

  return (
    <AnimatePresence>
      {(offline || showBack) && (
        <motion.div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold shadow-xl"
          style={{
            background: offline ? 'var(--red)' : 'var(--green)',
            color: '#fff',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0,   scale: 1   }}
          exit={{   opacity: 0, y: -20, scale: 0.9  }}
        >
          {offline ? <WifiOff size={14} /> : <Wifi size={14} />}
          {offline ? 'No internet connection' : 'Back online!'}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
