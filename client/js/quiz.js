/* ================================================================
   QUIZ ACADEMY — QUIZ ENGINE v4
   - Quiz config/preference page before every quiz
   - CBT mode (no answer indicators during quiz)
   - Full exit guard: sidebar, browser tab, back button
   - Results in 2x2 grid
   - Improved review screen
   ================================================================ */

let currentQuiz  = null;
let quizTimer    = null;
let quizTimeElapsed = 0;
let questionCountdownTimer = null;
let reviewCurrentIndex = 0;

// ── SHUFFLE ──
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ================================================================
// QUIZ CONFIG PAGE — shown before every quiz starts
// ================================================================
function showQuizConfig(options = {}) {
  // options: { category, questions, isDailyChallenge, title }
  const { category = '', questions = null, isDailyChallenge = false, title = '' } = options;

  const displayName = title || category || 'Quiz';

  document.getElementById('page-wrap').innerHTML = `
    <div class="quiz-config-shell anim-fade-up">
      <div class="qc-header">
        <h1>⚙️ Quiz Setup</h1>
        <p>Configure your quiz for <strong>${displayName}</strong></p>
      </div>

      <div class="qc-grid">

        <!-- Difficulty -->
        <div class="qc-card">
          <div class="qc-card-icon">🎯</div>
          <div class="qc-card-label">Difficulty</div>
          <div class="qc-options" id="qc-diff">
            <button class="qc-opt" data-val="easy" onclick="qcSelect('diff','easy',this)">Easy</button>
            <button class="qc-opt active" data-val="all" onclick="qcSelect('diff','all',this)">All</button>
            <button class="qc-opt" data-val="medium" onclick="qcSelect('diff','medium',this)">Medium</button>
            <button class="qc-opt" data-val="hard" onclick="qcSelect('diff','hard',this)">Hard</button>
          </div>
        </div>

        <!-- Number of questions -->
        <div class="qc-card">
          <div class="qc-card-icon">🔢</div>
          <div class="qc-card-label">Questions</div>
          <div class="qc-options" id="qc-count">
            <button class="qc-opt" data-val="5" onclick="qcSelect('count','5',this)">5</button>
            <button class="qc-opt active" data-val="10" onclick="qcSelect('count','10',this)">10</button>
            <button class="qc-opt" data-val="15" onclick="qcSelect('count','15',this)">15</button>
            <button class="qc-opt" data-val="20" onclick="qcSelect('count','20',this)">20</button>
          </div>
        </div>

        <!-- Time limit -->
        <div class="qc-card">
          <div class="qc-card-icon">⏱️</div>
          <div class="qc-card-label">Time per Question</div>
          <div class="qc-options" id="qc-time">
            <button class="qc-opt active" data-val="0" onclick="qcSelect('time','0',this)">None</button>
            <button class="qc-opt" data-val="30" onclick="qcSelect('time','30',this)">30s</button>
            <button class="qc-opt" data-val="60" onclick="qcSelect('time','60',this)">60s</button>
            <button class="qc-opt" data-val="90" onclick="qcSelect('time','90',this)">90s</button>
          </div>
        </div>

        <!-- Answer display mode -->
        <div class="qc-card">
          <div class="qc-card-icon">👁️</div>
          <div class="qc-card-label">Show Answers</div>
          <div class="qc-options" id="qc-reveal">
            <button class="qc-opt active" data-val="after" onclick="qcSelect('reveal','after',this)">
              After Quiz<br><span class="qc-opt-sub">CBT style — no indicators</span>
            </button>
            <button class="qc-opt" data-val="during" onclick="qcSelect('reveal','during',this)">
              During Quiz<br><span class="qc-opt-sub">See right/wrong live</span>
            </button>
          </div>
        </div>

      </div>

      <div class="qc-summary" id="qc-summary">
        Ready: <strong>10 questions</strong> · All difficulties · No time limit · Results after quiz
      </div>

      <button class="btn btn-primary qc-start-btn" onclick="launchConfiguredQuiz()">
        ▶ Start Quiz
      </button>
      <button class="btn btn-ghost" style="margin-top:8px;width:100%;max-width:420px" onclick="navigate('categories')">
        Cancel
      </button>
    </div>`;

  // Store pending quiz options in a temp object
  window._pendingQuiz = {
    category,
    questions,
    isDailyChallenge,
    diff: 'all',
    count: 10,
    time: 0,
    reveal: 'after'
  };

  updateQCSummary();
}

function qcSelect(type, val, el) {
  const group = el.closest('.qc-options');
  group.querySelectorAll('.qc-opt').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  if (type === 'diff')   window._pendingQuiz.diff   = val;
  if (type === 'count')  window._pendingQuiz.count  = parseInt(val);
  if (type === 'time')   window._pendingQuiz.time   = parseInt(val);
  if (type === 'reveal') window._pendingQuiz.reveal = val;
  updateQCSummary();
}

function updateQCSummary() {
  const p = window._pendingQuiz;
  const el = document.getElementById('qc-summary');
  if (!el) return;
  const diffLabel  = p.diff === 'all' ? 'All difficulties' : p.diff.charAt(0).toUpperCase() + p.diff.slice(1);
  const timeLabel  = p.time === 0 ? 'No time limit' : `${p.time}s per question`;
  const revealLabel = p.reveal === 'during' ? 'Live feedback' : 'Results after quiz';
  el.innerHTML = `Ready: <strong>${p.count} questions</strong> · ${diffLabel} · ${timeLabel} · ${revealLabel}`;
}

function launchConfiguredQuiz() {
  const p = window._pendingQuiz;
  if (!p) return;

  const all = typeof getAllCourses === 'function' ? getAllCourses() : QUIZ_DATA;
  let qs = p.questions || all[p.category]?.questions;

  if (!qs?.length) return showToast('No questions available', 'error');

  // Filter by difficulty
  if (p.diff !== 'all') {
    const filtered = qs.filter(q => q.difficulty === p.diff);
    if (filtered.length) qs = filtered;
    else showToast(`No ${p.diff} questions found, using all`, 'warning');
  }

  // Shuffle and limit
  qs = shuffle([...qs]).slice(0, p.count);

  currentQuiz = {
    category:         p.category || 'Quiz',
    difficulty:       p.diff,
    isDailyChallenge: p.isDailyChallenge,
    questions:        qs,
    currentIndex:     0,
    answers:          [],
    startTime:        Date.now(),
    timeElapsed:      0,
    _tabLeft:         0,
    revealMode:       p.reveal,     // 'during' | 'after'
    timePerQ:         p.time        // seconds, 0 = none
  };

  // Update user time limit setting from config
  if (!currentUser.settings) currentUser.settings = {};
  currentUser.settings.timeLimit = p.time;

  localStorage.setItem('inProgressQuiz', JSON.stringify(currentQuiz));

  if (!p.isDailyChallenge && p.category) trackCategory(p.category);

  enableLeaveGuard();
  lockSidebarNav(true);
  startOverallTimer();
  renderQuiz();
}

// ================================================================
// QUIZ STARTERS — all route through showQuizConfig
// ================================================================
function startQuiz(category, difficulty = 'all', isDailyChallenge = false, providedQuestions = null) {
  showQuizConfig({ category, questions: providedQuestions, isDailyChallenge });
}

function startRandomQuiz() {
  const all  = typeof getAllCourses === 'function' ? getAllCourses() : QUIZ_DATA;
  const pool = [];
  Object.entries(all).forEach(([cat, d]) => d.questions.forEach(q => pool.push({ ...q, _cat: cat })));
  showQuizConfig({ category: 'Mixed Topics', questions: pool, title: 'Quick Play — Mixed Topics' });
}

function startDailyChallenge() {
  if (isDailyChallengeCompleted()) return showToast('Already completed today! Come back tomorrow', 'info');
  const d = getDailyChallenge();
  showQuizConfig({ category: d.category, questions: d.questions, isDailyChallenge: true, title: `Daily Challenge — ${d.category}` });
}

function resumeLastQuiz() {
  const saved = localStorage.getItem('inProgressQuiz');
  if (!saved) return showToast('No quiz to resume', 'info');
  const q = JSON.parse(saved);
  if (!q.questions?.length) return showToast('Cannot resume — data incomplete', 'error');
  currentQuiz = q;
  currentQuiz.startTime = Date.now() - ((currentQuiz.timeElapsed || 0) * 1000);
  enableLeaveGuard();
  lockSidebarNav(true);
  startOverallTimer();
  renderQuiz();
  showToast('Quiz resumed', 'success');
}

function startWeakTopics() {
  const all  = typeof getAllCourses === 'function' ? getAllCourses() : QUIZ_DATA;
  const weak = Object.keys(all).filter(cat => { const m = getCategoryMastery(cat); return m > 0 && m < 60; });
  if (!weak.length) return showToast("No weak topics — you're doing great!", 'success');
  const pool = [];
  weak.forEach(cat => all[cat].questions.forEach(q => pool.push({ ...q, _cat: cat })));
  showQuizConfig({ category: 'Weak Topics', questions: pool, title: `Weak Topics — ${weak.join(', ')}` });
}

function reviewMistakes() {
  const hist = currentUser.history || [];
  const wrongQuestions = [];
  hist.slice(-10).forEach(h => {
    if (!h.questionData) return;
    h.questionData.filter(q => !q.isCorrect && q.userAnswer !== null).forEach(q => {
      wrongQuestions.push({
        q:           q.question,
        opts:        q.options,
        a:           q.correctIndex,
        explanation: q.explanation || '',
        difficulty:  'medium',
        _wasWrong:   true
      });
    });
  });
  if (!wrongQuestions.length) return showToast('No mistakes to review from recent quizzes!', 'info');
  showQuizConfig({ category: 'Mistake Review', questions: wrongQuestions, title: 'Review Your Mistakes' });
  // Track achievement
  if (!currentUser.achievements.includes('mistake_reviewer')) {
    currentUser.achievements.push('mistake_reviewer');
    const ach = ACHIEVEMENTS.find(a => a.id === 'mistake_reviewer');
    if (ach) setTimeout(() => showAchievementFireAnimation(ach), 500);
  }
}

function reviewLastQuiz() {
  const hist = currentUser.history;
  if (!hist?.length) return showToast('No quiz history yet', 'info');
  const last = hist[hist.length - 1];
  if (!last.questionData) return showToast('Review not available for older quizzes', 'info');
  renderReviewScreen(last);
}

// ================================================================
// SIDEBAR LOCK — disables nav during quiz
// ================================================================
function lockSidebarNav(lock) {
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    if (lock) {
      item.classList.add('nav-locked');
      item._origClick = item.onclick;
      item.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        showQuitPrompt();
      };
    } else {
      item.classList.remove('nav-locked');
      if (item._origClick !== undefined) {
        item.onclick = item._origClick;
        delete item._origClick;
      }
    }
  });
}

function showQuitPrompt() {
  showConfirm(
    'Quit Quiz?',
    'Your progress will be lost and your score won\'t be saved. Are you sure you want to quit?',
    '⚠️',
    () => {
      stopOverallTimer();
      clearInterval(questionCountdownTimer);
      disableLeaveGuard();
      lockSidebarNav(false);
      currentQuiz = null;
      localStorage.removeItem('inProgressQuiz');
      navigate('home');
    }
  );
}

// ================================================================
// LEAVE GUARD
// ================================================================
function enableLeaveGuard() {
  window._leaveGuard = e => { e.preventDefault(); e.returnValue = ''; return ''; };
  window.addEventListener('beforeunload', window._leaveGuard);

  window._visGuard = () => {
    if (document.hidden && currentQuiz) {
      currentQuiz._tabLeft = (currentQuiz._tabLeft || 0) + 1;
      // Show in-app quit prompt when switching tabs
      setTimeout(() => {
        if (currentQuiz) showTabLeaveWarning(currentQuiz._tabLeft);
      }, 300);
    }
  };
  document.addEventListener('visibilitychange', window._visGuard);

  // Back button guard
  history.pushState(null, '', location.href);
  window._popGuard = () => {
    history.pushState(null, '', location.href);
    if (currentQuiz) showQuitPrompt();
  };
  window.addEventListener('popstate', window._popGuard);
}

function disableLeaveGuard() {
  if (window._leaveGuard) { window.removeEventListener('beforeunload', window._leaveGuard); window._leaveGuard = null; }
  if (window._visGuard)   { document.removeEventListener('visibilitychange', window._visGuard); window._visGuard = null; }
  if (window._popGuard)   { window.removeEventListener('popstate', window._popGuard); window._popGuard = null; }
}

function showTabLeaveWarning(count) {
  if (!currentQuiz) return;
  const modal = document.getElementById('tab-switch-modal');
  if (!modal) return showQuitPrompt(); // Fallback

  const title  = document.getElementById('tsm-title');
  const msg    = document.getElementById('tsm-msg');
  const contBtn = document.getElementById('tsm-continue');
  const quitBtn = document.getElementById('tsm-quit');

  if (count >= 3) {
    title.textContent = '⛔ Too Many Tab Switches';
    msg.innerHTML = 'You\'ve left the quiz <strong>3 times</strong>. Quiz cancelled — score not saved.';
    contBtn.style.display = 'none';
    quitBtn.textContent = 'Back to Dashboard';
    quitBtn.onclick = () => {
      modal.classList.remove('open');
      stopOverallTimer(); clearInterval(questionCountdownTimer);
      disableLeaveGuard(); lockSidebarNav(false);
      currentQuiz = null; localStorage.removeItem('inProgressQuiz');
      navigate('home');
    };
  } else {
    title.textContent = '⚠️ Tab Switch Detected';
    msg.innerHTML = `You left the quiz. Warning <strong>${count}/3</strong> — leaving again will cancel your quiz.`;
    contBtn.style.display = '';
    contBtn.textContent = 'Continue Quiz';
    contBtn.onclick = () => { modal.classList.remove('open'); };
    quitBtn.textContent = 'Quit Quiz';
    quitBtn.onclick = () => { modal.classList.remove('open'); showQuitPrompt(); };
  }
  modal.classList.add('open');
}

// ================================================================
// TIMERS
// ================================================================
function startOverallTimer() {
  clearInterval(quizTimer);
  quizTimeElapsed = currentQuiz.timeElapsed || 0;
  quizTimer = setInterval(() => {
    quizTimeElapsed++;
    currentQuiz.timeElapsed = quizTimeElapsed;
    localStorage.setItem('inProgressQuiz', JSON.stringify(currentQuiz));
    const el = document.getElementById('quiz-timer-text');
    if (el) {
      const m = Math.floor(quizTimeElapsed / 60), s = quizTimeElapsed % 60;
      el.textContent = m + ':' + (s < 10 ? '0' + s : s);
      document.getElementById('quiz-timer')?.classList.toggle('warn', quizTimeElapsed > 120);
    }
  }, 1000);
}

function stopOverallTimer() { clearInterval(quizTimer); quizTimer = null; }

function startPerQuestionTimer() {
  clearInterval(questionCountdownTimer);
  const limit = currentQuiz.timePerQ || 0;
  if (!limit) return;
  const el = document.getElementById('q-countdown');
  if (!el) return;
  let t = limit;
  el.textContent = Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
  el.classList.remove('warn');
  questionCountdownTimer = setInterval(() => {
    t--;
    el.textContent = Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
    el.classList.toggle('warn', t <= 10);
    if (t <= 0) {
      clearInterval(questionCountdownTimer);
      showToast("Time's up! ⏰", 'warning', 1500);
      setTimeout(() => {
        if (currentQuiz && currentQuiz.answers[currentQuiz.currentIndex] === undefined) {
          currentQuiz.answers[currentQuiz.currentIndex] = -1;
          if (currentQuiz.currentIndex < currentQuiz.questions.length - 1) {
            currentQuiz.currentIndex++;
            renderQuiz();
          } else {
            finishQuiz();
          }
        }
      }, 1600);
    }
  }, 1000);
}

// ================================================================
// RENDER QUIZ
// ================================================================
function renderQuiz() {
  clearInterval(questionCountdownTimer);
  const { questions, currentIndex, category, difficulty, isDailyChallenge, revealMode } = currentQuiz;
  const q          = questions[currentIndex];
  const pct        = ((currentIndex + 1) / questions.length) * 100;
  const hasAnswer  = currentQuiz.answers[currentIndex] !== undefined;
  const m = Math.floor(quizTimeElapsed / 60), s = quizTimeElapsed % 60;
  const limit      = currentQuiz.timePerQ || 0;
  const isCBT      = revealMode === 'after'; // No indicators during quiz

  const perQTimer = limit > 0
    ? `<div class="per-q-timer">⌛ <span id="q-countdown">${Math.floor(limit / 60)}:${String(limit % 60).padStart(2, '0')}</span></div>`
    : '';

  const opts = q.opts.map((o, i) => {
    const selected = currentQuiz.answers[currentIndex] === i;
    let cls = 'quiz-opt';
    if (hasAnswer && selected) {
      if (!isCBT) {
        // Live mode — show right/wrong
        cls += i === q.a ? ' correct' : ' wrong';
      } else {
        // CBT mode — just show selected, no colour
        cls += ' selected';
      }
    }
    return `<button class="${cls}" onclick="selectAnswer(${i})" ${hasAnswer ? 'disabled' : ''}>
      <span class="opt-key">${String.fromCharCode(65 + i)}</span>
      <span class="opt-text">${o}</span>
      ${hasAnswer && !isCBT && i === q.a ? '<span class="opt-mark">✓</span>' : ''}
      ${hasAnswer && !isCBT && i === currentQuiz.answers[currentIndex] && i !== q.a ? '<span class="opt-mark">✗</span>' : ''}
    </button>`;
  }).join('');

  const modeTag = isCBT
    ? `<span class="quiz-mode-tag cbt">📋 CBT Mode</span>`
    : `<span class="quiz-mode-tag live">⚡ Live Feedback</span>`;

  document.getElementById('page-wrap').innerHTML = `
    <div class="quiz-shell anim-fade-up">
      <div class="quiz-topbar">
        <div class="quiz-prog-wrap">
          <div class="prog-bg"><div class="prog-fill" style="width:${pct}%"></div></div>
          <div class="prog-text">Q${currentIndex + 1} / ${questions.length} · ${category}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          ${perQTimer}
          <div class="quiz-timer" id="quiz-timer">⏱ <span id="quiz-timer-text">${m}:${s < 10 ? '0' + s : s}</span></div>
          ${modeTag}
          <button class="quit-btn" onclick="showQuitPrompt()">✕ Quit</button>
        </div>
      </div>

      <div class="quiz-body">
        <div class="quiz-q">${q.q}</div>
        <div class="quiz-opts" id="quiz-opts">${opts}</div>

        ${hasAnswer && !isCBT && q.explanation
          ? `<div class="quiz-explanation">💡 ${q.explanation}</div>` : ''}
        ${hasAnswer && isCBT
          ? `<div class="quiz-selected-notice">Answer recorded — review all answers after the quiz</div>` : ''}

        <div class="quiz-foot">
          ${currentIndex > 0
            ? `<button class="btn btn-secondary" onclick="prevQuestion()">← Previous</button>`
            : `<div></div>`}
          <button class="btn btn-primary" id="quiz-next-btn" onclick="nextQuestion()" ${hasAnswer ? '' : 'disabled'}>
            ${currentIndex === questions.length - 1 ? 'Finish Quiz ✓' : 'Next →'}
          </button>
        </div>
      </div>
    </div>`;

  if (!hasAnswer) setTimeout(startPerQuestionTimer, 50);
}

// ================================================================
// ANSWER SELECTION
// ================================================================
function selectAnswer(idx) {
  if (currentQuiz.answers[currentQuiz.currentIndex] !== undefined) return;
  clearInterval(questionCountdownTimer);
  currentQuiz.answers[currentQuiz.currentIndex] = idx;
  localStorage.setItem('inProgressQuiz', JSON.stringify(currentQuiz));
  renderQuiz();
}

function nextQuestion() {
  if (currentQuiz.answers[currentQuiz.currentIndex] === undefined)
    return showToast('Please select an answer', 'warning');
  clearInterval(questionCountdownTimer);
  if (currentQuiz.currentIndex < currentQuiz.questions.length - 1) {
    currentQuiz.currentIndex++;
    renderQuiz();
  } else {
    finishQuiz();
  }
}

function prevQuestion() {
  if (currentQuiz.currentIndex > 0) {
    clearInterval(questionCountdownTimer);
    currentQuiz.currentIndex--;
    renderQuiz();
  }
}

function quitQuiz() { showQuitPrompt(); }

// ================================================================
// FINISH
// ================================================================
function finishQuiz() {
  stopOverallTimer();
  clearInterval(questionCountdownTimer);
  disableLeaveGuard();
  lockSidebarNav(false);

  const secs = quizTimeElapsed;
  let correct = 0;
  currentQuiz.questions.forEach((q, i) => { if (currentQuiz.answers[i] === q.a) correct++; });

  const pct  = Math.round((correct / currentQuiz.questions.length) * 100);
  const pts  = Math.round(pct * 10) + (currentQuiz.isDailyChallenge ? 50 : 0);
  const xp   = calculateXP(pct, currentQuiz.questions.length, currentQuiz.isDailyChallenge, currentQuiz.difficulty);

  const result = {
    category:         currentQuiz.category,
    date:             new Date().toISOString(),
    score:            correct,
    total:            currentQuiz.questions.length,
    percentage:       pct,
    points:           pts,
    xpEarned:         xp,
    timeTaken:        Math.floor(secs / 60) + 'm ' + (secs % 60) + 's',
    timeTakenSeconds: secs,
    isDailyChallenge: currentQuiz.isDailyChallenge,
    revealMode:       currentQuiz.revealMode,
    questionData:     currentQuiz.questions.map((q, i) => ({
      question:     q.q,
      options:      q.opts,
      correctIndex: q.a,
      userAnswer:   currentQuiz.answers[i] !== -1 ? currentQuiz.answers[i] : null,
      explanation:  q.explanation,
      isCorrect:    currentQuiz.answers[i] === q.a
    }))
  };

  currentUser.history.push(result);
  currentUser.stats.quizzesTaken++;
  currentUser.stats.totalPoints += pts;
  currentUser.stats.totalXP      = (currentUser.stats.totalXP || 0) + xp;

  // Update smart average score
  currentUser.stats.weightedAvgScore = calculateSmartAverage(currentUser.history);

  // ── PAGINATION: keep last 20 quizzes' questionData in MongoDB ──
  // Strip questionData from older entries to prevent MongoDB bloat.
  // Full questionData for last 20 quizzes is preserved for review.
  if (currentUser.history.length > 20) {
    currentUser.history = currentUser.history.map((h, i) => {
      const isRecent = i >= currentUser.history.length - 20;
      if (!isRecent && h.questionData?.length) {
        // Strip questionData from older entries — keep everything else
        const { questionData, ...slim } = h;
        return slim;
      }
      return h;
    });
  }

  // ── Store full history summary in localStorage for offline history view ──
  try {
    const histSummary = currentUser.history.map(h => ({
      category:        h.category,
      date:            h.date,
      score:           h.score,
      total:           h.total,
      percentage:      h.percentage,
      points:          h.points,
      xpEarned:        h.xpEarned,
      timeTaken:       h.timeTaken,
      isDailyChallenge: h.isDailyChallenge
    }));
    localStorage.setItem('qa_hist_summary', JSON.stringify(histSummary));
  } catch(e) { /* localStorage quota exceeded — skip */ }

  if (currentQuiz.isDailyChallenge) markDailyChallengeComplete();

  updateStreak();
  checkAchievements();
  awardXP(0); // Trigger XP bar update (XP already added above)
  updateUser();

  localStorage.removeItem('inProgressQuiz');
  currentQuiz = null;

  showResults(result);
}

// ================================================================
// RESULTS — 2x2 GRID
// ================================================================
function showResults(r) {
  const emoji = r.percentage >= 90 ? '🎉' : r.percentage >= 75 ? '😊' : r.percentage >= 60 ? '👍' : r.percentage >= 40 ? '📚' : '💪';
  const title = r.percentage >= 90 ? 'Excellent!' : r.percentage >= 75 ? 'Great Job!' : r.percentage >= 60 ? 'Good Effort!' : r.percentage >= 40 ? 'Keep Learning!' : 'Keep Practicing!';
  const scoreColor = r.percentage >= 75 ? 'var(--green)' : r.percentage >= 50 ? 'var(--gold)' : 'var(--red)';

  const bonus = r.isDailyChallenge
    ? `<div class="res-stat"><h3 style="color:var(--gold)">+50</h3><p>Daily Bonus</p></div>` : '';

  document.getElementById('page-wrap').innerHTML = `
    <div class="results-shell anim-fade-up">
      <div class="results-emoji">${emoji}</div>
      <h1 class="results-title">${title}</h1>
      <p class="res-pct">You scored <strong style="color:${scoreColor}">${r.percentage}%</strong> on <em>${r.category}</em></p>

      <div class="results-stats-grid">
        <div class="res-stat">
          <h3>${r.score}/${r.total}</h3>
          <p>Correct</p>
        </div>
        <div class="res-stat">
          <h3 style="color:var(--green)">+${r.points}</h3>
          <p>Points</p>
        </div>
        <div class="res-stat">
          <h3 style="color:var(--accent)">+${r.xpEarned}</h3>
          <p>XP</p>
        </div>
        <div class="res-stat">
          <h3>${r.timeTaken}</h3>
          <p>Time</p>
        </div>
        ${bonus}
      </div>

      <div class="results-actions">
        <button class="btn btn-primary" id="review-btn">📋 Review Answers</button>
        <button class="btn btn-ghost" id="share-btn">📤 Share Result</button>
        <button class="btn btn-secondary" onclick="navigate('categories')">Try Another</button>
        <button class="btn btn-ghost" onclick="navigate('home')">Dashboard</button>
      </div>
    </div>`;

  document.getElementById('review-btn').onclick = () => renderReviewScreen(r);
  document.getElementById('share-btn').onclick  = () => previewShareCard(r);
  updateXPBar();
}

// ================================================================
// REVIEW SCREEN
// ================================================================
function renderReviewScreen(result) {
  if (!result.questionData?.length) {
    document.getElementById('page-wrap').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>Review not available</h3>
        <p>Only available for recently completed quizzes.</p>
      </div>`;
    return;
  }
  window._reviewResult = result;
  _renderReviewQ(result, 0);
}

function _renderReviewQ(result, idx) {
  const item  = result.questionData[idx];
  const total = result.questionData.length;
  const correct = result.questionData.filter(q => q.isCorrect).length;

  const opts = item.options.map((o, i) => {
    let cls = 'review-opt', mark = '';
    if (i === item.correctIndex)                    { cls += ' correct'; mark = ' ✓'; }
    else if (i === item.userAnswer && !item.isCorrect) { cls += ' wrong';   mark = ' ✗'; }
    return `<div class="${cls}">
      <span class="review-opt-key">${String.fromCharCode(65 + i)}</span>
      ${o}
      ${mark ? `<strong style="margin-left:auto">${mark}</strong>` : ''}
    </div>`;
  }).join('');

  const icon = item.isCorrect ? '✅' : item.userAnswer === null ? '⬜' : '❌';

  const dots = result.questionData.map((q, i) => `
    <button class="review-dot${i === idx ? ' active' : ''}${q.isCorrect ? ' correct' : q.userAnswer === null ? ' skipped' : ' wrong'}"
      onclick="_renderReviewQ(window._reviewResult,${i})" title="Q${i + 1}">
    </button>`).join('');

  document.getElementById('page-wrap').innerHTML = `
    <div class="review-shell anim-fade-up">
      <div class="review-header">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
          <div>
            <h2>📋 Review — ${result.category}</h2>
            <p style="font-size:13px;color:var(--t2)">${correct}/${total} correct · ${Math.round(correct/total*100)}% · ${result.timeTaken}</p>
          </div>
          <div style="font-size:13px;color:var(--t3)">Q${idx + 1} of ${total}</div>
        </div>
        <div class="review-dots">${dots}</div>
      </div>

      <div class="review-item">
        <div class="review-q-num">${icon} Question ${idx + 1}</div>
        <div class="review-q-text">${item.question}</div>
        <div class="review-opts">${opts}</div>
        ${item.explanation ? `<div class="review-explanation">💡 ${item.explanation}</div>` : ''}
        ${item.userAnswer === null ? `<div style="font-size:12px;color:var(--gold);margin-top:8px">⏰ Skipped (time ran out)</div>` : ''}
      </div>

      <div style="display:flex;gap:10px;justify-content:space-between;align-items:center;flex-wrap:wrap">
        <button class="btn btn-secondary" onclick="_renderReviewQ(window._reviewResult,${Math.max(0, idx - 1)})" ${idx === 0 ? 'disabled' : ''}>← Prev</button>
        <div style="display:flex;gap:8px">
          <button class="btn btn-ghost" onclick="navigate('categories')">New Quiz</button>
          <button class="btn btn-secondary" onclick="navigate('history')">History</button>
          <button class="btn btn-ghost" onclick="previewShareCard(window._reviewResult)">📤 Share</button>
        </div>
        <button class="btn btn-primary" onclick="_renderReviewQ(window._reviewResult,${Math.min(total - 1, idx + 1)})" ${idx === total - 1 ? 'disabled' : ''}>Next →</button>
      </div>
    </div>`;
}
