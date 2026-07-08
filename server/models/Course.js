/* ================================================================
   QUIZ ACADEMY — COURSE MODEL
   Stores courses in MongoDB so they can be managed via admin UI
   ================================================================ */

const mongoose = require('mongoose')

const QuestionSchema = new mongoose.Schema({
  q:           { type: String, required: true },
  opts:        [{ type: String, required: true }],
  a:           { type: Number, required: true },        // correct option index
  difficulty:  { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  explanation: { type: String, default: '' },
}, { _id: false })

const CourseSchema = new mongoose.Schema({
  code:        { type: String, required: true, unique: true, trim: true }, // e.g. 'IFT 203'
  name:        { type: String, default: '' },  // display name e.g. 'Web Technologies'
  shareToken:  { type: String, unique: true, sparse: true }, // for public sharing
  icon:        { type: String, default: '📚' },
  color:       { type: String, default: 'rgba(108,142,255,.12)' },
  description: { type: String, default: '' },
  questions:   [QuestionSchema],
  isActive:    { type: Boolean, default: true },        // hide without deleting
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isCustom:    { type: Boolean, default: false },        // user-created vs built-in
}, { timestamps: true })

module.exports = mongoose.model('Course', CourseSchema)
