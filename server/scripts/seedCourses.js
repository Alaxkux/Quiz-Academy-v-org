/* ================================================================
   QUIZ ACADEMY — COURSE SEED SCRIPT
   Run once to migrate built-in courses from quizData.js → MongoDB
   Usage: node server/scripts/seedCourses.js
   ================================================================ */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const Course   = require('../models/Course')

// ── Paste your quizData here (copied from quiz-academy-react/src/data/quizData.js) ──
const QUIZ_DATA = require('../../quiz-academy-react/src/data/quizData').QUIZ_DATA

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB connected')

    let created = 0
    let skipped = 0

    for (const [code, data] of Object.entries(QUIZ_DATA)) {
      const existing = await Course.findOne({ code })
      if (existing) {
        console.log(`⏭  Skipping ${code} — already exists`)
        skipped++
        continue
      }

      await Course.create({
        code,
        icon:        data.icon        || '📚',
        color:       data.color       || 'rgba(108,142,255,.12)',
        description: data.description || '',
        questions:   (data.questions  || []).map(q => ({
          q:           q.q,
          opts:        q.opts,
          a:           q.a,
          difficulty:  q.difficulty   || 'medium',
          explanation: q.explanation  || '',
        })),
        isActive: true,
        isCustom: false,
      })
      console.log(`✅ Created: ${code} (${data.questions?.length || 0} questions)`)
      created++
    }

    console.log(`\nSeed complete — ${created} created, ${skipped} skipped`)
    process.exit(0)
  } catch (err) {
    console.error('Seed error:', err)
    process.exit(1)
  }
}

seed()
