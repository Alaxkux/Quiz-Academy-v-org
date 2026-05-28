import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Scroll the inner app scroll container (used in AppShell)
    const el = document.getElementById('main-scroll-area')
    if (el) {
      el.scrollTo({ top: 0, behavior: 'instant' })
    }
    // Also scroll window for good measure (auth pages, landing)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}