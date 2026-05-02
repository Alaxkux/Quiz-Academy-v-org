import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2, Upload, Download, X, Check, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getAllCourses, QUIZ_DATA } from '../../data/quizData'
import PageWrapper, { PageHeader } from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { useBack } from '../../hooks/useBack'

const ICONS = ['📚','🧮','🔬','💻','🎓','⚡','🌍','🏛️','📝','💼','🛒','⚗️','🧠','🎯','🔭','📖','🎵','🌱','🏆','💡']
const COLORS = [
  'rgba(108,142,255,.12)','rgba(77,255,195,.1)','rgba(245,200,66,.1)',
  'rgba(255,107,138,.1)','rgba(56,189,248,.1)','rgba(181,123,255,.12)',
  'rgba(255,122,69,.1)','rgba(61,255,154,.1)',
]

function getCustomCourses() {
  return JSON.parse(localStorage.getItem('qa_custom_courses') || '{}')
}
function saveCustomCourses(courses) {
  localStorage.setItem('qa_custom_courses', JSON.stringify(courses))
}

// Question editor row
function QuestionRow({ q, index, onEdit, onDelete }) {
  return (
    <div className="rounded-xl p-3" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-1.5 py-0.5 rounded-md"
            style={{
              background: q.difficulty === 'easy' ? 'var(--green-dim)' : q.difficulty === 'hard' ? 'var(--red-dim)' : 'var(--gold-dim)',
              color:      q.difficulty === 'easy' ? 'var(--green)'     : q.difficulty === 'hard' ? 'var(--red)'     : 'var(--gold)',
            }}>
            {q.difficulty || 'medium'}
          </span>
          <span className="text-xs text-muted">Q{index + 1}</span>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => onEdit(index)}
            className="p-1.5 rounded-lg transition-colors text-muted hover:text-accent"
            style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
            <Edit2 size={12} />
          </button>
          <button onClick={() => onDelete(index)}
            className="p-1.5 rounded-lg transition-colors text-muted hover:text-red"
            style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      <p className="text-sm text-primary mb-2 leading-snug">{q.q}</p>
      <div className="flex flex-wrap gap-1.5">
        {(q.opts || []).map((opt, i) => (
          <span key={i} className="text-xs px-2 py-0.5 rounded-lg"
            style={{
              background: i === q.a ? 'var(--green-dim)' : 'var(--bg1)',
              border:     `1px solid ${i === q.a ? 'var(--green)' : 'var(--border)'}`,
              color:      i === q.a ? 'var(--green)' : 'var(--t3)',
            }}>
            {String.fromCharCode(65+i)}. {opt}
            {i === q.a && ' ✓'}
          </span>
        ))}
      </div>
      {q.explanation && (
        <p className="text-xs text-secondary mt-2 pl-2 border-l-2" style={{ borderColor: 'var(--accent)' }}>
          {q.explanation}
        </p>
      )}
    </div>
  )
}

// Question edit form
function QuestionForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    q: '', opts: ['','','',''], a: 0, difficulty: 'medium', explanation: ''
  })

  function setOpt(i, val) {
    const opts = [...form.opts]
    opts[i] = val
    setForm(f => ({ ...f, opts }))
  }

  function validate() {
    if (!form.q.trim()) { toast.error('Question text is required'); return false }
    if (form.opts.some(o => !o.trim())) { toast.error('All 4 options are required'); return false }
    return true
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="text-xs text-muted uppercase tracking-wider block mb-1">Question</label>
        <textarea
          value={form.q}
          onChange={e => setForm(f => ({ ...f, q: e.target.value }))}
          placeholder="Enter your question..."
          rows={2}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t1)', fontFamily: 'DM Sans' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e  => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      <div>
        <label className="text-xs text-muted uppercase tracking-wider block mb-1">Options — click radio to mark correct</label>
        {form.opts.map((opt, i) => (
          <div key={i} className="flex items-center gap-2 mb-1.5">
            <button
              onClick={() => setForm(f => ({ ...f, a: i }))}
              className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
              style={{ borderColor: form.a === i ? 'var(--green)' : 'var(--border)', background: form.a === i ? 'var(--green)' : 'transparent' }}
            >
              {form.a === i && <Check size={10} color="#0a1a12" />}
            </button>
            <span className="text-xs font-bold text-muted w-4">{String.fromCharCode(65+i)}</span>
            <input
              value={opt}
              onChange={e => setOpt(i, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65+i)}`}
              className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg2)', border: `1px solid ${form.a === i ? 'var(--green)' : 'var(--border)'}`, color: 'var(--t1)' }}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted uppercase tracking-wider block mb-1">Difficulty</label>
          <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t1)' }}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted uppercase tracking-wider block mb-1">Explanation (optional)</label>
          <input value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
            placeholder="Why is this the answer?"
            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t1)' }} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" size="sm" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button variant="primary"   size="sm" className="flex-1" onClick={() => validate() && onSave(form)}>
          Save Question
        </Button>
      </div>
    </div>
  )
}

export default function CourseBuilder() {
  const goBack      = useBack('/categories')
  const fileRef     = useRef(null)
  const [view, setView]           = useState('list') // 'list' | 'editor'
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId]   = useState(null)
  const [qFormIdx, setQFormIdx]   = useState(null) // null=closed, -1=new, N=editing index

  // Course form state
  const [courseName, setCourseName]   = useState('')
  const [courseDesc, setCourseDesc]   = useState('')
  const [courseIcon, setCourseIcon]   = useState('📚')
  const [courseColor, setCourseColor] = useState(COLORS[0])
  const [questions, setQuestions]     = useState([])

  function loadCourseForEdit(id) {
    const courses = getCustomCourses()
    const c = courses[id]
    if (!c) return
    setEditingId(id)
    setCourseName(c.name || '')
    setCourseDesc(c.description || '')
    setCourseIcon(c.icon || '📚')
    setCourseColor(c.color || COLORS[0])
    setQuestions(c.questions || [])
    setView('editor')
  }

  function startNew() {
    setEditingId(null)
    setCourseName('')
    setCourseDesc('')
    setCourseIcon('📚')
    setCourseColor(COLORS[0])
    setQuestions([])
    setView('editor')
  }

  function saveCourse() {
    if (!courseName.trim()) { toast.error('Course name is required'); return }
    if (!questions.length)  { toast.error('Add at least one question'); return }
    const courses = getCustomCourses()
    const id = editingId || ('custom_' + Date.now().toString(36))
    courses[id] = {
      name:        courseName.trim(),
      description: courseDesc.trim(),
      icon:        courseIcon,
      color:       courseColor,
      questions,
      isCustom:    true,
      updatedAt:   new Date().toISOString(),
      createdAt:   courses[id]?.createdAt || new Date().toISOString(),
    }
    saveCustomCourses(courses)
    toast.success(editingId ? 'Course updated!' : 'Course created!')
    setView('list')
  }

  function deleteCourse(id) {
    const courses = getCustomCourses()
    delete courses[id]
    saveCustomCourses(courses)
    setDeleteId(null)
    toast.success('Course deleted')
  }

  function saveQuestion(form) {
    const qs = [...questions]
    if (qFormIdx === -1) qs.push(form)
    else qs[qFormIdx] = form
    setQuestions(qs)
    setQFormIdx(null)
    toast.success(qFormIdx === -1 ? 'Question added!' : 'Question updated!')
  }

  function deleteQuestion(i) {
    setQuestions(qs => qs.filter((_, idx) => idx !== i))
  }

  function exportCourse() {
    const data = JSON.stringify(questions, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `${courseName || 'course'}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target.result)
        const qs = Array.isArray(parsed) ? parsed : parsed.questions || []
        const valid = qs.filter(q => q.q && Array.isArray(q.opts) && typeof q.a === 'number')
        if (!valid.length) throw new Error('No valid questions found')
        setQuestions(prev => [...prev, ...valid])
        toast.success(`${valid.length} questions imported!`)
      } catch (err) { toast.error('Import failed: ' + err.message) }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const customCourses = getCustomCourses()

  // ── LIST VIEW ──
  if (view === 'list') return (
    <PageWrapper>
      <PageHeader
        title="🏗️ Course Builder"
        subtitle="Create and manage your custom quiz courses"
        action={
          <Button variant="primary" size="sm" onClick={startNew}>
            <Plus size={14} /> New Course
          </Button>
        }
      />

      {Object.keys(customCourses).length === 0 ? (
        <motion.div
          className="rounded-2xl p-10 text-center"
          style={{ background: 'var(--bg1)', border: '1px dashed var(--border)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          <div className="text-5xl mb-3">🏗️</div>
          <h3 className="font-display font-bold text-base text-primary mb-2">No custom courses yet</h3>
          <p className="text-sm text-secondary mb-5">Create your own quiz course or import a JSON file</p>
          <Button variant="primary" onClick={startNew}><Plus size={14} /> Create First Course</Button>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          {Object.entries(customCourses).map(([id, c], i) => (
            <motion.div key={id}
              className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: c.color || 'var(--accent-dim)' }}>
                {c.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-semibold text-sm text-primary">{c.name}</div>
                <div className="text-xs text-muted">{c.questions?.length || 0} questions · Custom</div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost"   size="xs" onClick={() => loadCourseForEdit(id)}><Edit2 size={12} /> Edit</Button>
                <Button variant="danger"  size="xs" onClick={() => setDeleteId(id)}><Trash2 size={12} /></Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Built-in courses (read-only display) */}
      <div>
        <h2 className="font-display font-semibold text-sm text-muted mb-3 uppercase tracking-wider">
          Built-in Courses (read-only)
        </h2>
        <div className="flex flex-col gap-2">
          {Object.entries(QUIZ_DATA).map(([id, c]) => (
            <div key={id} className="flex items-center gap-3 p-3 rounded-xl opacity-60"
              style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                style={{ background: c.color }}>
                {c.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-primary">{id}</div>
                <div className="text-xs text-muted">{c.questions?.length || 0} questions</div>
              </div>
              <span className="text-xs text-muted px-2 py-0.5 rounded-lg"
                style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                Built-in
              </span>
            </div>
          ))}
        </div>
      </div>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} icon="🗑️" title="Delete Course">
        <p className="text-secondary text-sm mb-5">
          Are you sure you want to delete "<strong>{customCourses[deleteId]?.name}</strong>"? This cannot be undone.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger"    className="flex-1" onClick={() => deleteCourse(deleteId)}>Delete</Button>
        </div>
      </Modal>
    </PageWrapper>
  )

  // ── EDITOR VIEW ──
  return (
    <PageWrapper>
      <button onClick={() => setView('list')}
        className="flex items-center gap-1.5 text-sm text-secondary hover:text-primary transition-colors w-fit">
        <ArrowLeft size={15} /> Back to Courses
      </button>

      <div className="font-display font-bold text-xl text-primary">
        {editingId ? 'Edit Course' : 'New Course'}
      </div>

      {/* Course meta */}
      <div className="rounded-2xl p-4 flex flex-col gap-3"
        style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted uppercase tracking-wider block mb-1">Course Name *</label>
            <input value={courseName} onChange={e => setCourseName(e.target.value)}
              placeholder="e.g. My Biology Notes"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t1)' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider block mb-1">Description</label>
            <input value={courseDesc} onChange={e => setCourseDesc(e.target.value)}
              placeholder="Short description"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t1)' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
          </div>
        </div>

        {/* Icon picker */}
        <div>
          <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">Icon</label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map(ic => (
              <button key={ic} onClick={() => setCourseIcon(ic)}
                className="w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all"
                style={{
                  background: courseIcon === ic ? 'var(--accent-dim)' : 'var(--bg2)',
                  border:     `1px solid ${courseIcon === ic ? 'var(--accent)' : 'var(--border)'}`,
                }}>
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div>
          <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">Card Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(col => (
              <button key={col} onClick={() => setCourseColor(col)}
                className="w-8 h-8 rounded-full border-2 transition-all"
                style={{
                  background:  col,
                  borderColor: courseColor === col ? 'var(--accent)' : 'var(--border)',
                  transform:   courseColor === col ? 'scale(1.15)' : 'scale(1)',
                }} />
            ))}
          </div>
        </div>
      </div>

      {/* Questions section */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="font-display font-semibold text-sm text-primary">
          Questions ({questions.length})
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <Button variant="secondary" size="xs" onClick={() => fileRef.current?.click()}>
            <Upload size={12} /> Import JSON
          </Button>
          {questions.length > 0 && (
            <Button variant="secondary" size="xs" onClick={exportCourse}>
              <Download size={12} /> Export
            </Button>
          )}
          <Button variant="ghost" size="xs" onClick={() => setQFormIdx(-1)}>
            <Plus size={12} /> Add Question
          </Button>
        </div>
      </div>

      {/* Question form */}
      <AnimatePresence>
        {qFormIdx !== null && (
          <motion.div className="rounded-2xl p-4"
            style={{ background: 'var(--bg1)', border: '1px solid var(--accent-border)' }}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}>
            <div className="font-display font-semibold text-sm text-primary mb-3">
              {qFormIdx === -1 ? 'Add Question' : `Edit Q${qFormIdx + 1}`}
            </div>
            <QuestionForm
              initial={qFormIdx >= 0 ? questions[qFormIdx] : null}
              onSave={saveQuestion}
              onCancel={() => setQFormIdx(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Questions list */}
      {questions.length === 0 ? (
        <div className="rounded-xl p-8 text-center"
          style={{ background: 'var(--bg2)', border: '1px dashed var(--border)' }}>
          <p className="text-sm text-muted">No questions yet — click "Add Question" to start</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {questions.map((q, i) => (
            <QuestionRow key={i} q={q} index={i}
              onEdit={idx => setQFormIdx(idx)}
              onDelete={deleteQuestion} />
          ))}
        </div>
      )}

      {/* Save button */}
      <div className="flex gap-2">
        <Button variant="secondary" size="md" className="flex-1" onClick={() => setView('list')}>
          Cancel
        </Button>
        <Button variant="primary" size="md" className="flex-1" onClick={saveCourse}>
          {editingId ? '💾 Update Course' : '✓ Create Course'}
        </Button>
      </div>
    </PageWrapper>
  )
}
