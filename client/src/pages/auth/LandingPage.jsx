import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Zap, Trophy, Users, BookOpen, Target, Flame, ArrowRight } from 'lucide-react'
import Button from '../../components/ui/Button'

const FEATURES = [
  { icon: Brain,    title: 'AI-Powered Questions',  desc: 'Generate custom quizzes on any topic using Gemini AI. Upload PDFs and we build questions from your material.' },
  { icon: Trophy,   title: '20-Level Progression',  desc: 'Climb from Newcomer to Transcendent. Earn XP, unlock achievements and level badges.' },
  { icon: Target,   title: 'CBT Exam Mode',          desc: 'Simulate real computer-based exams with no answer indicators — just like the real thing.' },
  { icon: Flame,    title: 'Streak System',          desc: 'Build daily habits. Protect your streak with freeze tokens and get push reminders.' },
  { icon: Users,    title: 'Live Leaderboard',       desc: 'Compete globally. Weekly and all-time rankings with medals for the top 3.' },
  { icon: BookOpen, title: 'Course Builder',         desc: 'Create your own courses, import JSON, or upload a PDF. Study your way.' },
]

const STATS = [
  { value: '15+',  label: 'Subjects'  },
  { value: '200+', label: 'Questions' },
  { value: '20',   label: 'Levels'    },
  { value: '100%', label: 'Free'      },
]

function QuizPreview() {
  const opts = ['Creative Style Sheets','Cascading Style Sheets','Computer Style Sheets','Colorful Style Sheets']
  return (
    <motion.div
      className="relative w-full max-w-sm mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
    >
      <div className="rounded-2xl p-5 shadow-2xl"
        style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted">Question 3 of 10</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
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
            className="flex items-center gap-3 p-2.5 rounded-xl mb-2 text-sm cursor-pointer"
            style={{
              background: i === 1 ? 'var(--accent-dim)' : 'var(--bg2)',
              border: `1px solid ${i === 1 ? 'var(--accent)' : 'var(--border)'}`,
              color:  i === 1 ? 'var(--accent)' : 'var(--t2)',
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

      <motion.div className="absolute -top-3 -right-3 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg"
        style={{ background: 'var(--green)', color: '#0a1a12' }}
        animate={{ y: [0,-4,0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}>
        +120 XP 🎉
      </motion.div>
      <motion.div className="absolute -bottom-3 -left-3 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg"
        style={{ background: 'var(--gold)', color: '#1a1000' }}
        animate={{ y: [0,4,0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: 0.5 }}>
        🔥 7-day streak!
      </motion.div>
    </motion.div>
  )
}

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg0)', color: 'var(--t1)', minHeight: '100vh' }}>

      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-black text-sm text-white"
            style={{ background: 'linear-gradient(135deg,var(--accent),var(--green))' }}>Q</div>
          <span className="font-display font-bold text-base text-primary">Quiz Academy</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login"><Button variant="secondary" size="sm">Sign In</Button></Link>
          <Link to="/signup"><Button variant="primary"   size="sm">Get Started</Button></Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
              style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Zap size={12} /> Powered by Gemini AI — Free
            </motion.div>

            <motion.h1 className="font-display font-black text-4xl md:text-5xl leading-tight mb-5 text-primary"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              Master any subject,{' '}
              <span style={{ color: 'var(--accent)' }}>one quiz</span> at a time
            </motion.h1>

            <motion.p className="text-base leading-relaxed mb-8 text-secondary"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              AI quiz platform with 20 levels, CBT exam mode, streak tracking, leaderboard, and course builder. Upload your study material and we generate the questions.
            </motion.p>

            <motion.div className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Link to="/signup">
                <Button variant="primary" size="lg">Start for Free <ArrowRight size={16} /></Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg">Sign In</Button>
              </Link>
            </motion.div>

            <motion.div className="flex gap-6 mt-8"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              {STATS.map(s => (
                <div key={s.label}>
                  <div className="font-display font-black text-xl" style={{ color: 'var(--accent)' }}>{s.value}</div>
                  <div className="text-xs text-muted">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="relative flex justify-center">
            <QuizPreview />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.div className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display font-bold text-3xl mb-2 text-primary">Everything you need to learn faster</h2>
          <p className="text-secondary">Built for serious learners who want real results</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} className="p-5 rounded-2xl"
              style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}>
                <f.icon size={18} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="font-display font-semibold text-sm mb-1.5 text-primary">{f.title}</h3>
              <p className="text-xs leading-relaxed text-secondary">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.div className="rounded-3xl p-10 text-center"
          style={{ background: 'linear-gradient(135deg,var(--accent-dim),var(--bg2))', border: '1px solid var(--accent-border)' }}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display font-black text-3xl mb-3 text-primary">Ready to level up your learning?</h2>
          <p className="mb-8 text-sm text-secondary">Free forever. No credit card required.</p>
          <Link to="/signup">
            <Button variant="primary" size="lg">Create Free Account <ArrowRight size={16} /></Button>
          </Link>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t py-6" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center font-display font-black text-white"
              style={{ background: 'linear-gradient(135deg,var(--accent),var(--green))', fontSize: 10 }}>Q</div>
            Quiz Academy v4
          </div>
          <div className="flex gap-4">
            <Link to="/login"  className="hover:text-primary transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-primary transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
