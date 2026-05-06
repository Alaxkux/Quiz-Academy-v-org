import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Save, X, Upload, FileJson } from 'lucide-react'
import { coursesApi } from '../../api/courses'
import PageWrapper, { PageHeader } from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'

// ── Empty question template ──
const emptyQuestion = () => ({
  q: '', opts: ['', '', '', ''], a: 0, difficulty: 'medium', explanation: ''
})

// ── Empty course template ──
const emptyCourse = () => ({
  code: '', icon: '📚', color: 'rgba(108,142,255,.12)',
  description: '', questions: [emptyQuestion()],
})

// ── Single question editor ──
function QuestionEditor({ q, idx, onChange, onRemove }) {
  return (
    <div className="rounded-xl p-4 mb-3" style={{ background: 'var(--bg0)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted">Question {idx + 1}</span>
        <button onClick={onRemove} className="text-red-400 hover:text-red-500 transition-colors">
          <X size={14} />
        </button>
      </div>

      <textarea
        value={q.q}
        onChange={e => onChange({ ...q, q: e.target.value })}
        placeholder="Question text..."
        rows={2}
        className="w-full text-sm rounded-lg px-3 py-2 mb-2 resize-none"
        style={{ background: 'var(--bg1)', border: '1px solid var(--border)', color: 'var(--text)' }}
      />

      <div className="grid grid-cols-2 gap-2 mb-2">
        {q.opts.map((opt, oi) => (
          <div key={oi} className="flex items-center gap-2">
            <input
              type="radio"
              checked={q.a === oi}
              onChange={() => onChange({ ...q, a: oi })}
              title="Mark as correct"
            />
            <input
              value={opt}
              onChange={e => {
                const opts = [...q.opts]; opts[oi] = e.target.value
                onChange({ ...q, opts })
              }}
              placeholder={`Option ${oi + 1}${q.a === oi ? ' ✓' : ''}`}
              className="flex-1 text-xs rounded-lg px-2 py-1.5"
              style={{ background: 'var(--bg1)', border: `1px solid ${q.a === oi ? 'var(--accent)' : 'var(--border)'}`, color: 'var(--text)' }}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <select
          value={q.difficulty}
          onChange={e => onChange({ ...q, difficulty: e.target.value })}
          className="text-xs rounded-lg px-2 py-1.5"
          style={{ background: 'var(--bg1)', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <input
          value={q.explanation}
          onChange={e => onChange({ ...q, explanation: e.target.value })}
          placeholder="Explanation (optional)..."
          className="flex-1 text-xs rounded-lg px-2 py-1.5"
          style={{ background: 'var(--bg1)', border: '1px solid var(--border)', color: 'var(--text)' }}
        />
      </div>
    </div>
  )
}

// ── Course form (create / edit) ──
function CourseForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm]         = useState(initial || emptyCourse())
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [jsonMode, setJsonMode] = useState(false)
  const fileRef = useRef(null)

  // Parse and load questions from JSON text
  function applyJson(text) {
    setJsonError('')
    try {
      const parsed = JSON.parse(text)
      // Accept either an array of questions or a full course object
      const questions = Array.isArray(parsed)
        ? parsed
        : parsed.questions || Object.values(parsed)[0]?.questions
      if (!Array.isArray(questions) || questions.length === 0)
        throw new Error('No questions array found in JSON')
      // Validate shape
      const valid = questions.filter(q =>
        q.q && Array.isArray(q.opts) && q.opts.length >= 2 && typeof q.a === 'number'
      )
      if (valid.length === 0) throw new Error('No valid questions found (need q, opts[], a)')
      setForm(f => ({ ...f, questions: valid.map(q => ({
        q:           q.q,
        opts:        q.opts,
        a:           q.a,
        difficulty:  ['easy','medium','hard'].includes(q.difficulty) ? q.difficulty : 'medium',
        explanation: q.explanation || '',
      }))}))
      setJsonMode(false)
      setJsonText('')
    } catch (e) {
      setJsonError(e.message)
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => applyJson(ev.target.result)
    reader.readAsText(file)
    e.target.value = ''
  }

  const updateQuestion = (idx, updated) => {
    const questions = [...form.questions]
    questions[idx] = updated
    setForm(f => ({ ...f, questions }))
  }

  const removeQuestion = idx => {
    setForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== idx) }))
  }

  const addQuestion = () => {
    setForm(f => ({ ...f, questions: [...f.questions, emptyQuestion()] }))
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs text-muted mb-1 block">Course Code *</label>
          <input
            value={form.code}
            onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
            placeholder="e.g. CSC 301"
            disabled={!!initial}
            className="w-full text-sm rounded-lg px-3 py-2"
            style={{ background: 'var(--bg0)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>
        <div>
          <label className="text-xs text-muted mb-1 block">Icon</label>
          <input
            value={form.icon}
            onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
            placeholder="📚"
            className="w-full text-sm rounded-lg px-3 py-2"
            style={{ background: 'var(--bg0)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-muted mb-1 block">Description</label>
          <input
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Short course description..."
            className="w-full text-sm rounded-lg px-3 py-2"
            style={{ background: 'var(--bg0)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-primary">Questions ({form.questions.length})</span>
          <div className="flex gap-2">
            {/* JSON import buttons */}
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t2)' }}
              title="Upload JSON file"
            >
              <Upload size={12} /> JSON File
            </button>
            <button
              onClick={() => setJsonMode(m => !m)}
              className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t2)' }}
              title="Paste JSON"
            >
              <FileJson size={12} /> Paste JSON
            </button>
            <button
              onClick={addQuestion}
              className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              <Plus size={12} /> Add
            </button>
          </div>
        </div>

        {/* JSON paste area */}
        {jsonMode && (
          <div className="mb-3 rounded-xl p-3" style={{ background: 'var(--bg0)', border: '1px solid var(--border)' }}>
            <p className="text-xs text-muted mb-2">
              Paste a JSON array of questions or a full course object. Each question needs: <code className="font-mono">q, opts[], a, difficulty, explanation</code>
            </p>
            <textarea
              value={jsonText}
              onChange={e => setJsonText(e.target.value)}
              rows={6}
              placeholder={'[\n  {\n    "q": "Question?",\n    "opts": ["A","B","C","D"],\n    "a": 0,\n    "difficulty": "medium",\n    "explanation": "Because..."\n  }\n]'}
              className="w-full text-xs font-mono rounded-lg px-3 py-2 resize-none mb-2"
              style={{ background: 'var(--bg1)', border: '1px solid var(--border)', color: 'var(--t1)' }}
            />
            {jsonError && <p className="text-xs mb-2" style={{ color: 'var(--red)' }}>⚠ {jsonError}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => applyJson(jsonText)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                Import Questions
              </button>
              <button
                onClick={() => { setJsonMode(false); setJsonText(''); setJsonError('') }}
                className="text-xs text-muted hover:text-primary transition-colors px-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {form.questions.map((q, idx) => (
          <QuestionEditor
            key={idx} q={q} idx={idx}
            onChange={updated => updateQuestion(idx, updated)}
            onRemove={() => removeQuestion(idx)}
          />
        ))}
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button onClick={() => onSave(form)} disabled={saving}>
          <Save size={14} /> {saving ? 'Saving...' : 'Save Course'}
        </Button>
      </div>
    </div>
  )
}

// ── Course row ──
function CourseRow({ course, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="rounded-2xl overflow-hidden mb-3" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3 p-4">
        <span className="text-2xl">{course.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-primary">{course.code}</div>
          <div className="text-xs text-muted truncate">{course.description}</div>
        </div>
        <span className="text-xs text-muted">{course.questions?.length || 0}q</span>
        <button onClick={() => setExpanded(e => !e)} className="text-muted hover:text-primary transition-colors">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <button onClick={() => onEdit(course)} className="text-muted hover:text-accent transition-colors">
          <Pencil size={15} />
        </button>
        <button onClick={() => onDelete(course.code)} className="text-muted hover:text-red-400 transition-colors">
          <Trash2 size={15} />
        </button>
      </div>
      {expanded && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="mt-3 space-y-1">
            {(course.questions || []).map((q, i) => (
              <div key={i} className="text-xs text-muted flex gap-2">
                <span className="font-mono w-5">{i + 1}.</span>
                <span className="truncate">{q.q}</span>
                <span className={`ml-auto flex-shrink-0 px-1.5 rounded ${
                  q.difficulty === 'easy' ? 'text-green-400' :
                  q.difficulty === 'hard' ? 'text-red-400' : 'text-yellow-400'
                }`}>{q.difficulty}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ──
export default function CourseManager() {
  const [courses, setCourses]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState(null)

  const load = async () => {
    try {
      setLoading(true)
      const { courses } = await coursesApi.getAll()
      // Fetch full questions for each
      const full = await Promise.all(
        courses.map(c => coursesApi.getOne(c.code).then(r => r.course))
      )
      setCourses(full)
    } catch (e) {
      setError('Failed to load courses. Make sure you ran the seed script.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const notify = text => { setMsg(text); setTimeout(() => setMsg(null), 3000) }

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editing) {
        await coursesApi.update(editing.code, form)
        notify(`✅ "${form.code}" updated`)
      } else {
        await coursesApi.create(form)
        notify(`✅ "${form.code}" created`)
      }
      setShowForm(false)
      setEditing(null)
      load()
    } catch (e) {
      notify(`❌ ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (code) => {
    if (!confirm(`Remove course "${code}"? It won't appear in the app but can be restored.`)) return
    try {
      await coursesApi.remove(code)
      notify(`🗑 "${code}" removed`)
      load()
    } catch (e) {
      notify(`❌ ${e.message}`)
    }
  }

  const handleEdit = (course) => {
    setEditing(course)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Course Manager"
        sub={`${courses.length} courses`}
        action={
          !showForm && (
            <Button onClick={() => { setEditing(null); setShowForm(true) }}>
              <Plus size={15} /> New Course
            </Button>
          )
        }
      />

      {msg && (
        <div className="mb-4 text-sm px-4 py-3 rounded-xl" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
          {msg}
        </div>
      )}

      {showForm && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-primary mb-3">
            {editing ? `Editing: ${editing.code}` : 'New Course'}
          </h2>
          <CourseForm
            initial={editing}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null) }}
            saving={saving}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center text-muted text-sm py-12">Loading courses...</div>
      ) : error ? (
        <div className="text-center text-sm py-12" style={{ color: 'var(--red)' }}>
          {error}
          <div className="mt-2 text-xs text-muted">
            Run: <code className="font-mono">node server/scripts/seedCourses.js</code>
          </div>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center text-muted text-sm py-12">
          No courses yet. Click "New Course" to add one, or run the seed script.
        </div>
      ) : (
        courses.map(c => (
          <CourseRow key={c.code} course={c} onEdit={handleEdit} onDelete={handleDelete} />
        ))
      )}
    </PageWrapper>
  )
}