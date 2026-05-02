import { create } from 'zustand'
import { calculateXP } from '../data/levels'

const useQuizStore = create((set, get) => ({
  // ── Active quiz state ──
  quiz:        null,   // { category, questions, currentIndex, answers, revealMode, timePerQ, ... }
  timeElapsed: 0,
  isActive:    false,
  navHistory:  [],     // page history stack for back button

  // ── Config page state ──
  pendingConfig: null,  // options user set before starting

  // ── START QUIZ ──
  startQuiz(options) {
    const { category, questions, isDailyChallenge, revealMode, difficulty, timePerQ } = options
    if (!questions?.length) return false
    const quiz = {
      category:         category || 'Quiz',
      difficulty:       difficulty || 'all',
      isDailyChallenge: isDailyChallenge || false,
      questions,
      currentIndex:     0,
      answers:          [],  // -1 = skipped, null = unanswered
      startTime:        Date.now(),
      timeElapsed:      0,
      revealMode:       revealMode || 'after',  // 'during' | 'after'
      timePerQ:         timePerQ || 0,
      _tabLeft:         0,
    }
    localStorage.setItem('qa_inProgressQuiz', JSON.stringify(quiz))
    set({ quiz, timeElapsed: 0, isActive: true })
    return true
  },

  // ── RESUME ──
  resumeQuiz() {
    const saved = localStorage.getItem('qa_inProgressQuiz')
    if (!saved) return false
    try {
      const quiz = JSON.parse(saved)
      if (!quiz.questions?.length) return false
      set({ quiz, timeElapsed: quiz.timeElapsed || 0, isActive: true })
      return true
    } catch { return false }
  },

  // ── SELECT ANSWER ──
  // During mode: toggleable — can switch before Next
  // After mode: also toggleable until Next
  selectAnswer(idx) {
    const { quiz } = get()
    if (!quiz) return
    const current = [...quiz.answers]
    // Toggle off if same answer selected again
    if (current[quiz.currentIndex] === idx) {
      current[quiz.currentIndex] = undefined
    } else {
      current[quiz.currentIndex] = idx
    }
    const updated = { ...quiz, answers: current }
    localStorage.setItem('qa_inProgressQuiz', JSON.stringify(updated))
    set({ quiz: updated })
  },

  // ── NEXT QUESTION ──
  nextQuestion() {
    const { quiz } = get()
    if (!quiz) return false
    if (quiz.currentIndex < quiz.questions.length - 1) {
      const updated = { ...quiz, currentIndex: quiz.currentIndex + 1 }
      localStorage.setItem('qa_inProgressQuiz', JSON.stringify(updated))
      set({ quiz: updated })
      return 'next'
    }
    return 'finish'
  },

  // ── PREV QUESTION ──
  prevQuestion() {
    const { quiz } = get()
    if (!quiz || quiz.currentIndex === 0) return
    const updated = { ...quiz, currentIndex: quiz.currentIndex - 1 }
    set({ quiz: updated })
  },

  // ── TICK TIMER ──
  tick() {
    const { quiz, timeElapsed } = get()
    if (!quiz) return
    const newTime = timeElapsed + 1
    const updated = { ...quiz, timeElapsed: newTime }
    localStorage.setItem('qa_inProgressQuiz', JSON.stringify(updated))
    set({ quiz: updated, timeElapsed: newTime })
  },

  // ── TAB LEAVE ──
  tabLeft() {
    const { quiz } = get()
    if (!quiz) return 0
    const count = (quiz._tabLeft || 0) + 1
    set({ quiz: { ...quiz, _tabLeft: count } })
    return count
  },

  // ── QUIT ──
  quitQuiz() {
    localStorage.removeItem('qa_inProgressQuiz')
    set({ quiz: null, timeElapsed: 0, isActive: false })
  },

  // ── FINISH — returns result object ──
  finishQuiz() {
    const { quiz, timeElapsed } = get()
    if (!quiz) return null

    const secs    = timeElapsed
    let correct   = 0
    quiz.questions.forEach((q, i) => {
      if (quiz.answers[i] === q.a) correct++
    })

    const pct  = Math.round((correct / quiz.questions.length) * 100)
    const pts  = Math.round(pct * 10) + (quiz.isDailyChallenge ? 50 : 0)
    const xp   = calculateXP(pct, quiz.questions.length, quiz.isDailyChallenge, quiz.difficulty)

    const result = {
      category:         quiz.category,
      date:             new Date().toISOString(),
      score:            correct,
      total:            quiz.questions.length,
      percentage:       pct,
      points:           pts,
      xpEarned:         xp,
      timeTaken:        `${Math.floor(secs / 60)}m ${secs % 60}s`,
      timeTakenSeconds: secs,
      isDailyChallenge: quiz.isDailyChallenge,
      revealMode:       quiz.revealMode,
      questionData:     quiz.questions.map((q, i) => ({
        question:     q.q,
        options:      q.opts,
        correctIndex: q.a,
        userAnswer:   quiz.answers[i] !== undefined && quiz.answers[i] !== -1 ? quiz.answers[i] : null,
        explanation:  q.explanation,
        isCorrect:    quiz.answers[i] === q.a,
      })),
    }

    localStorage.removeItem('qa_inProgressQuiz')
    set({ quiz: null, timeElapsed: 0, isActive: false })
    return result
  },

  // ── NAVIGATION HISTORY ──
  pushNav(page) {
    set(s => ({ navHistory: [...s.navHistory, page] }))
  },
  popNav() {
    const { navHistory } = get()
    if (!navHistory.length) return null
    const prev    = navHistory[navHistory.length - 1]
    const updated = navHistory.slice(0, -1)
    set({ navHistory: updated })
    return prev
  },
  clearNav() {
    set({ navHistory: [] })
  },

  // ── PENDING CONFIG ──
  setPendingConfig(cfg) { set({ pendingConfig: cfg }) },
  clearPendingConfig()  { set({ pendingConfig: null }) },
}))

export default useQuizStore
