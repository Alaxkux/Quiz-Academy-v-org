/* ================================================================
   QUIZ ACADEMY — GAMIFICATION v4
   - New XP calculation (performance-based, slow & steady)
   - 20 levels, synced with data.js LEVELS array
   - Smart weighted average score
   - Minimal, elegant achievement animation (no excessive confetti)
   - Streak system
   ================================================================ */

// ── XP AWARD ──
function awardXP(amount, sx, sy) {
  if (!currentUser || amount <= 0) return;
  currentUser.stats.totalXP = (currentUser.stats.totalXP || 0) + amount;

  // Float XP label
  const f = document.createElement('div');
  f.className = 'xp-float';
  f.textContent = '+' + amount + ' XP';
  f.style.left = (sx || window.innerWidth / 2) + 'px';
  f.style.top  = (sy || 200) + 'px';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 1000);

  checkLevelUp();
  updateXPBar();
}

// ── LEVEL UP CHECK ──
function checkLevelUp() {
  const xp   = currentUser.stats.totalXP || 0;
  const info = getLevelInfo(xp);
  const prev = currentUser.stats.currentLevel || 1;
  if (info.current.level > prev) {
    currentUser.stats.currentLevel = info.current.level;
    showLevelUpToast(info.current);
    checkAchievements();
  }
}

function showLevelUpToast(li) {
  showToast(`${li.emoji} Level ${li.level} — ${li.title}!`, 'success', 4000);
  addNotif(`Level Up! You reached Level ${li.level}: ${li.title} ${li.emoji}`, 'success');
}

// ── XP BAR UPDATE ──
function updateXPBar() {
  const xp   = currentUser.stats.totalXP || 0;
  const info = getLevelInfo(xp);
  const badge = document.getElementById('xp-level-badge');
  const fill  = document.getElementById('xp-bar-fill');
  const label = document.getElementById('xp-label');
  if (badge) badge.textContent = `Lv.${info.current.level} ${info.current.title}`;
  if (fill)  fill.style.width  = info.progress + '%';
  if (label) label.textContent = info.next
    ? `${info.xpIntoLevel.toLocaleString()} / ${info.xpForNextLevel.toLocaleString()} XP`
    : 'MAX LEVEL';
}

// ── STREAK ──
function updateStreak() {
  const today = new Date().toDateString();
  const last  = currentUser.stats.lastQuizDate;
  if (last) {
    const ld = new Date(last).toDateString();
    const yd = new Date(Date.now() - 86400000).toDateString();
    if (ld === today) return;
    else if (ld === yd) currentUser.stats.streak++;
    else currentUser.stats.streak = 1;
  } else {
    currentUser.stats.streak = 1;
  }
  currentUser.stats.lastQuizDate = new Date().toISOString();
  if (currentUser.stats.streak > 1) {
    showToast(`🔥 ${currentUser.stats.streak}-day streak!`, 'warning');
  }
}

// ── DAILY CHALLENGE ──
function getDailyChallenge() {
  const today  = new Date().toDateString();
  const seed   = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const all    = typeof getAllCourses === 'function' ? getAllCourses() : QUIZ_DATA;
  const cats   = Object.keys(all);
  const cat    = cats[seed % cats.length];
  const qs     = all[cat].questions;
  const idxs   = [];
  let s = seed;
  while (idxs.length < Math.min(5, qs.length)) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const i = s % qs.length;
    if (!idxs.includes(i)) idxs.push(i);
  }
  return { category: cat, questions: idxs.map(i => qs[i]), date: today, bonusXP: 50 };
}

function isDailyChallengeCompleted() {
  return currentUser.lastDailyChallenge === new Date().toDateString();
}

function markDailyChallengeComplete() {
  currentUser.lastDailyChallenge = new Date().toDateString();
  currentUser.stats.dailyChallengesDone = (currentUser.stats.dailyChallengesDone || 0) + 1;
}

function getDailyCountdown() {
  const now = new Date(), mid = new Date(now);
  mid.setHours(24, 0, 0, 0);
  const d = mid - now, h = Math.floor(d / 3600000), m = Math.floor((d % 3600000) / 60000);
  return `Resets in ${h}h ${m}m`;
}

// ── MINIMAL ACHIEVEMENT ANIMATION ──
// Clean, elegant — no massive confetti explosion
function showAchievementFireAnimation(achievement) {
  document.getElementById('ach-fire-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'ach-fire-overlay';
  overlay.innerHTML = `
    <div class="ach-minimal-bg" onclick="this.parentElement.remove()"></div>
    <div class="ach-minimal-card">
      <div class="ach-minimal-glow"></div>
      <div class="ach-minimal-icon">${achievement.icon}</div>
      <div class="ach-minimal-label">Achievement Unlocked</div>
      <div class="ach-minimal-name">${achievement.name}</div>
      <div class="ach-minimal-desc">${achievement.desc}</div>
      <button class="ach-minimal-close" onclick="document.getElementById('ach-fire-overlay').remove()">Nice! ✕</button>
    </div>`;

  // Minimal particles — just 12 small dots
  const card = overlay.querySelector('.ach-minimal-card');
  const colors = ['#6C8EFF','#4DFFC3','#F5C842','#FF6B8A','#B57BFF'];
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.className = 'ach-particle';
    p.style.cssText = `
      left:${20 + Math.random() * 60}%;
      top:${10 + Math.random() * 30}%;
      background:${colors[i % colors.length]};
      animation-delay:${Math.random() * 0.4}s;
      animation-duration:${0.6 + Math.random() * 0.4}s;
    `;
    card.appendChild(p);
  }

  document.body.appendChild(overlay);
  setTimeout(() => overlay?.remove(), 4000);
}

// ── ACHIEVEMENTS CHECK ──
function checkAchievements() {
  if (!currentUser) return;
  const { stats, history, achievements } = currentUser;
  const newOnes = [];
  const check = (id, condition) => {
    if (condition && !achievements.includes(id)) newOnes.push(id);
  };

  const lvl = getLevelInfo(stats.totalXP || 0);

  check('first_quiz',        stats.quizzesTaken >= 1);
  check('quiz_5',            stats.quizzesTaken >= 5);
  check('quiz_10',           stats.quizzesTaken >= 10);
  check('quiz_50',           stats.quizzesTaken >= 50);
  check('quiz_100',          stats.quizzesTaken >= 100);
  check('points_500',        stats.totalPoints >= 500);
  check('points_1000',       stats.totalPoints >= 1000);
  check('points_5000',       stats.totalPoints >= 5000);
  check('streak_3',          stats.streak >= 3);
  check('streak_7',          stats.streak >= 7);
  check('streak_30',         stats.streak >= 30);
  check('level_5',           lvl.current.level >= 5);
  check('level_10',          lvl.current.level >= 10);
  check('level_15',          lvl.current.level >= 15);
  check('level_20',          lvl.current.level >= 20);
  check('daily_7',           (stats.dailyChallengesDone || 0) >= 7);
  check('all_categories',    (stats.categoriesPlayed || []).length >= Object.keys(QUIZ_DATA).length);

  const last = history[history.length - 1];
  if (last) {
    check('perfect_score', last.percentage === 100);
    check('speed_demon',   last.timeTakenSeconds < 60);
    // Comeback kid — last quiz 80%+ but previous quiz (if exists) was below 50%
    if (history.length >= 2) {
      const prev = history[history.length - 2];
      check('comeback_kid', last.percentage >= 80 && prev.percentage < 50);
    }
  }

  newOnes.forEach((id, i) => {
    currentUser.achievements.push(id);
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (!ach) return;
    // Stagger animations so they don't stack
    setTimeout(() => showAchievementFireAnimation(ach), i * 4500);
  });
}

// ── CATEGORY & WEEK HELPERS ──
function getWeekStart() {
  const now = new Date();
  const d   = now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1);
  const mon = new Date(now.setDate(d));
  mon.setHours(0, 0, 0, 0);
  return mon.toISOString();
}

function getWeeklyPoints(user) {
  const ws = getWeekStart();
  if (!user.history) return 0;
  return user.history.filter(h => h.date >= ws).reduce((s, h) => s + (h.points || 0), 0);
}

function trackCategory(cat) {
  if (!currentUser.stats.categoriesPlayed) currentUser.stats.categoriesPlayed = [];
  if (!currentUser.stats.categoriesPlayed.includes(cat)) {
    currentUser.stats.categoriesPlayed.push(cat);
  }
}

function getCategoryMastery(cat) {
  const h = (currentUser.history || []).filter(h => h.category === cat);
  if (!h.length) return 0;
  // Use smart average (weighted recent) for mastery too
  return calculateSmartAverage(h);
}
