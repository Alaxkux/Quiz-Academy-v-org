import { useCallback } from 'react'
import { getStoredTheme } from '../data/themes'
import { useAuth } from './useAuth'

export function useTheme() {
  const { setTheme } = useAuth()
  const currentTheme = getStoredTheme()

  const toggle = useCallback(() => {
    const lightThemes = ['snow', 'paper', 'rose']
    const isLight = lightThemes.includes(currentTheme)
    setTheme(isLight ? 'midnight' : 'snow')
  }, [currentTheme, setTheme])

  return { currentTheme, setTheme, toggle }
}
