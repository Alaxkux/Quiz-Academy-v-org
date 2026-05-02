import { useNavigate } from 'react-router-dom'
import useQuizStore from '../store/quizStore'

export function useBack(fallback = '/dashboard') {
  const navigate = useNavigate()
  const popNav   = useQuizStore(s => s.popNav)

  return function goBack() {
    const prev = popNav()
    if (prev && prev !== window.location.pathname) navigate(prev)
    else navigate(fallback)
  }
}
