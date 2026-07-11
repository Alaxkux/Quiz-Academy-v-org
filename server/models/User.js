/* ================================================================
   QUIZ ACADEMY — USER MODEL v4.1
   Added: googleId, hasSetPassword for Google OAuth support
   ================================================================ */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const QuizHistorySchema = new mongoose.Schema({
  category:         { type: String, required: true },
  date:             { type: Date,   default: Date.now },
  score:            { type: Number, default: 0 },
  total:            { type: Number, default: 0 },
  percentage:       { type: Number, default: 0 },
  points:           { type: Number, default: 0 },
  xpEarned:         { type: Number, default: 0 },
  timeTaken:        { type: String },
  timeTakenSeconds: { type: Number },
  isDailyChallenge: { type: Boolean, default: false },
  questionData:     { type: Array,   default: [] }
}, { _id: true });  // _id enabled for stable history entry references

const UserSchema = new mongoose.Schema({
  name: {
    type: String, required: true, trim: true,
    minlength: 2, maxlength: 60
  },
  email: {
    type: String, required: true, unique: true,
    lowercase: true, trim: true
  },
  password: {
    type: String, required: true
  },

  isAdmin:        { type: Boolean, default: false },
  adminPinHash:   { type: String, default: null },   // hashed admin PIN

  // ── Google OAuth ──
  googleId:       { type: String, default: null, sparse: true },
  hasSetPassword: { type: Boolean, default: true }, // false = Google-only account, no real password

  avatar: {
    type: String,
    default: function() {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=6C8EFF&color=fff&size=128`;
    }
  },
  bio:      { type: String, default: '', maxlength: 300 },
  joinDate: { type: Date,   default: Date.now },

  stats: {
    quizzesTaken:        { type: Number,   default: 0 },
    totalPoints:         { type: Number,   default: 0 },
    totalXP:             { type: Number,   default: 0 },
    currentLevel:        { type: Number,   default: 1 },
    streak:              { type: Number,   default: 0 },
    lastQuizDate:        { type: Date,     default: null },
    dailyChallengesDone: { type: Number,   default: 0 },
    categoriesPlayed:    { type: [String], default: [] },
    weightedAvgScore:    { type: Number,   default: null }
  },

  history:      { type: [QuizHistorySchema], default: [] },
  achievements: { type: [String], default: [] },
  notifications: [{
    id: Number, message: String, type: String,
    timestamp: String,
    date: { type: Date, default: Date.now },
    data: mongoose.Schema.Types.Mixed   // was missing — /friends/send pushes an extra `data` object here
  }],

  // ── Friends / social graph ──
  // NOTE: these were previously referenced throughout server/routes/auth.js
  // ($push/$addToSet to req.user.friends, friendRequests) but were never
  // declared here. Mongoose's default strict mode silently drops writes to
  // undeclared schema paths, so every "friend request" was returning a 200
  // OK while saving nothing — this is why the feature never actually worked.
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{
    from:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name:   String,
    avatar: String,
    date:   { type: Date, default: Date.now }
  }],

  settings: {
    theme:     { type: String, default: 'midnight' },
    timeLimit: { type: Number, default: 0 }
  },

  lastDailyChallenge:   { type: String,  default: null },
  isNewUser:            { type: Boolean, default: true },

  // Web Push subscriptions (one per device, max 5)
  pushSubscriptions: [{
    endpoint: { type: String, required: true },
    keys:     { type: Object, required: true },
    addedAt:  { type: Date,   default: Date.now }
  }],

  // Password reset
  resetPasswordToken:   { type: String },
  resetPasswordExpires: { type: Number },

  tokenVersion: { type: Number, default: 0 }
}, { timestamps: true });

// ── Hash password before saving ──
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (this.password.startsWith('$2')) return next(); // already hashed
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Compare password ──
UserSchema.methods.comparePassword = async function(candidate) {
  if (!this.hasSetPassword) return false; // Google-only accounts always fail password check
  return bcrypt.compare(candidate, this.password);
};

// ── Safe public profile ──
UserSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.tokenVersion;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.pushSubscriptions;
  delete obj.adminPinHash;       // never expose PIN hash
  delete obj.__v;
  obj.hasSetPassword = this.hasSetPassword;
  obj.isGoogleUser   = !!this.googleId;
  obj.isAdmin        = this.isAdmin;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);