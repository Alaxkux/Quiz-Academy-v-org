import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Plus, Upload } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { getAllCourses } from '../../data/quizData'
import { coursesApi } from '../../api/courses'
import PageWrapper, { PageHeader } from '../../components/layout/PageWrapper'
import CourseCard from '../../components/categories/CourseCard'
import Button from '../../components/ui/Button'

export default function Categories() {
  const navigate          = useNavigate()
  const [searchParams]    = useSearchParams()
  const { user }          = useAuth()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [dbCourses, setDbCourses] = useState({})
  const [loadingDb, setLoadingDb] = useState(true)

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) setSearch(q)
  }, [searchParams])

  // Fetch admin-added courses from MongoDB
  useEffect(() => {
    coursesApi.getAll()
      .then(data => {
        const map = {}
        ;(data.courses || []).forEach(c => {
          map[c.code] = {
            name:          c.code,
            description:   c.description || '',
            icon:          c.icon || '📚',
            color:         c.color || 'rgba(108,142,255,.12)',
            isCustom:      true,
            fromDb:        true,
            questions:     { length: c.questionCount || 0 },
          }
        })
        setDbCourses(map)
      })
      .catch(() => {})
      .finally(() => setLoadingDb(false))
  }, [])

  const history    = user?.history || []
  const localCourses = getAllCourses()

  // Merge: DB courses take priority over local ones with same code
  const allCourses = useMemo(() => ({
    ...localCourses,
    ...dbCourses,
  }), [localCourses, dbCourses])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return Object.entries(allCourses)
    return Object.entries(allCourses).filter(([id, data]) =>
      id.toLowerCase().includes(q) ||
      (data.name || '').toLowerCase().includes(q) ||
      (data.description || '').toLowerCase().includes(q)
    )
  }, [search, allCourses])

  const customCount  = filtered.filter(([, d]) => d.isCustom).length
  const builtInCount = filtered.filter(([, d]) => !d.isCustom).length

  return (
    <PageWrapper>
      <PageHeader
        title="📚 Categories"
        subtitle="Click any course to configure and start your quiz"
        action={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/builder')}>
              <Plus size={14} /> New Course
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/ai')}>
              🤖 AI Generate
            </Button>
          </div>
        }
      />

      {/* Search bar */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl"
        style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
        <Search size={14} style={{ color: 'var(--t3)', flexShrink: 0 }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search courses by name or subject..."
          className="bg-transparent text-sm outline-none flex-1"
          style={{ color: 'var(--t1)', fontFamily: 'DM Sans, sans-serif' }}
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-xs text-muted hover:text-primary transition-colors">
            Clear
          </button>
        )}
      </div>

      {loadingDb && (
        <div className="text-xs text-muted text-center py-2">Loading courses...</div>
      )}

      {/* No results */}
      {filtered.length === 0 && !loadingDb && (
        <motion.div className="rounded-2xl p-10 text-center"
          style={{ background: 'var(--bg1)', border: '1px dashed var(--border)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="font-display font-bold text-base text-primary mb-2">No courses found</h3>
          <p className="text-sm text-secondary mb-5">
            No courses match "<strong>{search}</strong>". Try a different search or create a custom course.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button variant="primary" size="sm" onClick={() => navigate('/builder')}>
              <Plus size={13} /> Create Course
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/ai')}>
              🤖 Generate with AI
            </Button>
          </div>
        </motion.div>
      )}

      {/* Custom/DB courses */}
      {customCount > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-sm text-primary">
              Courses
              <span className="ml-2 text-xs font-normal text-muted">({customCount})</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered
              .filter(([, d]) => d.isCustom)
              .map(([id, data], i) => (
                <CourseCard key={id} id={id} data={data} history={history} index={i} />
              ))}
          </div>
        </div>
      )}

      {/* Built-in courses */}
      {builtInCount > 0 && (
        <div>
          {customCount > 0 && (
            <h2 className="font-display font-semibold text-sm text-primary mb-3">
              Built-in Courses
              <span className="ml-2 text-xs font-normal text-muted">({builtInCount})</span>
            </h2>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered
              .filter(([, d]) => !d.isCustom)
              .map(([id, data], i) => (
                <CourseCard key={id} id={id} data={data} history={history} index={i} />
              ))}
          </div>
        </div>
      )}

      {/* Upload prompt */}
      <motion.div
        className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: 'var(--bg1)', border: '1px dashed var(--border)' }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}>
          <Upload size={20} style={{ color: 'var(--accent)' }} />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-semibold text-sm text-primary mb-0.5">
            Have your own study material?
          </h3>
          <p className="text-xs text-secondary">
            Upload a PDF or JSON file and we'll generate quiz questions from your content using AI.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/ai')}>
          Upload →
        </Button>
      </motion.div>
    </PageWrapper>
  )
}