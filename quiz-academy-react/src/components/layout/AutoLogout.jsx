import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import useQuizStore from '../../store/quizStore'
import { AutoLogoutPopup } from '../ui/SamsungPopup'

const IDLE_TIMEOUT   = 30 * 60 * 1000  // 30 minutes inactivity
const WARNING_TIME   = 60               // seconds warning before logout

export default function AutoLogout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const isQuizActive = useQuizStore(s => s.isActive)
  const [showWarning, setShowWarning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(WARNING_TIME)
  const idleTimer    = useRef(null)
  const countdownRef = useRef(null)

  const resetTimer = useCallback(() => {
    clearTimeout(idleTimer.current)
    clearInterval(countdownRef.current)
    if (showWarning) setShowWarning(false)
    if (!user) return

    // Smarter idle handling: while a quiz is actively in progress, don't arm
    // the logout timer at all. Reading/thinking about a question can easily
    // exceed the idle window without any mouse/keyboard activity — we don't
    // want someone logged out mid-exam. The timer resumes as soon as the
    // quiz ends (isQuizActive flips back to false and this effect re-runs).
    if (isQuizActive) return

    idleTimer.current = setTimeout(() => {
      setShowWarning(true)
      setSecondsLeft(WARNING_TIME)

      countdownRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            clearInterval(countdownRef.current)
            handleLogout()
            return 0
          }
          return s - 1
        })
      }, 1000)
    }, IDLE_TIMEOUT)
  }, [user, showWarning, isQuizActive])

  async function handleLogout() {
    setShowWarning(false)
    await logout()
    navigate('/login')
  }

  function handleStay() {
    setShowWarning(false)
    resetTimer()
  }

  useEffect(() => {
    if (!user) return
    const events = ['mousedown','mousemove','keydown','scroll','touchstart','click','wheel']
    events.forEach(e => document.addEventListener(e, resetTimer, { passive: true }))
    resetTimer()
    return () => {
      events.forEach(e => document.removeEventListener(e, resetTimer))
      clearTimeout(idleTimer.current)
      clearInterval(countdownRef.current)
    }
  }, [user, resetTimer])

  if (!user) return null

  return (
    <AutoLogoutPopup
      open={showWarning}
      onStay={handleStay}
      onLogout={handleLogout}
      secondsLeft={secondsLeft}
    />
  )
}
