/* ================================================================
   QUIZ ACADEMY — AI ROUTES v5
   All Gemini calls are server-side ONLY. Key never touches browser.
   Model: gemini-3.5-flash (Gemini 3.5 Flash)

   POST /api/ai/generate     — generate quiz questions
   POST /api/ai/from-pdf     — generate from uploaded PDF
   POST /api/ai/explain      — explain why answer is right/wrong
   POST /api/ai/hint         — give a hint for a question
   POST /api/ai/study-plan   — generate a study plan
   POST /api/ai/practice     — generate targeted practice questions
   ================================================================ */

const express   = require('express')
const rateLimit = require('express-rate-limit')
const { requireAuth } = require('../middleware/auth')
const User = require('../models/User')

const multer   = require('multer')
const pdfParse = require('pdf-parse')
const pdfUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

const router = express.Router()

// ── Model ──
const GEMINI_MODEL = 'gemini-3.5-flash'
const GEMINI_BASE  = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

// ── Rate limit: 5 requests/minute per user ──
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many AI requests — please wait a minute and try again' },
  keyGenerator: req => req.user?._id?.toString() || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
})

// ── Daily limit middleware: 10 AI requests per user per day ──
async function dailyLimitCheck(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select('aiUsage')
    const today = new Date().toDateString()
    const usage = user.aiUsage || {}

    if (usage.date !== today) {
      // Reset for new day
      await User.findByIdAndUpdate(req.user._id, {
        'aiUsage.date':  today,
        'aiUsage.count': 0,
      })
      req.aiUsageCount = 0
      return next()
    }

    if ((usage.count || 0) >= 10) {
      return res.status(429).json({
        error: 'Daily AI limit reached (10 requests/day). Resets at midnight.',
        limitReached: true,
      })
    }

    req.aiUsageCount = usage.count || 0
    next()
  } catch (err) {
    next() // Don't block if tracking fails
  }
}

// ── Increment usage after successful AI call ──
async function incrementUsage(userId) {
  const today = new Date().toDateString()
  await User.findByIdAndUpdate(userId, {
    $inc: { 'aiUsage.count': 1 },
    'aiUsage.date': today,
  }).catch(() => {})
}

// ── Core Gemini caller — lean, focused prompts ──
async function callGemini(prompt, temperature = 0.7, maxTokens = 4096) {
  if (!process.env.GEMINI_API_KEY)
    throw new Error('AI service not configured. Add GEMINI_API_KEY to .env')

  // Cap prompt length at ~2000 chars
  const safePrompt = prompt.slice(0, 2000)

  const res = await fetch(`${GEMINI_BASE}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: safePrompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        // Disable unnecessary features
        candidateCount: 1,
      },
      // No tools — no grounding, no code execution, no function calling
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    if (res.status === 429) throw new Error('AI rate limit reached — try again shortly')
    if (res.status === 400) throw new Error('Invalid request to AI service')
    throw new Error(`AI service error: ${res.status}`)
  }

  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// ── Parse JSON safely from Gemini text ──
function parseJSON(text) {
  if (!text) throw new Error('AI returned empty response')

  // Step 1: strip markdown fences
  let clean = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()

  // Step 2: direct parse
  try { return JSON.parse(clean) } catch (_) {}

  // Step 3: extract first JSON array [...]
  const arrMatch = clean.match(/\[[\s\S]*\]/)
  if (arrMatch) {
    try { return JSON.parse(arrMatch[0]) } catch (_) {}
  }

  // Step 4: extract first JSON object {...}
  const objMatch = clean.match(/\{[\s\S]*\}/)
  if (objMatch) {
    try { return JSON.parse(objMatch[0]) } catch (_) {}
  }

  // Step 5: fix trailing commas then retry
  try {
    const fixed = clean.replace(/,(\s*[}\]])/g, '$1')
    return JSON.parse(fixed)
  } catch (_) {}

  // Step 6: log for debugging
  console.error('parseJSON failed. Raw snippet:', text.slice(0, 400))
  throw new Error('Could not parse AI response — try again')
}


// ─────────────────────────────────────────────────────────────────
// POST /api/ai/generate — generate quiz questions from a topic
// ─────────────────────────────────────────────────────────────────
router.post('/generate', requireAuth, aiLimiter, dailyLimitCheck, async (req, res) => {
  try {
    const { topic, difficulty = 'medium', count = 10 } = req.body

    if (!topic || typeof topic !== 'string' || topic.trim().length < 2)
      return res.status(400).json({ error: 'Please provide a topic (at least 2 characters)' })
    if (!['easy','medium','hard','mixed'].includes(difficulty))
      return res.status(400).json({ error: 'Difficulty must be easy, medium, hard, or mixed' })

    const safeCount = Math.min(Math.max(parseInt(count) || 10, 1), 10)
    const diffNote  = difficulty === 'mixed' ? 'Mix easy, medium, and hard.' : `All ${difficulty} difficulty.`

    const prompt = `Generate exactly ${safeCount} multiple-choice questions about: "${topic.trim()}". ${diffNote}

IMPORTANT: Return ONLY a raw JSON array. No markdown. No explanation outside the JSON.
Keep each option under 15 words. Keep explanations under 20 words.

Format:
[{"q":"Question?","opts":["A","B","C","D"],"a":0,"explanation":"Short reason.","difficulty":"medium"}]

Rules: "a" = zero-based correct index. Exactly 4 opts. difficulty = easy/medium/hard.`

    const text = await callGemini(prompt, 0.7, 4096)
    const parsed = parseJSON(text)
    const questions = Array.isArray(parsed) ? parsed : (parsed.questions || [])

    const valid = questions.filter(q =>
      q.q && Array.isArray(q.opts) && q.opts.length >= 2 && typeof q.a === 'number'
    ).map(q => ({
      q:           q.q.trim(),
      opts:        q.opts.map(o => String(o).trim()),
      a:           q.a,
      explanation: q.explanation?.trim() || '',
      difficulty:  ['easy','medium','hard'].includes(q.difficulty) ? q.difficulty : 'medium',
    }))

    if (!valid.length) return res.status(500).json({ error: 'AI returned no valid questions — try again' })

    await incrementUsage(req.user._id)
    res.json({ questions: valid, count: valid.length, topic: topic.trim(),
      remaining: 10 - (req.aiUsageCount + 1) })

  } catch (err) {
    console.error('AI generate error:', err.message)
    res.status(500).json({ error: err.message || 'Failed to generate questions' })
  }
})

// ─────────────────────────────────────────────────────────────────
// POST /api/ai/explain — explain why an answer is right or wrong
// Lean prompt: only question + answers needed
// ─────────────────────────────────────────────────────────────────
router.post('/explain', requireAuth, aiLimiter, dailyLimitCheck, async (req, res) => {
  try {
    const { question, selectedAnswer, correctAnswer, topic } = req.body
    if (!question || selectedAnswer === undefined || correctAnswer === undefined)
      return res.status(400).json({ error: 'question, selectedAnswer and correctAnswer are required' })

    const isCorrect = selectedAnswer === correctAnswer
    const prompt = `Quiz question: "${String(question).slice(0, 300)}"
Selected answer: "${String(selectedAnswer).slice(0, 100)}"
Correct answer: "${String(correctAnswer).slice(0, 100)}"
${topic ? `Topic: ${topic}` : ''}

${isCorrect ? 'The user got it right. Briefly explain why this answer is correct (2-3 sentences).' : 'The user got it wrong. Explain clearly why the correct answer is right and the selected answer is wrong (2-3 sentences).'}
Be educational and concise.`

    const explanation = await callGemini(prompt, 0.5, 300)
    await incrementUsage(req.user._id)
    res.json({ explanation: explanation.trim(), remaining: 10 - (req.aiUsageCount + 1) })

  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to generate explanation' })
  }
})

// ─────────────────────────────────────────────────────────────────
// POST /api/ai/hint — give a hint for a question mid-quiz
// ─────────────────────────────────────────────────────────────────
router.post('/hint', requireAuth, aiLimiter, dailyLimitCheck, async (req, res) => {
  try {
    const { question, options } = req.body
    if (!question) return res.status(400).json({ error: 'question is required' })

    const prompt = `Quiz question: "${String(question).slice(0, 300)}"
Options: ${(options || []).map((o,i) => `${String.fromCharCode(65+i)}. ${o}`).join(', ')}

Give ONE short hint (1-2 sentences) that helps the user think toward the correct answer WITHOUT revealing it directly. Be subtle.`

    const hint = await callGemini(prompt, 0.6, 150)
    await incrementUsage(req.user._id)
    res.json({ hint: hint.trim(), remaining: 10 - (req.aiUsageCount + 1) })

  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to generate hint' })
  }
})

// ─────────────────────────────────────────────────────────────────
// POST /api/ai/study-plan — generate a personalized study plan
// ─────────────────────────────────────────────────────────────────
router.post('/study-plan', requireAuth, aiLimiter, dailyLimitCheck, async (req, res) => {
  try {
    const { weakTopics = [], goal = 'improve', daysAvailable = 7 } = req.body

    const prompt = `Create a ${daysAvailable}-day study plan for a student who wants to ${goal}.
Weak areas: ${weakTopics.slice(0, 5).join(', ') || 'general improvement'}.

Return ONLY valid JSON:
{"plan":[{"day":1,"focus":"Topic","tasks":["Task 1","Task 2"],"duration":"30 mins"}],"tips":["Tip 1","Tip 2"]}`

    const text = await callGemini(prompt, 0.6, 800)
    const plan  = parseJSON(text)
    await incrementUsage(req.user._id)
    res.json({ ...plan, remaining: 10 - (req.aiUsageCount + 1) })

  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to generate study plan' })
  }
})

// ─────────────────────────────────────────────────────────────────
// POST /api/ai/practice — generate targeted practice questions
// ─────────────────────────────────────────────────────────────────
router.post('/practice', requireAuth, aiLimiter, dailyLimitCheck, async (req, res) => {
  try {
    const { topic, weakAreas = [], count = 5 } = req.body
    if (!topic) return res.status(400).json({ error: 'topic is required' })

    const safeCount = Math.min(parseInt(count) || 5, 10)
    const focus = weakAreas.length ? `Focus specifically on: ${weakAreas.slice(0,3).join(', ')}.` : ''

    const prompt = `Generate ${safeCount} targeted practice questions about "${topic.slice(0,100)}". ${focus}
Make questions that test understanding, not memorisation.
Return ONLY valid JSON array:
[{"q":"Question?","opts":["A","B","C","D"],"a":0,"explanation":"Why correct.","difficulty":"medium"}]`

    const text = await callGemini(prompt, 0.7, 1024)
    const parsed = parseJSON(text)
    const questions = (Array.isArray(parsed) ? parsed : []).filter(q =>
      q.q && Array.isArray(q.opts) && typeof q.a === 'number'
    )

    await incrementUsage(req.user._id)
    res.json({ questions, count: questions.length, remaining: 10 - (req.aiUsageCount + 1) })

  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to generate practice questions' })
  }
})

// ─────────────────────────────────────────────────────────────────
// POST /api/ai/from-pdf — generate questions from uploaded PDF
// ─────────────────────────────────────────────────────────────────
router.post('/from-pdf', requireAuth, aiLimiter, dailyLimitCheck, async (req, res) => {
  try {
    pdfUpload.single('pdf')(req, res, async (err) => {
      if (err) return res.status(400).json({ error: 'Upload failed: ' + err.message })
      if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' })

      let text = ''
      try {
        const data = await pdfParse(req.file.buffer)
        text = data.text?.trim() || ''
      } catch {
        return res.status(400).json({ error: 'Could not extract text from PDF. Use a text-based PDF, not a scanned image.' })
      }

      if (!text || text.length < 100)
        return res.status(400).json({ error: 'PDF has too little text to generate questions from' })

      // Truncate to fit within 2000 char prompt budget
      const truncated = text.split(/\s+/).slice(0, 500).join(' ')
      const difficulty = req.body.difficulty || 'medium'
      const count      = Math.min(10, parseInt(req.body.count) || 5)

      const prompt = `Based ONLY on this study material, generate ${count} multiple-choice questions. Difficulty: ${difficulty}.

MATERIAL: ${truncated}

Return ONLY valid JSON array:
[{"q":"?","opts":["A","B","C","D"],"a":0,"explanation":"Why.","difficulty":"${difficulty}"}]`

      const raw = await callGemini(prompt, 0.5, 1500)
      const parsed = parseJSON(raw)
      const questions = (Array.isArray(parsed) ? parsed : []).filter(q =>
        q.q && Array.isArray(q.opts) && q.opts.length >= 2 && typeof q.a === 'number'
      )

      if (!questions.length) return res.status(500).json({ error: 'No valid questions generated — try a different PDF' })

      await incrementUsage(req.user._id)
      res.json({ questions, count: questions.length, remaining: 10 - (req.aiUsageCount + 1) })
    })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to process PDF' })
  }
})

// ── GET usage — how many requests left today ──
router.get('/usage', requireAuth, async (req, res) => {
  try {
    const user  = await User.findById(req.user._id).select('aiUsage')
    const today = new Date().toDateString()
    const usage = user.aiUsage || {}
    const count = usage.date === today ? (usage.count || 0) : 0
    res.json({ used: count, limit: 10, remaining: 10 - count })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch usage' })
  }
})

module.exports = router
