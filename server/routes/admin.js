/* ================================================================
   QUIZ ACADEMY — ADMIN ROUTES
   All routes require auth + isAdmin
   GET    /api/admin/users         — list all users
   DELETE /api/admin/users/:id     — delete a user
   POST   /api/admin/pin/set       — set/change admin PIN
   POST   /api/admin/pin/verify    — verify admin PIN
   ================================================================ */

const express   = require('express')
const bcrypt    = require('bcryptjs')
const { requireAuth, requireAdmin } = require('../middleware/auth')
const User      = require('../models/User')

const router = express.Router()

// All admin routes require auth + admin
router.use(requireAuth, requireAdmin)

// ── GET all users ──
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email avatar isAdmin stats joinDate lastDailyChallenge createdAt')
      .sort({ createdAt: -1 })
    res.json({ users })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// ── DELETE user ──
router.delete('/users/:id', async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ error: 'You cannot delete your own account' })
    }
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ message: `User "${user.name}" deleted successfully` })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

// ── SET / CHANGE admin PIN ──
router.post('/pin/set', async (req, res) => {
  try {
    const { pin, currentPin } = req.body
    if (!pin || !/^\d{4,8}$/.test(pin))
      return res.status(400).json({ error: 'PIN must be 4–8 digits' })

    const admin = await User.findById(req.user._id)

    // If a PIN already exists, verify current PIN first
    if (admin.adminPinHash) {
      if (!currentPin)
        return res.status(400).json({ error: 'Current PIN is required to change PIN' })
      const match = await bcrypt.compare(String(currentPin), admin.adminPinHash)
      if (!match)
        return res.status(401).json({ error: 'Current PIN is incorrect' })
    }

    admin.adminPinHash = await bcrypt.hash(String(pin), 10)
    await admin.save()
    res.json({ message: 'Admin PIN set successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to set PIN' })
  }
})

// ── VERIFY admin PIN ──
router.post('/pin/verify', async (req, res) => {
  try {
    const { pin } = req.body
    const admin = await User.findById(req.user._id)

    if (!admin.adminPinHash)
      return res.status(400).json({ error: 'No PIN set — please set a PIN first', noPinSet: true })

    const match = await bcrypt.compare(String(pin), admin.adminPinHash)
    if (!match)
      return res.status(401).json({ error: 'Incorrect PIN' })

    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify PIN' })
  }
})

// ── CHECK if PIN is set ──
router.get('/pin/status', async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select('adminPinHash')
    res.json({ pinSet: !!admin.adminPinHash })
  } catch (err) {
    res.status(500).json({ error: 'Failed to check PIN status' })
  }
})

module.exports = router