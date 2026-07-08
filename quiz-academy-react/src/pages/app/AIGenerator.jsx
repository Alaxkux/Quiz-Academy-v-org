import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AICreditsPopup } from '../../components/ui/SamsungPopup'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Sparkles, X, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { quizApi } from '../../api/quiz'
import { getAllCourses, shuffle } from '../../data/quizData'
import PageWrapper, { PageHeader } from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

const DIFFICULTIES = [
  { val: 'easy',   label: 'Easy'   },
  { val: 'medium', label: 'Medium' },
  { val: 'hard',   label: 'Hard'   },
  { val: 'mixed',  label: 'Mixed'  },
]

const COUNTS = ['5','10','15','20']

// Preview of generated questions
function QuestionPreview({ questions, topic, onPlay, onSave, onClear }) {
  const [expanded, setExpanded] = useState(null)

  return (
    <>
    <motion.div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h3 className="font-display font-semibold text-sm text-primary">
            ✅ {questions.length} Questions Generated
          </h3>
          <p className="text-xs text-secondary mt-0.5">Topic: <strong>{topic}</strong></p>
        </div>
        <button onClick={onClear} className="text-muted hover:text-red transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Preview first 3 */}
      <div className="p-4 flex flex-col gap-2">
        {questions.slice(0, 3).map((q, i) => (
          <div key={i}>
            <button
              className="w-full text-left p-3 rounded-xl transition-all"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                    style={{
                      background: q.difficulty === 'easy' ? 'var(--green-dim)' : q.difficulty === 'hard' ? 'var(--red-dim)' : 'var(--gold-dim)',
                      color:      q.difficulty === 'easy' ? 'var(--green)'     : q.difficulty === 'hard' ? 'var(--red)'     : 'var(--gold)',
                    }}>
                    {q.difficulty}
                  </span>
                  <span className="text-sm text-primary truncate">{q.q}</span>
                </div>
                {expanded === i ? <ChevronUp size={14} style={{ color: 'var(--t3)', flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: 'var(--t3)', flexShrink: 0 }} />}
              </div>
              <AnimatePresence>
                {expanded === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{   height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 flex flex-col gap-1">
                      {q.opts.map((opt, j) => (
                        <div key={j} className="flex items-center gap-2 text-xs"
                          style={{ color: j === q.a ? 'var(--green)' : 'var(--t3)' }}>
                          <span className="font-bold">{String.fromCharCode(65+j)}.</span>
                          <span>{opt}</span>
                          {j === q.a && <span className="font-bold">✓</span>}
                        </div>
                      ))}
                      {q.explanation && (
                        <p className="text-xs text-secondary mt-1 pl-4 border-l-2" style={{ borderColor: 'var(--accent)' }}>
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        ))}
        {questions.length > 3 && (
          <p className="text-xs text-center text-muted">+{questions.length - 3} more questions</p>
        )}
      </div>

      <div className="flex gap-2 p-4 pt-0">
        <Button variant="primary"   size="md" className="flex-1" onClick={onPlay}>
          ▶ Play These Questions
        </Button>
        <Button variant="ghost"     size="md" onClick={onSave}>
          💾 Save as Course
        </Button>
      </div>
    </motion.div>
    </>
  )
}

export default function AIGenerator() {
  const navigate = useNavigate()

  // Topic mode state
  const [topic,      setTopic]      = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [count,      setCount]      = useState('10')
  const [generating, setGenerating] = useState(false)
  const [questions,  setQuestions]  = useState(null)
  const [genTopic,   setGenTopic]   = useState('')

  // PDF/JSON upload state
  const [activeTab,   setActiveTab]   = useState('topic') // 'topic' | 'pdf' | 'json'
  const [uploading,   setUploading]   = useState(false)
  const [dragOver,    setDragOver]    = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const fileRef = useRef(null)

  // ── Generate from topic ──
  async function handleGenerate() {
    if (!topic.trim()) { toast.error('Please enter a topic'); return }
    setGenerating(true)
    setQuestions(null)
    try {
      const data = await quizApi.generateAI(topic.trim(), difficulty, parseInt(count))
      setQuestions(data.questions)
      setGenTopic(topic.trim())
    } catch (err) {
      toast.error(err.message || 'Generation failed — please try again')
    } finally {
      setGenerating(false)
    }
  }

  // ── Generate from PDF ──
  async function handlePdfUpload(file) {
    if (!file) return
    if (file.type !== 'application/pdf') { toast.error('Please upload a PDF file'); return }
    if (file.size > 10 * 1024 * 1024)   { toast.error('File too large — max 10MB'); return }
    setUploadedFile(file)
    setUploading(true)
    setQuestions(null)
    try {
      const formData = new FormData()
      formData.append('pdf', file)
      formData.append('difficulty', difficulty)
      formData.append('count', count)
      const data = await quizApi.generateFromPdf(formData)
      setQuestions(data.questions)
      setGenTopic(file.name.replace('.pdf',''))
    } catch (err) {
      toast.error(err.message || 'PDF processing failed — ensure it\'s a text-based PDF')
    } finally {
      setUploading(false)
    }
  }

  // ── Import JSON ──
  function handleJsonUpload(file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target.result)
        const qs = Array.isArray(parsed) ? parsed
          : parsed.questions ? parsed.questions
          : Object.values(parsed)[0]
        if (!Array.isArray(qs) || !qs.length) throw new Error('No questions found')
        const valid = qs.filter(q => q.q && Array.isArray(q.opts) && typeof q.a === 'number')
        if (!valid.length) throw new Error('Invalid question format')
        setQuestions(valid)
        setGenTopic(file.name.replace('.json',''))
        toast.success(`${valid.length} questions loaded!`)
      } catch (err) {
        toast.error('Invalid JSON: ' + err.message)
      }
    }
    reader.readAsText(file)
  }

  function handleFileInput(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (activeTab === 'pdf')  handlePdfUpload(file)
    if (activeTab === 'json') handleJsonUpload(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (activeTab === 'pdf')  handlePdfUpload(file)
    if (activeTab === 'json') handleJsonUpload(file)
  }

  function playQuestions() {
    if (!questions?.length) return
    navigate('/quiz/config', {
      state: { category: `AI: ${genTopic}`, questions: shuffle(questions), title: `AI Quiz — ${genTopic}` }
    })
  }

  function saveAsCourse() {
    if (!questions?.length) return
    const id      = 'AI_' + genTopic.replace(/\s+/g,'_').slice(0,20) + '_' + Date.now().toString(36)
    const courses = JSON.parse(localStorage.getItem('qa_custom_courses') || '{}')
    courses[id]   = {
      name:        'AI: ' + genTopic,
      description: 'AI-generated questions about ' + genTopic,
      icon:        '🤖',
      color:       'rgba(108,142,255,.12)',
      questions,
      isCustom:    true,
      createdAt:   new Date().toISOString(),
    }
    localStorage.setItem('qa_custom_courses', JSON.stringify(courses))
    toast.success(`Saved as "AI: ${genTopic}"!`)
    setQuestions(null)
  }

  const TABS = [
    { id: 'topic', label: '✨ Topic',    icon: Sparkles  },
    { id: 'pdf',   label: '📄 PDF',     icon: FileText  },
    { id: 'json',  label: '📦 JSON',    icon: Upload    },
  ]

  return (
    <>
    <PageWrapper>
      <PageHeader
        title="🤖 AI Question Generator"
        subtitle="Generate quiz questions powered by Gemini AI — free, 1500 requests/day"
      />

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setQuestions(null) }}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              background: activeTab === t.id ? 'var(--bg1)'   : 'transparent',
              color:      activeTab === t.id ? 'var(--accent)' : 'var(--t3)',
              border:     activeTab === t.id ? '1px solid var(--border)' : '1px solid transparent',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Options row — shared across tabs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">Difficulty</label>
          <div className="flex gap-1.5 flex-wrap">
            {DIFFICULTIES.map(d => (
              <button key={d.val} onClick={() => setDifficulty(d.val)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: difficulty === d.val ? 'var(--accent-dim)' : 'var(--bg2)',
                  border:     `1px solid ${difficulty === d.val ? 'var(--accent)' : 'var(--border)'}`,
                  color:      difficulty === d.val ? 'var(--accent)' : 'var(--t2)',
                }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">Questions</label>
          <div className="flex gap-1.5">
            {COUNTS.map(c => (
              <button key={c} onClick={() => setCount(c)}
                className="flex-1 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: count === c ? 'var(--accent-dim)' : 'var(--bg2)',
                  border:     `1px solid ${count === c ? 'var(--accent)' : 'var(--border)'}`,
                  color:      count === c ? 'var(--accent)' : 'var(--t2)',
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Topic input */}
      {activeTab === 'topic' && (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">Topic / Subject</label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleGenerate()}
              placeholder="e.g. Nigerian history, Python decorators, Photosynthesis..."
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: 'var(--bg1)', border: '1px solid var(--border)',
                color: 'var(--t1)', fontFamily: 'DM Sans, sans-serif',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <Button variant="primary" size="lg" loading={generating} onClick={handleGenerate} className="w-full">
            <Sparkles size={15} /> Generate Questions
          </Button>
        </div>
      )}

      {/* PDF / JSON upload zone */}
      {(activeTab === 'pdf' || activeTab === 'json') && !questions && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept={activeTab === 'pdf' ? '.pdf' : '.json'}
            className="hidden"
            onChange={handleFileInput}
          />
          <div
            className="rounded-2xl p-8 text-center cursor-pointer transition-all"
            style={{
              background:  dragOver ? 'var(--accent-dim)' : 'var(--bg1)',
              border:      `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
            }}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Spinner size="lg" />
                <p className="text-sm text-secondary">
                  {activeTab === 'pdf' ? 'Extracting text and generating questions...' : 'Processing...'}
                </p>
              </div>
            ) : (
              <>
                <div className="text-4xl mb-3">{activeTab === 'pdf' ? '📄' : '📦'}</div>
                <h3 className="font-display font-semibold text-sm text-primary mb-1">
                  {activeTab === 'pdf' ? 'Upload PDF Study Material' : 'Upload JSON Question File'}
                </h3>
                <p className="text-xs text-secondary mb-3">
                  {activeTab === 'pdf'
                    ? 'Upload lecture notes, textbooks, or study guides. Gemini AI reads the content and generates questions.'
                    : 'Upload a JSON file with quiz questions. Must follow the standard format.'}
                </p>
                <Button variant="ghost" size="sm">
                  <Upload size={13} /> Choose {activeTab === 'pdf' ? 'PDF' : 'JSON'} File
                </Button>
                <p className="text-xs text-muted mt-2">or drag and drop here</p>
                {activeTab === 'pdf' && (
                  <p className="text-xs text-muted mt-1">Max 10MB · Text-based PDFs only</p>
                )}
              </>
            )}
          </div>

          {/* JSON format hint */}
          {activeTab === 'json' && (
            <div
              className="mt-3 rounded-xl p-3"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
            >
              <p className="text-xs text-muted mb-2 font-medium">Expected format:</p>
              <pre className="text-xs overflow-x-auto" style={{ color: 'var(--t2)' }}>{`[
  {
    "q": "Question text?",
    "opts": ["A","B","C","D"],
    "a": 0,
    "explanation": "Why A is correct",
    "difficulty": "medium"
  }
]`}</pre>
            </div>
          )}
        </div>
      )}

      {/* Generating indicator */}
      {generating && (
        <motion.div
          className="flex flex-col items-center gap-3 py-8 rounded-2xl"
          style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          <Spinner size="lg" />
          <p className="text-sm text-secondary">Generating {count} questions about "<strong>{topic}</strong>"...</p>
          <p className="text-xs text-muted">Powered by Google Gemini</p>
        </motion.div>
      )}

      {/* Question preview */}
      {questions && !generating && (
        <QuestionPreview
          questions={questions}
          topic={genTopic}
          onPlay={playQuestions}
          onSave={saveAsCourse}
          onClear={() => setQuestions(null)}
        />
      )}
    </PageWrapper>
    </>
  )
}