import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileJson, CheckCircle, AlertCircle } from 'lucide-react'
import { coursesApi } from '../../api/courses'
import Button from '../ui/Button'

const EXAMPLE = JSON.stringify([
  {
    q: "What does HTML stand for?",
    opts: ["HyperText Markup Language", "High-Tech Modern Language", "HyperTransfer Markup Logic", "Hosted Text Markup Language"],
    a: 0,
    difficulty: "easy",
    explanation: "HTML stands for HyperText Markup Language, the standard markup language for web pages."
  },
  {
    q: "Which CSS property controls text color?",
    opts: ["background-color", "font-color", "color", "text-style"],
    a: 2,
    difficulty: "easy",
    explanation: "The 'color' property sets the text color in CSS."
  }
], null, 2)

export default function QuestionUploader({ courseCode, onSuccess }) {
  const [mode,    setMode]    = useState('paste')
  const [json,    setJson]    = useState('')
  const [replace, setReplace] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState('')
  const fileRef = useRef(null)

  function handleFileRead(file) {
    const reader = new FileReader()
    reader.onload = e => { setJson(e.target.result); setMode('paste') }
    reader.readAsText(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.json')) handleFileRead(file)
  }

  async function handleUpload() {
    setError(''); setResult(null)
    let questions
    try {
      questions = JSON.parse(json)
      if (!Array.isArray(questions)) throw new Error('JSON must be an array of questions')
    } catch (e) {
      setError('Invalid JSON: ' + e.message); return
    }
    setLoading(true)
    try {
      const data = await coursesApi.uploadQuestions(courseCode, questions, replace)
      setResult(data); setJson('')
      onSuccess?.(data)
    } catch (e) {
      setError(e.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Mode toggle */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        {[{ id: 'paste', label: '📋 Paste JSON' }, { id: 'file', label: '📁 Upload File' }].map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              background: mode === m.id ? 'var(--bg1)' : 'transparent',
              color:      mode === m.id ? 'var(--accent)' : 'var(--t3)',
              border:     mode === m.id ? '1px solid var(--border)' : '1px solid transparent',
            }}>
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'paste' ? (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-muted">Paste your JSON questions array</label>
            <button onClick={() => setJson(EXAMPLE)} className="text-xs" style={{ color: 'var(--accent)' }}>
              Load example
            </button>
          </div>
          <textarea
            value={json}
            onChange={e => setJson(e.target.value)}
            placeholder={'[\n  {\n    "q": "Question text?",\n    "opts": ["A","B","C","D"],\n    "a": 0,\n    "difficulty": "medium",\n    "explanation": "Why A is correct."\n  }\n]'}
            rows={10}
            className="w-full text-xs font-mono rounded-xl px-3 py-2.5 resize-y outline-none"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t1)', minHeight: 180 }}
          />
        </div>
      ) : (
        <div
          onDrop={handleDrop} onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl cursor-pointer"
          style={{ border: '2px dashed var(--border)', background: 'var(--bg2)', padding: '3rem 1rem' }}
        >
          <FileJson size={32} style={{ color: 'var(--accent)' }} />
          <div className="text-center">
            <div className="text-sm font-medium text-primary">Drop a .json file here</div>
            <div className="text-xs text-muted mt-0.5">or click to browse</div>
          </div>
          <input ref={fileRef} type="file" accept=".json,application/json" className="hidden"
            onChange={e => e.target.files[0] && handleFileRead(e.target.files[0])} />
        </div>
      )}

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input type="checkbox" checked={replace} onChange={e => setReplace(e.target.checked)} className="w-4 h-4 rounded accent-accent" />
        <span className="text-xs text-secondary">Replace existing questions (instead of appending)</span>
      </label>

      <AnimatePresence>
        {error && (
          <motion.div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs"
            style={{ background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(255,80,80,.2)' }}
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /><span>{error}</span>
          </motion.div>
        )}
        {result && (
          <motion.div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs"
            style={{ background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid rgba(77,255,195,.2)' }}
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>
              ✅ <strong>{result.added}</strong> question{result.added !== 1 ? 's' : ''} uploaded! Total: <strong>{result.total}</strong>
              {result.skipped > 0 && ` · ${result.skipped} skipped (invalid)`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <Button variant="primary" size="md" className="w-full" loading={loading} onClick={handleUpload} disabled={!json.trim()}>
        <Upload size={14} /> Upload Questions
      </Button>

      <div className="rounded-xl px-3 py-2.5 text-xs" style={{ background: 'var(--bg2)', color: 'var(--t3)' }}>
        <strong style={{ color: 'var(--t2)' }}>Required per question:</strong>
        {' '}<code>q</code> (string), <code>opts</code> (array of choices), <code>a</code> (correct answer index, 0-based).
        {' '}Optional: <code>difficulty</code> (easy/medium/hard), <code>explanation</code>.
      </div>
    </div>
  )
}
