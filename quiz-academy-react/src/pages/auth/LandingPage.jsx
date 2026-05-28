import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  Brain, Zap, Trophy, Users, BookOpen, Target, Flame,
  ArrowRight, CheckCircle, Star, ChevronDown, Sparkles,
  GraduationCap, BarChart3, Shield
} from 'lucide-react'

const FEATURES = [
  { icon: Brain,        title: 'AI-Powered Questions',  desc: 'Generate custom quizzes on any topic using Gemini AI. Upload PDFs and we build questions from your material.', color: '#6C8EFF', gradient: 'from-blue-500/20 to-purple-500/10' },
  { icon: Trophy,       title: '20-Level Progression',  desc: 'Climb from Newcomer to Transcendent. Earn XP, unlock achievements and level badges.', color: '#F5C842', gradient: 'from-yellow-500/20 to-orange-500/10' },
  { icon: Target,       title: 'CBT Exam Mode',          desc: 'Simulate real computer-based exams with no answer indicators — just like the real thing.', color: '#4DFFC3', gradient: 'from-green-500/20 to-teal-500/10' },
  { icon: Flame,        title: 'Streak System',          desc: 'Build daily habits. Protect your streak with freeze tokens and get push reminders.', color: '#FF7A45', gradient: 'from-orange-500/20 to-red-500/10' },
  { icon: Users,        title: 'Live Leaderboard',       desc: 'Compete globally. Weekly and all-time rankings with medals for the top 3.', color: '#B57BFF', gradient: 'from-purple-500/20 to-pink-500/10' },
  { icon: BookOpen,     title: 'Course Builder',         desc: 'Create your own courses, import JSON, or upload a PDF. Study your way.', color: '#4DFFC3', gradient: 'from-teal-500/20 to-green-500/10' },
]

const STATS = [
  { value: '15+',  label: 'Subjects',   icon: BookOpen },
  { value: '200+', label: 'Questions',  icon: Brain },
  { value: '20',   label: 'XP Levels',  icon: Trophy },
  { value: '100%', label: 'Free',       icon: Shield },
]

const TESTIMONIALS = [
  { name: 'Chidi O.', role: 'Final year student', text: 'Quiz Academy helped me ace my CBT exams. The AI-generated questions were spot on.', stars: 5, avatar: '🎓' },
  { name: 'Amara T.', role: 'JAMB candidate',     text: 'The streak system kept me studying every single day. Went from 40% to 85% in 3 weeks.', stars: 5, avatar: '⭐' },
  { name: 'Emeka B.', role: 'Undergraduate',      text: 'Course builder is incredible. I uploaded my lecture notes and it built my entire quiz set.', stars: 5, avatar: '🏆' },
]

const QUIZ_OPTIONS = ['Creative Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets']

function FloatingQuizCard() {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)

  function pick(i) {
    if (revealed) return
    setSelected(i)
    setTimeout(() => setRevealed(true), 300)
  }

  return (
    <div className="relative w-full max-w-sm mx-auto select-none">
      {/* Glow */}
      <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #6C8EFF 0%, transparent 70%)' }} />

      {/* Card */}
      <motion.div
        className="relative rounded-2xl p-5 shadow-2xl"
        style={{ background: 'rgba(12,16,24,0.95)', border: '1px solid rgba(108,142,255,0.3)', backdropFilter: 'blur(20px)' }}
        initial={{ opacity: 0, y: 30, rotateX: 5 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-xs ml-1" style={{ color: 'rgba(138,147,173,0.7)' }}>Question 3 of 10</span>
          </div>
          <motion.span
            className="text-xs font-bold px-2 py-1 rounded-lg"
            style={{ background: 'rgba(245,200,66,0.15)', color: '#F5C842', border: '1px solid rgba(245,200,66,0.3)' }}
            animate={{ opacity: [1, 0.6, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            ⏱ 0:42
          </motion.span>
        </div>

        {/* Progress */}
        <div className="h-1 rounded-full mb-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg,#6C8EFF,#4DFFC3)' }}
            initial={{ width: '20%' }} animate={{ width: '30%' }}
            transition={{ duration: 1.5, delay: 1 }} />
        </div>

        {/* Question */}
        <p className="font-semibold text-sm mb-4 leading-snug" style={{ color: '#EDF0FA' }}>
          What does CSS stand for?
        </p>

        {/* Options */}
        {QUIZ_OPTIONS.map((opt, i) => {
          const isCorrect = i === 1
          const isSelected = selected === i
          const showResult = revealed && (isCorrect || isSelected)
          return (
            <motion.button key={i}
              onClick={() => pick(i)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl mb-2 text-xs text-left transition-all"
              style={{
                background: revealed && isCorrect
                  ? 'rgba(77,255,195,0.15)'
                  : revealed && isSelected && !isCorrect
                    ? 'rgba(255,107,138,0.15)'
                    : isSelected
                      ? 'rgba(108,142,255,0.15)'
                      : 'rgba(255,255,255,0.04)',
                border: `1px solid ${
                  revealed && isCorrect
                    ? 'rgba(77,255,195,0.4)'
                    : revealed && isSelected && !isCorrect
                      ? 'rgba(255,107,138,0.4)'
                      : isSelected
                        ? 'rgba(108,142,255,0.4)'
                        : 'rgba(255,255,255,0.08)'
                }`,
                color: revealed && isCorrect ? '#4DFFC3' : isSelected && !revealed ? '#6C8EFF' : '#8A93AD',
                cursor: revealed ? 'default' : 'pointer',
              }}
              whileTap={revealed ? {} : { scale: 0.98 }}
            >
              <span className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: revealed && isCorrect ? '#4DFFC3' : isSelected && !revealed ? '#6C8EFF' : 'rgba(255,255,255,0.08)',
                  color: (revealed && isCorrect) || (isSelected && !revealed) ? '#07090E' : '#8A93AD',
                }}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
              {revealed && isCorrect && <span className="ml-auto">✓</span>}
              {revealed && isSelected && !isCorrect && <span className="ml-auto">✗</span>}
            </motion.button>
          )
        })}

        {revealed && (
          <motion.p className="text-xs mt-2 px-2" style={{ color: 'rgba(138,147,173,0.8)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            💡 CSS = Cascading Style Sheets — the language for styling web pages.
          </motion.p>
        )}
      </motion.div>

      {/* Floating badges */}
      <motion.div
        className="absolute -top-5 -right-5 px-3 py-2 rounded-xl text-xs font-bold shadow-xl"
        style={{ background: 'linear-gradient(135deg,#4DFFC3,#6C8EFF)', color: '#07090E' }}
        animate={{ y: [0, -6, 0], rotate: [0, -2, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
        +120 XP 🎉
      </motion.div>
      <motion.div
        className="absolute -bottom-5 -left-5 px-3 py-2 rounded-xl text-xs font-bold shadow-xl"
        style={{ background: 'linear-gradient(135deg,#F5C842,#FF7A45)', color: '#07090E' }}
        animate={{ y: [0, 6, 0], rotate: [0, 2, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}>
        🔥 7-day streak!
      </motion.div>
    </div>
  )
}

function TestimonialCard({ t, i }) {
  return (
    <motion.div
      className="p-5 rounded-2xl flex flex-col gap-3"
      style={{ background: 'rgba(12,16,24,0.8)', border: '1px solid rgba(108,142,255,0.15)', backdropFilter: 'blur(10px)' }}
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
      <div className="flex gap-0.5">
        {[...Array(t.stars)].map((_, s) => (
          <Star key={s} size={12} fill="#F5C842" style={{ color: '#F5C842' }} />
        ))}
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'rgba(237,240,250,0.8)' }}>"{t.text}"</p>
      <div className="flex items-center gap-2 mt-auto">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-base"
          style={{ background: 'rgba(108,142,255,0.2)' }}>{t.avatar}</div>
        <div>
          <div className="text-xs font-semibold" style={{ color: '#EDF0FA' }}>{t.name}</div>
          <div className="text-xs" style={{ color: 'rgba(138,147,173,0.7)' }}>{t.role}</div>
        </div>
      </div>
    </motion.div>
  )
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div style={{ background: '#07090E', color: '#EDF0FA', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(7,9,14,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(108,142,255,0.12)' : '1px solid transparent',
        }}>
        <div className="flex items-center justify-between px-6 md:px-16 py-4 max-w-screen-xl mx-auto">
          <motion.div className="flex items-center gap-2.5"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg,#6C8EFF,#4DFFC3)' }}>Q</div>
            <span className="font-bold text-base" style={{ color: '#EDF0FA' }}>Quiz Academy</span>
          </motion.div>

          <motion.div className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Link to="/login">
              <button className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ color: 'rgba(237,240,250,0.7)', border: '1px solid rgba(108,142,255,0.2)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(108,142,255,0.5)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(108,142,255,0.2)'}>
                Sign In
              </button>
            </Link>
            <Link to="/signup">
              <button className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all flex items-center gap-1.5"
                style={{ background: 'linear-gradient(135deg,#6C8EFF,#4DFFC3)', boxShadow: '0 0 20px rgba(108,142,255,0.3)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(108,142,255,0.5)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(108,142,255,0.3)'}>
                Get Started <ArrowRight size={14} />
              </button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Animated background grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(108,142,255,0.08) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }} />
        {/* Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: '#6C8EFF', transform: 'translate(-50%,-50%)' }} />
        <div className="absolute top-2/3 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-15"
          style={{ background: '#4DFFC3' }} />
        <div className="absolute bottom-0 left-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-10"
          style={{ background: '#B57BFF' }} />

        <div className="relative max-w-screen-xl mx-auto px-6 md:px-16 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-20 items-center">

            {/* Left */}
            <div>
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                style={{ background: 'rgba(108,142,255,0.12)', border: '1px solid rgba(108,142,255,0.3)', color: '#6C8EFF' }}
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Sparkles size={11} /> Powered by Gemini AI — 100% Free
              </motion.div>

              <motion.h1
                style={{ fontSize: 'clamp(2.8rem,6vw,5rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', color: '#EDF0FA' }}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                Master any subject,{' '}
                <span style={{ background: 'linear-gradient(135deg,#6C8EFF,#4DFFC3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  one quiz
                </span>{' '}at a time
              </motion.h1>

              <motion.p
                className="text-lg leading-relaxed mt-6 mb-8"
                style={{ color: 'rgba(237,240,250,0.6)', maxWidth: 500 }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                AI quiz platform with 20 XP levels, CBT exam mode, streak tracking, live leaderboard, and a full course builder — all free.
              </motion.p>

              {/* Perks */}
              <motion.ul className="flex flex-col gap-2.5 mb-8"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                {['No credit card required', 'AI generates questions from any material', 'CBT exam simulation with real exam feel', '20 levels + achievements + leaderboard'].map(p => (
                  <li key={p} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(237,240,250,0.7)' }}>
                    <CheckCircle size={14} style={{ color: '#4DFFC3', flexShrink: 0 }} /> {p}
                  </li>
                ))}
              </motion.ul>

              {/* CTAs */}
              <motion.div className="flex flex-wrap gap-3 mb-12"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Link to="/signup">
                  <button className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white transition-all"
                    style={{ background: 'linear-gradient(135deg,#6C8EFF,#4DFFC3)', boxShadow: '0 0 30px rgba(108,142,255,0.35)' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    Start for Free <ArrowRight size={16} />
                  </button>
                </Link>
                <Link to="/login">
                  <button className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all"
                    style={{ border: '1px solid rgba(108,142,255,0.3)', color: 'rgba(237,240,250,0.8)', background: 'rgba(108,142,255,0.06)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(108,142,255,0.6)'; e.currentTarget.style.background = 'rgba(108,142,255,0.12)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(108,142,255,0.3)'; e.currentTarget.style.background = 'rgba(108,142,255,0.06)' }}>
                    Sign In
                  </button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div className="grid grid-cols-4 gap-4 pt-8"
                style={{ borderTop: '1px solid rgba(108,142,255,0.12)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                {STATS.map(s => (
                  <div key={s.label} className="text-center">
                    <div className="font-black text-2xl" style={{ background: 'linear-gradient(135deg,#6C8EFF,#4DFFC3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(237,240,250,0.4)' }}>{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: interactive quiz card */}
            <motion.div className="relative flex justify-center lg:justify-end"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
              <div className="w-full max-w-sm">
                <FloatingQuizCard />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll hint */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          style={{ color: 'rgba(237,240,250,0.3)' }}
          animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <span className="text-xs">Scroll</span>
          <ChevronDown size={16} />
        </motion.div>
      </section>

      {/* ── STATS STRIP ── */}
      <section style={{ borderTop: '1px solid rgba(108,142,255,0.1)', borderBottom: '1px solid rgba(108,142,255,0.1)', background: 'rgba(108,142,255,0.03)' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-16 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { val: '15+',  label: 'Course subjects',       icon: '📚' },
            { val: '200+', label: 'Practice questions',    icon: '🧠' },
            { val: '20',   label: 'XP levels to unlock',   icon: '🏆' },
            { val: '100%', label: 'Free — always',         icon: '🛡️' },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-3xl font-black mb-1"
                style={{ background: 'linear-gradient(135deg,#6C8EFF,#4DFFC3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {s.val}
              </div>
              <div className="text-sm" style={{ color: 'rgba(237,240,250,0.4)' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-16 py-24">
        <motion.div className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: 'rgba(108,142,255,0.1)', border: '1px solid rgba(108,142,255,0.2)', color: '#6C8EFF' }}>
            <GraduationCap size={12} /> Built for serious learners
          </div>
          <h2 className="font-black mb-4" style={{ fontSize: 'clamp(2rem,4vw,3rem)', letterSpacing: '-0.02em', color: '#EDF0FA' }}>
            Everything you need to learn faster
          </h2>
          <p style={{ color: 'rgba(237,240,250,0.5)', fontSize: '1.1rem' }}>
            Not just another quiz app — a complete learning system
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              className="group relative p-6 rounded-2xl overflow-hidden cursor-default transition-all duration-300"
              style={{ background: 'rgba(12,16,24,0.8)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)' }}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, borderColor: `${f.color}40` }}>
              {/* Background glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(ellipse at 0% 0%, ${f.color}10, transparent 70%)` }} />
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}>
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: '#EDF0FA' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(237,240,250,0.5)' }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ borderTop: '1px solid rgba(108,142,255,0.08)', background: 'rgba(108,142,255,0.02)' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-16 py-24">
          <motion.div className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-black mb-4" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', letterSpacing: '-0.02em', color: '#EDF0FA' }}>
              Get started in 3 steps
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px"
              style={{ background: 'linear-gradient(90deg, rgba(108,142,255,0), rgba(108,142,255,0.4), rgba(108,142,255,0))' }} />
            {[
              { step: '01', icon: '🎯', title: 'Create your account', desc: 'Sign up free in seconds. No credit card needed. Start immediately.' },
              { step: '02', icon: '📚', title: 'Pick a course or build one', desc: 'Choose from built-in subjects or create your own using AI or JSON upload.' },
              { step: '03', icon: '🏆', title: 'Quiz, earn XP, level up', desc: 'Complete daily challenges, climb the leaderboard, and track your mastery.' },
            ].map((s, i) => (
              <motion.div key={s.step} className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl"
                style={{ background: 'rgba(12,16,24,0.6)', border: '1px solid rgba(108,142,255,0.1)' }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                    style={{ background: 'rgba(108,142,255,0.1)', border: '1px solid rgba(108,142,255,0.2)' }}>
                    {s.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ background: 'linear-gradient(135deg,#6C8EFF,#4DFFC3)', color: '#07090E' }}>
                    {i + 1}
                  </div>
                </div>
                <h3 className="font-bold text-base" style={{ color: '#EDF0FA' }}>{s.title}</h3>
                <p className="text-sm" style={{ color: 'rgba(237,240,250,0.5)' }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-16 py-24">
        <motion.div className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center justify-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#F5C842" style={{ color: '#F5C842' }} />)}
          </div>
          <h2 className="font-black mb-2" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', letterSpacing: '-0.02em', color: '#EDF0FA' }}>
            Loved by students
          </h2>
          <p style={{ color: 'rgba(237,240,250,0.4)' }}>Real results from real learners</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => <TestimonialCard key={t.name} t={t} i={i} />)}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-16 pb-24">
        <motion.div className="relative overflow-hidden rounded-3xl p-12 md:p-20 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(108,142,255,0.15) 0%, rgba(77,255,195,0.08) 50%, rgba(181,123,255,0.1) 100%)', border: '1px solid rgba(108,142,255,0.25)' }}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>

          {/* Grid pattern inside CTA */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(108,142,255,0.06) 1px, transparent 0)',
              backgroundSize: '30px 30px',
            }} />
          {/* Blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: '#6C8EFF', transform: 'translate(30%,-30%)' }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: '#4DFFC3', transform: 'translate(-30%,30%)' }} />

          <div className="relative">
            <div className="text-4xl mb-4">🚀</div>
            <h2 className="font-black mb-4" style={{ fontSize: 'clamp(2rem,4vw,3.5rem)', letterSpacing: '-0.02em', color: '#EDF0FA' }}>
              Ready to level up?
            </h2>
            <p className="text-lg mb-8 mx-auto" style={{ color: 'rgba(237,240,250,0.6)', maxWidth: 420 }}>
              Join thousands of students who study smarter with Quiz Academy. Free forever.
            </p>
            <Link to="/signup">
              <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base text-white transition-all"
                style={{ background: 'linear-gradient(135deg,#6C8EFF,#4DFFC3)', boxShadow: '0 0 40px rgba(108,142,255,0.4)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(108,142,255,0.6)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(108,142,255,0.4)' }}>
                Create Free Account <ArrowRight size={18} />
              </button>
            </Link>
            <p className="text-sm mt-4" style={{ color: 'rgba(237,240,250,0.3)' }}>No credit card · No limits · Start in seconds</p>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(108,142,255,0.1)' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-16 py-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white"
              style={{ background: 'linear-gradient(135deg,#6C8EFF,#4DFFC3)', fontSize: 12 }}>Q</div>
            <span className="text-sm font-medium" style={{ color: 'rgba(237,240,250,0.5)' }}>Quiz Academy v4</span>
          </div>
          <div className="flex gap-6 text-sm" style={{ color: 'rgba(237,240,250,0.4)' }}>
            <Link to="/login"  className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
          <p className="text-xs" style={{ color: 'rgba(237,240,250,0.25)' }}>© {new Date().getFullYear()} Quiz Academy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
