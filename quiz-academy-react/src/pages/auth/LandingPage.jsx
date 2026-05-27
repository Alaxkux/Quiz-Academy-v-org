import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Zap, Trophy, Users, BookOpen, Target, Flame, ArrowRight, Star, CheckCircle } from 'lucide-react'
import Button from '../../components/ui/Button'

const FEATURES = [
  { icon: Brain,    title: 'AI-Powered Questions',  desc: 'Generate custom quizzes on any topic using Gemini AI. Upload PDFs and we build questions from your material.', color: 'var(--accent)' },
  { icon: Trophy,   title: '20-Level Progression',  desc: 'Climb from Newcomer to Transcendent. Earn XP, unlock achievements and level badges.', color: 'var(--gold)' },
  { icon: Target,   title: 'CBT Exam Mode',          desc: 'Simulate real computer-based exams with no answer indicators — just like the real thing.', color: 'var(--green)' },
  { icon: Flame,    title: 'Streak System',          desc: 'Build daily habits. Protect your streak with freeze tokens and get push reminders.', color: '#ff6b35' },
  { icon: Users,    title: 'Live Leaderboard',       desc: 'Compete globally. Weekly and all-time rankings with medals for the top 3.', color: 'var(--accent)' },
  { icon: BookOpen, title: 'Course Builder',         desc: 'Create your own courses, import JSON, or upload a PDF. Study your way.', color: 'var(--green)' },
]

const STATS = [
  { value: '15+',  label: 'Subjects'  },
  { value: '200+', label: 'Questions' },
  { value: '20',   label: 'Levels'    },
  { value: '100%', label: 'Free'      },
]

const PERKS = [
  'No credit card required',
  'AI question generation',
  '20 XP levels to unlock',
  'CBT exam simulation',
]

function QuizPreview() {
  const opts = ['Creative Style Sheets','Cascading Style Sheets','Computer Style Sheets','Colorful Style Sheets']
  return (
    <motion.div
      className="relative w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
    >
      {/* Glow behind card */}
      <div className="absolute inset-0 rounded-3xl blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, var(--accent), transparent 70%)', transform: 'scale(1.1)' }} />

      <div className="relative rounded-2xl p-5 shadow-2xl"
        style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted font-medium">Question 3 of 10</span>
          <span className="text-xs font-bold px-2 py-1 rounded-full"
            style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>⏱ 0:42</span>
        </div>
        <div className="h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: 'var(--border)' }}>
          <motion.div className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg,var(--accent),var(--green))' }}
            initial={{ width: '20%' }} animate={{ width: '30%' }}
            transition={{ duration: 1, delay: 0.8 }} />
        </div>
        <p className="font-display font-semibold text-sm mb-4 leading-snug text-primary">
          What does CSS stand for?
        </p>
        {opts.map((opt, i) => (
          <motion.div key={i}
            className="flex items-center gap-3 p-2.5 rounded-xl mb-2 text-sm"
            style={{
              background: i === 1 ? 'var(--accent-dim)' : 'var(--bg2)',
              border: `1px solid ${i === 1 ? 'var(--accent)' : 'var(--border)'}`,
              color: i === 1 ? 'var(--accent)' : 'var(--t2)',
            }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.08 }}
          >
            <span className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: i === 1 ? 'var(--accent)' : 'var(--border)', color: i === 1 ? '#fff' : 'var(--t3)' }}>
              {String.fromCharCode(65 + i)}
            </span>
            {opt}
          </motion.div>
        ))}
      </div>

      {/* Floating badges */}
      <motion.div className="absolute -top-4 -right-4 px-3 py-2 rounded-xl text-xs font-bold shadow-xl"
        style={{ background: 'var(--green)', color: '#0a1a12' }}
        animate={{ y: [0,-5,0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}>
        +120 XP 🎉
      </motion.div>
      <motion.div className="absolute -bottom-4 -left-4 px-3 py-2 rounded-xl text-xs font-bold shadow-xl"
        style={{ background: 'var(--gold)', color: '#1a1000' }}
        animate={{ y: [0,5,0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: 0.5 }}>
        🔥 7-day streak!
      </motion.div>
    </motion.div>
  )
}

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg0)', color: 'var(--t1)', minHeight: '100vh' }}>

      {/* ── NAV ── */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'rgba(var(--bg0-rgb,10,10,20),0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="flex items-center justify-between px-6 md:px-12 py-4 max-w-screen-xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-sm text-white"
              style={{ background: 'linear-gradient(135deg,var(--accent),var(--green))' }}>Q</div>
            <span className="font-display font-bold text-base text-primary">Quiz Academy</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link to="/signup"><Button variant="primary" size="sm">Get Started →</Button></Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: 'var(--accent)' }} />
          <div className="absolute -bottom-40 -right-20 w-80 h-80 rounded-full blur-3xl opacity-15"
            style={{ background: 'var(--green)' }} />
        </div>

        <div className="relative max-w-screen-xl mx-auto px-6 md:px-12 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <div>
              <motion.div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Zap size={12} /> Powered by Gemini AI — Free
              </motion.div>

              <motion.h1 className="font-display font-black leading-tight mb-6 text-primary"
                style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', letterSpacing: '-0.02em' }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                Master any subject,{' '}
                <span style={{ color: 'var(--accent)' }}>one quiz</span>{' '}
                at a time
              </motion.h1>

              <motion.p className="text-lg leading-relaxed mb-8"
                style={{ color: 'var(--t3)', maxWidth: 480 }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                AI quiz platform with 20 levels, CBT exam mode, streak tracking, leaderboard, and course builder. Upload your study material and we generate the questions.
              </motion.p>

              {/* Perks list */}
              <motion.ul className="flex flex-col gap-2 mb-8"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                {PERKS.map(p => (
                  <li key={p} className="flex items-center gap-2 text-sm" style={{ color: 'var(--t2)' }}>
                    <CheckCircle size={14} style={{ color: 'var(--green)', flexShrink: 0 }} /> {p}
                  </li>
                ))}
              </motion.ul>

              <motion.div className="flex flex-wrap gap-3 mb-10"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <Link to="/signup">
                  <Button variant="primary" size="lg">Start for Free <ArrowRight size={16} /></Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="lg">Sign In</Button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div className="grid grid-cols-4 gap-4 pt-6"
                style={{ borderTop: '1px solid var(--border)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                {STATS.map(s => (
                  <div key={s.label} className="text-center">
                    <div className="font-display font-black text-2xl" style={{ color: 'var(--accent)' }}>{s.value}</div>
                    <div className="text-xs text-muted mt-0.5">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Quiz preview */}
            <div className="relative flex justify-center px-8 md:px-4">
              <div className="w-full max-w-sm">
                <QuizPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-20 md:py-28">
          <motion.div className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display font-black mb-3 text-primary"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '-0.02em' }}>
              Everything you need to learn faster
            </h2>
            <p className="text-lg" style={{ color: 'var(--t3)' }}>Built for serious learners who want real results</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} className="group p-6 rounded-2xl transition-all"
                style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                whileHover={{ y: -3, borderColor: f.color }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all"
                  style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}>
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className="font-display font-bold text-base mb-2 text-primary">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--t3)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section style={{ background: 'var(--bg1)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-14 text-center">
          <div className="flex items-center justify-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="var(--gold)" style={{ color: 'var(--gold)' }} />)}
          </div>
          <p className="font-display font-bold text-xl text-primary mb-1">"The best free quiz platform I've used."</p>
          <p className="text-sm text-muted">Loved by students preparing for exams worldwide</p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section>
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-20 md:py-28">
          <motion.div className="relative overflow-hidden rounded-3xl p-12 md:p-20 text-center"
            style={{ background: 'linear-gradient(135deg, var(--accent-dim) 0%, var(--bg2) 100%)', border: '1px solid var(--accent-border)' }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
              style={{ background: 'var(--accent)', transform: 'translate(30%, -30%)' }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none"
              style={{ background: 'var(--green)', transform: 'translate(-30%, 30%)' }} />

            <div className="relative">
              <h2 className="font-display font-black mb-4 text-primary"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '-0.02em' }}>
                Ready to level up your learning?
              </h2>
              <p className="mb-8 text-lg" style={{ color: 'var(--t3)' }}>Free forever. No credit card required.</p>
              <Link to="/signup">
                <Button variant="primary" size="lg">Create Free Account <ArrowRight size={16} /></Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center font-display font-black text-white"
              style={{ background: 'linear-gradient(135deg,var(--accent),var(--green))', fontSize: 11 }}>Q</div>
            <span className="text-sm font-medium text-muted">Quiz Academy v4</span>
          </div>
          <div className="flex gap-6 text-sm text-muted">
            <Link to="/login"  className="hover:text-primary transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-primary transition-colors">Sign Up</Link>
          </div>
          <p className="text-xs text-muted">© {new Date().getFullYear()} Quiz Academy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}