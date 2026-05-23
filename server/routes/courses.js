/* ================================================================
   QUIZ ACADEMY — COURSES ROUTES
   GET    /api/courses          → list all active courses
   GET    /api/courses/:code    → get one course with questions
   POST   /api/courses          → create course (admin only)
   PUT    /api/courses/:code    → edit course (admin only)
   DELETE /api/courses/:code    → delete course (admin only)
   ================================================================ */

const router  = require('express').Router()
const Course  = require('../models/Course')
const { requireAuth, requireAdmin } = require('../middleware/auth')

// ── GET all active courses (public) ──
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true })
      .select('code icon color description isCustom createdAt questions')
      .sort({ code: 1 })
    res.json({ courses: courses.map(c => ({
      code: c.code,
      icon: c.icon,
      color: c.color,
      description: c.description,
      isCustom: c.isCustom,
      createdAt: c.createdAt,
      questionCount: c.questions?.length || 0,
    })) })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses' })
  }
})

// ── GET one course with full questions ──
router.get('/:code', async (req, res) => {
  try {
    const course = await Course.findOne({
      code: req.params.code,
      isActive: true,
    })
    if (!course) return res.status(404).json({ error: 'Course not found' })
    res.json({ course })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch course' })
  }
})

// ── POST create course (authenticated) ──
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { code, icon, color, description, questions } = req.body

    if (!code || !code.trim())       return res.status(400).json({ error: 'Course code is required' })
    if (!questions || questions.length < 1) return res.status(400).json({ error: 'At least 1 question required' })

    const existing = await Course.findOne({ code: code.trim() })
    if (existing) return res.status(400).json({ error: `Course "${code}" already exists` })

    const course = await Course.create({
      code:        code.trim(),
      icon:        icon        || '📚',
      color:       color       || 'rgba(108,142,255,.12)',
      description: description || '',
      questions,
      isCustom:    true,
      createdBy:   req.user._id,
    })

    res.status(201).json({ course, message: 'Course created successfully' })
  } catch (err) {
    console.error('Create course error:', err)
    res.status(500).json({ error: 'Failed to create course' })
  }
})

// ── PUT update course (authenticated + must be creator or built-in admin) ──
router.put('/:code', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { icon, color, description, questions, isActive } = req.body

    const course = await Course.findOne({ code: req.params.code })
    if (!course) return res.status(404).json({ error: 'Course not found' })

    // Only creator can edit custom courses
    if (course.isCustom && String(course.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ error: 'You can only edit your own courses' })
    }

    if (icon        !== undefined) course.icon        = icon
    if (color       !== undefined) course.color       = color
    if (description !== undefined) course.description = description
    if (questions   !== undefined) course.questions   = questions
    if (isActive    !== undefined) course.isActive    = isActive

    await course.save()
    res.json({ course, message: 'Course updated successfully' })
  } catch (err) {
    console.error('Update course error:', err)
    res.status(500).json({ error: 'Failed to update course' })
  }
})

// ── DELETE course (soft delete — sets isActive: false) ──
router.delete('/:code', requireAuth, requireAdmin, async (req, res) => {
  try {
    const course = await Course.findOne({ code: req.params.code })
    if (!course) return res.status(404).json({ error: 'Course not found' })

    if (course.isCustom && String(course.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ error: 'You can only delete your own courses' })
    }

    course.isActive = false
    await course.save()
    res.json({ message: `Course "${req.params.code}" removed successfully` })
  } catch (err) {
    console.error('Delete course error:', err)
    res.status(500).json({ error: 'Failed to delete course' })
  }
})

module.exports = router
// ── POST bulk upload questions to existing course ──
router.post('/:code/questions', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { questions } = req.body
    if (!Array.isArray(questions) || questions.length === 0)
      return res.status(400).json({ error: 'questions must be a non-empty array' })

    const course = await Course.findOne({ code: req.params.code })
    if (!course) return res.status(404).json({ error: 'Course not found' })

    // Validate each question: must have q, opts (array ≥2), a (number)
    const valid = questions.filter(q =>
      q.q && typeof q.q === 'string' &&
      Array.isArray(q.opts) && q.opts.length >= 2 &&
      typeof q.a === 'number' && q.a >= 0 && q.a < q.opts.length
    ).map(q => ({
      q:           q.q.trim(),
      opts:        q.opts.map(o => String(o).trim()),
      a:           q.a,
      explanation: q.explanation?.trim() || '',
      difficulty:  ['easy','medium','hard'].includes(q.difficulty) ? q.difficulty : 'medium',
    }))

    if (valid.length === 0)
      return res.status(400).json({ error: 'No valid questions found. Each question needs: q, opts (array), a (index)' })

    // Append to existing questions (or replace if ?replace=true)
    if (req.query.replace === 'true') {
      course.questions = valid
    } else {
      course.questions = [...(course.questions || []), ...valid]
    }

    await course.save()
    res.json({
      message: `${valid.length} question${valid.length !== 1 ? 's' : ''} uploaded successfully`,
      total: course.questions.length,
      added: valid.length,
      skipped: questions.length - valid.length,
    })
  } catch (err) {
    console.error('Upload questions error:', err)
    res.status(500).json({ error: 'Failed to upload questions' })
  }
})
