/* ================================================================
   QUIZ ACADEMY — AI ROUTES v4
   POST /api/ai/generate  — generate quiz questions via Google Gemini
   The Gemini API key lives in .env — never exposed to the browser.
   Free tier: 15 req/min, 1500 req/day — no billing needed.
   ================================================================ */

const express   = require('express');
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ── Rate limit: 10 AI requests per user per minute ──
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many AI requests — please wait a minute and try again' },
  keyGenerator: (req) => req.user?._id?.toString() || req.ip
});

// ── GENERATE QUESTIONS via Gemini ──
router.post('/generate', requireAuth, aiLimiter, async (req, res) => {
  try {
    const { topic, difficulty = 'medium', count = 10 } = req.body;

    if (!topic || typeof topic !== 'string' || topic.trim().length < 2)
      return res.status(400).json({ error: 'Please provide a topic (at least 2 characters)' });
    if (!['easy','medium','hard','mixed'].includes(difficulty))
      return res.status(400).json({ error: 'Difficulty must be easy, medium, hard, or mixed' });

    const safeCount = Math.min(Math.max(parseInt(count) || 10, 1), 20);

    if (!process.env.GEMINI_API_KEY)
      return res.status(503).json({ error: 'AI service not configured. Add GEMINI_API_KEY to .env' });

    const diffInstruction = difficulty === 'mixed'
      ? 'Mix easy, medium, and hard questions evenly.'
      : `All questions must be ${difficulty} difficulty.`;

    const prompt = `Generate exactly ${safeCount} multiple-choice quiz questions about: "${topic.trim()}".
${diffInstruction}

Return ONLY a valid JSON array with no markdown, no code blocks, no extra text:
[
  {
    "q": "Question text here?",
    "opts": ["Option A", "Option B", "Option C", "Option D"],
    "a": 0,
    "explanation": "Clear explanation of why the correct answer is right (1-2 sentences).",
    "difficulty": "medium"
  }
]

Rules:
- "a" is the zero-based index of the correct answer (0-3)
- Exactly 4 options per question
- Explanations must be educational and accurate
- Questions must be clear and unambiguous
- difficulty must be exactly "easy", "medium", or "hard"`;

    // ── Call Gemini API ──
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature:     0.7,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json'
        },
        systemInstruction: {
          parts: [{ text: 'You are an educational quiz question generator. Return only valid JSON arrays of questions. Never include markdown, code fences, or explanatory text outside the JSON.' }]
        }
      })
    });

    if (!geminiRes.ok) {
      const errBody = await geminiRes.json().catch(() => ({}));
      console.error('Gemini API error:', geminiRes.status, errBody);
      if (geminiRes.status === 429)
        return res.status(429).json({ error: 'AI rate limit reached — try again in a moment' });
      if (geminiRes.status === 400)
        return res.status(400).json({ error: 'Invalid request to AI service' });
      return res.status(503).json({ error: 'AI service temporarily unavailable' });
    }

    const geminiData = await geminiRes.json();
    let text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse response
    let questions;
    try {
      // Strip any accidental markdown fences
      text = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(text);
      questions = Array.isArray(parsed)
        ? parsed
        : (parsed.questions || parsed.quiz || Object.values(parsed)[0]);
    } catch {
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) return res.status(500).json({ error: 'AI returned unparseable response — try again' });
      questions = JSON.parse(match[0]);
    }

    if (!Array.isArray(questions) || questions.length === 0)
      return res.status(500).json({ error: 'AI returned no questions — try a different topic' });

    // Validate + sanitize
    const valid = questions.filter(q =>
      q.q && typeof q.q === 'string' &&
      Array.isArray(q.opts) && q.opts.length >= 2 &&
      typeof q.a === 'number' && q.a >= 0 && q.a < q.opts.length
    ).map(q => ({
      q:           q.q.trim(),
      opts:        q.opts.map(o => String(o).trim()),
      a:           q.a,
      explanation: q.explanation?.trim() || 'See your course materials for more information.',
      difficulty:  ['easy','medium','hard'].includes(q.difficulty) ? q.difficulty : difficulty === 'mixed' ? 'medium' : difficulty
    }));

    if (valid.length === 0)
      return res.status(500).json({ error: 'AI questions failed validation — please try again' });

    res.json({ questions: valid, count: valid.length, topic: topic.trim() });

  } catch (err) {
    console.error('AI generate error:', err);
    res.status(500).json({ error: 'Failed to generate questions — please try again' });
  }
});

module.exports = router;

// ── GENERATE FROM PDF ──
router.post('/from-pdf', requireAuth, aiLimiter, async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY)
      return res.status(503).json({ error: 'AI service not configured' })

    // Handle multipart form — use multer in memory
    const multer   = require('multer')
    const pdfParse = require('pdf-parse')
    const upload   = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

    upload.single('pdf')(req, res, async (err) => {
      if (err) return res.status(400).json({ error: 'Upload failed: ' + err.message })
      if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' })

      let text = ''
      try {
        const data = await pdfParse(req.file.buffer)
        text = data.text?.trim() || ''
      } catch (e) {
        return res.status(400).json({ error: 'Could not extract text from PDF. Ensure it is a text-based PDF, not a scanned image.' })
      }

      if (!text || text.length < 100)
        return res.status(400).json({ error: 'PDF has too little text to generate questions from' })

      // Truncate to ~8000 words to fit Gemini token limit
      const words    = text.split(/\s+/)
      const truncated = words.slice(0, 8000).join(' ')

      const difficulty = req.body.difficulty || 'medium'
      const count      = Math.min(20, parseInt(req.body.count) || 10)

      const prompt = `Based ONLY on the following study material, generate exactly ${count} multiple-choice questions.
Difficulty: ${difficulty}. 

STUDY MATERIAL:
${truncated}

Return ONLY a valid JSON array with no markdown, no code blocks:
[{"q":"...","opts":["A","B","C","D"],"a":0,"explanation":"...","difficulty":"${difficulty}"}]

Rules: "a" is the zero-based index of the correct answer. Exactly 4 options per question. Only use information from the material provided.`

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 4096, responseMimeType: 'application/json' }
        })
      })

      if (!geminiRes.ok) return res.status(503).json({ error: 'AI service unavailable — try again' })

      const geminiData = await geminiRes.json()
      let raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      raw = raw.replace(/```json|```/g, '').trim()

      let questions
      try { questions = JSON.parse(raw) } catch {
        const m = raw.match(/\[[\s\S]*\]/)
        if (!m) return res.status(500).json({ error: 'AI returned unparseable response' })
        questions = JSON.parse(m[0])
      }

      const valid = (Array.isArray(questions) ? questions : []).filter(q =>
        q.q && Array.isArray(q.opts) && q.opts.length >= 2 && typeof q.a === 'number'
      )

      if (!valid.length) return res.status(500).json({ error: 'No valid questions generated — try a different PDF' })

      res.json({ questions: valid, count: valid.length })
    })
  } catch (err) {
    console.error('PDF generate error:', err)
    res.status(500).json({ error: 'Failed to process PDF' })
  }
})
