/* ================================================================
   QUIZ ACADEMY — FEATURES
   - Tab/window switch blocker during quiz
   - Brainstorming mode (flashcard-style)
   - Time limit settings per category
   - Achievement fire animation (full-page)
   - Sidebar collapse (desktop icon-only mode)
   - Levels achievements page section
   - Updated auth to use backend API with localStorage fallback
   ================================================================ */

// ================================================================
// 1. TAB / WINDOW SWITCH BLOCKER
// ================================================================
let tabSwitchWarnings = 0;
const MAX_TAB_WARNINGS = 2;

function setupTabSwitchBlocker() {
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('blur', handleWindowBlur);
}

function handleVisibilityChange() {
  if (!currentQuiz || currentQuiz.isPreview) return;
  if (document.visibilityState === 'hidden') onTabSwitch();
}

function handleWindowBlur() {
  if (!currentQuiz || currentQuiz.isPreview) return;
  // Only fire if visibility change didn't already handle it
  if (document.visibilityState === 'visible') onTabSwitch();
}

function onTabSwitch() {
  tabSwitchWarnings++;
  stopTimer();

  if (tabSwitchWarnings >= MAX_TAB_WARNINGS) {
    // Cancel quiz — score not counted
    showTabSwitchModal(true);
  } else {
    showTabSwitchModal(false);
  }
}

function showTabSwitchModal(isFinal) {
  const overlay = document.getElementById('tab-switch-modal');
  const title = document.getElementById('tsm-title');
  const msg = document.getElementById('tsm-msg');
  const continueBtn = document.getElementById('tsm-continue');
  const quitBtn = document.getElementById('tsm-quit');

  if (isFinal) {
    title.textContent = '⛔ Quiz Cancelled';
    msg.textContent = 'You left the quiz too many times. Your score has not been saved. Please start again.';
    continueBtn.style.display = 'none';
    quitBtn.textContent = 'Back to Dashboard';
    quitBtn.onclick = () => {
      hideTabSwitchModal();
      currentQuiz = null;
      localStorage.removeItem('inProgressQuiz');
      tabSwitchWarnings = 0;
      navigate('home');
    };
  } else {
    title.textContent = '⚠️ Tab Switch Detected!';
    msg.innerHTML = `You left the quiz. <strong>Your score will not be saved</strong> if you leave again.<br><br>Warning ${tabSwitchWarnings} of ${MAX_TAB_WARNINGS}.`;
    continueBtn.style.display = '';
    continueBtn.onclick = () => {
      hideTabSwitchModal();
      startTimer(); // Resume timer
    };
    quitBtn.textContent = 'Quit Quiz (score lost)';
    quitBtn.onclick = () => {
      hideTabSwitchModal();
      currentQuiz = null;
      localStorage.removeItem('inProgressQuiz');
      tabSwitchWarnings = 0;
      navigate('home');
    };
  }

  overlay.classList.add('open');
}

function hideTabSwitchModal() {
  document.getElementById('tab-switch-modal').classList.remove('open');
}

// Reset warning counter when quiz ends
function resetTabWarnings() { tabSwitchWarnings = 0; }

// ================================================================
// 2. SIDEBAR COLLAPSE (desktop icon-only mode)
// ================================================================
let sidebarCollapsed = false;

function setupSidebarCollapse() {
  const sidebar = document.getElementById('sidebar');
  const collapseBtn = document.getElementById('sidebar-collapse-btn');
  if (!collapseBtn) return;

  const saved = localStorage.getItem('qa_sidebar_collapsed') === 'true';
  if (saved) applySidebarCollapse(true);

  collapseBtn.addEventListener('click', () => {
    sidebarCollapsed = !sidebarCollapsed;
    applySidebarCollapse(sidebarCollapsed);
    localStorage.setItem('qa_sidebar_collapsed', sidebarCollapsed);
  });
}

function applySidebarCollapse(collapsed) {
  sidebarCollapsed = collapsed;
  const sidebar = document.getElementById('sidebar');
  const btn = document.getElementById('sidebar-collapse-btn');
  if (!sidebar) return;
  sidebar.classList.toggle('collapsed', collapsed);
  if (btn) btn.setAttribute('title', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
}

// ================================================================
// 3. TIME LIMITS PER CATEGORY
// ================================================================
function getTimeLimits() {
  return currentUser?.settings?.timeLimits || {};
}

function getCategoryTimeLimit(category) {
  const limits = getTimeLimits();
  return limits[category] || 0; // 0 = no limit
}

function renderTimeLimitsPage() {
  const limits = getTimeLimits();
  const allCourses = getAllCourses ? getAllCourses() : QUIZ_DATA;

  const rows = Object.entries(allCourses).map(([id, course]) => {
    const current = limits[id] || 0;
    return `<div class="setting-item">
      <div class="setting-info">
        <h4>${course.icon || '📚'} ${course.name || id}</h4>
        <p>${course.questions?.length || 0} questions</p>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <select class="cb-select" style="width:140px" onchange="setTimeLimit('${id}', parseInt(this.value))">
          <option value="0" ${current===0?'selected':''}>No limit</option>
          <option value="15" ${current===15?'selected':''}>15 sec / question</option>
          <option value="30" ${current===30?'selected':''}>30 sec / question</option>
          <option value="45" ${current===45?'selected':''}>45 sec / question</option>
          <option value="60" ${current===60?'selected':''}>60 sec / question</option>
          <option value="90" ${current===90?'selected':''}>90 sec / question</option>
          <option value="120" ${current===120?'selected':''}>2 min / question</option>
        </select>
        ${current > 0 ? `<span style="font-size:11px;color:var(--gold)">⏱ ${current}s</span>` : ''}
      </div>
    </div>`;
  }).join('');

  document.getElementById('page-wrap').innerHTML = `
    <div class="page-header">
      <h1>⏱ Time Limits</h1>
      <p>Set per-question time limits for each category</p>
    </div>
    <div class="settings-section anim-fade-up">
      <h3>Category Time Limits</h3>
      <p style="font-size:12px;color:var(--t3);margin-bottom:16px">
        When a time limit is set, a countdown appears per question. Running out of time auto-submits a blank answer.
      </p>
      ${rows}
    </div>
    <div style="display:flex;gap:10px">
      <button class="btn btn-secondary" onclick="clearAllTimeLimits()">Clear All Limits</button>
    </div>`;
}

function setTimeLimit(category, seconds) {
  if (!currentUser.settings) currentUser.settings = {};
  if (!currentUser.settings.timeLimits) currentUser.settings.timeLimits = {};
  if (seconds === 0) delete currentUser.settings.timeLimits[category];
  else currentUser.settings.timeLimits[category] = seconds;
  updateUser();
  showToast(`Time limit ${seconds > 0 ? 'set to ' + seconds + 's' : 'removed'} for ${category}`, 'success');
}

function clearAllTimeLimits() {
  if (!currentUser.settings) return;
  currentUser.settings.timeLimits = {};
  updateUser();
  renderTimeLimitsPage();
  showToast('All time limits cleared', 'info');
}

// Per-question timer (used by quiz.js startTimer patch)
let questionTimer = null;
let questionTimeLeft = 0;

function startQuestionTimer(seconds, onExpire) {
  clearInterval(questionTimer);
  questionTimeLeft = seconds;
  updateQuestionTimerDisplay(seconds, seconds);
  questionTimer = setInterval(() => {
    questionTimeLeft--;
    updateQuestionTimerDisplay(questionTimeLeft, seconds);
    if (questionTimeLeft <= 0) {
      clearInterval(questionTimer);
      onExpire();
    }
  }, 1000);
}

function stopQuestionTimer() {
  clearInterval(questionTimer);
  questionTimer = null;
}

function updateQuestionTimerDisplay(left, total) {
  const el = document.getElementById('question-countdown');
  if (!el) return;
  el.textContent = left + 's';
  const pct = (left / total) * 100;
  el.style.color = left <= 5 ? 'var(--red)' : left <= 10 ? 'var(--gold)' : 'var(--green)';
  const bar = document.getElementById('question-countdown-bar');
  if (bar) {
    bar.style.width = pct + '%';
    bar.style.background = left <= 5 ? 'var(--red)' : left <= 10 ? 'var(--gold)' : 'var(--green)';
  }
}

// ================================================================
// 4. BRAINSTORMING MODE
// ================================================================
let brainIndex = 0;
let brainCategory = null;
let brainQuestions = [];
let brainFlipped = false;

function renderBrainstorming() {
  const allCourses = getAllCourses ? getAllCourses() : QUIZ_DATA;
  const categoryOptions = Object.entries(allCourses).map(([id, c]) =>
    `<option value="${id}">${c.icon || '📚'} ${c.name || id}</option>`
  ).join('');

  document.getElementById('page-wrap').innerHTML = `
    <div class="page-header">
      <h1>🧠 Brainstorming</h1>
      <p>Flashcard-style study mode — see the question, reveal the answer</p>
    </div>
    <div class="card" style="padding:20px;margin-bottom:16px">
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">
        <div class="cb-field" style="flex:1;min-width:160px;margin-bottom:0">
          <label>Category</label>
          <select class="cb-select" id="brain-cat-select">
            <option value="all">🎲 All Categories (Mixed)</option>
            ${categoryOptions}
          </select>
        </div>
        <div class="cb-field" style="flex:1;min-width:120px;margin-bottom:0">
          <label>Difficulty</label>
          <select class="cb-select" id="brain-diff-select">
            <option value="all">All Levels</option>
            <option value="easy">Easy Only</option>
            <option value="medium">Medium Only</option>
            <option value="hard">Hard Only</option>
          </select>
        </div>
        <button class="btn btn-primary" onclick="startBrainstorming()">Start Session →</button>
      </div>
    </div>
    <div id="brain-area"></div>`;
}

function startBrainstorming() {
  const catId = document.getElementById('brain-cat-select').value;
  const diff = document.getElementById('brain-diff-select').value;
  const allCourses = getAllCourses ? getAllCourses() : QUIZ_DATA;

  let questions = [];
  if (catId === 'all') {
    Object.entries(allCourses).forEach(([id, c]) => {
      c.questions.forEach(q => questions.push({ ...q, _category: id }));
    });
  } else {
    (allCourses[catId]?.questions || []).forEach(q => questions.push({ ...q, _category: catId }));
  }

  if (diff !== 'all') questions = questions.filter(q => q.difficulty === diff);
  if (!questions.length) return showToast('No questions found for this filter', 'warning');

  brainQuestions = shuffle(questions);
  brainIndex = 0;
  brainCategory = catId;
  renderFlashcard();
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderFlashcard() {
  const q = brainQuestions[brainIndex];
  const total = brainQuestions.length;

  const allCourses = getAllCourses ? getAllCourses() : QUIZ_DATA;
  const catName = allCourses[q._category]?.name || q._category;

  document.getElementById('brain-area').innerHTML = `
    <div class="brain-card-wrap">
      <div class="brain-progress">
        <div class="brain-prog-bar"><div class="brain-prog-fill" style="width:${((brainIndex+1)/total)*100}%"></div></div>
        <span>${brainIndex + 1} / ${total}</span>
      </div>

      <div class="brain-card" id="brain-card" onclick="flipCard()">
        <div class="brain-card-inner" id="brain-card-inner">
          <!-- FRONT: Question -->
          <div class="brain-card-front">
            <div class="brain-cat-tag">${q._category} · <span class="cb-diff-tag cb-diff-${q.difficulty||'medium'}">${q.difficulty||'medium'}</span></div>
            <div class="brain-q-text">${q.q}</div>
            <div class="brain-flip-hint">👆 Click to reveal answer</div>
          </div>
          <!-- BACK: Answer options with correct highlighted -->
          <div class="brain-card-back">
            <div class="brain-cat-tag">${q._category}</div>
            <div class="brain-q-text-sm">${q.q}</div>
            <div class="brain-opts">
              ${q.opts.map((o, i) => `
                <div class="brain-opt ${i === q.a ? 'brain-opt-correct' : ''}">
                  <span class="brain-opt-key">${String.fromCharCode(65+i)}</span>
                  ${o}
                  ${i === q.a ? ' ✓' : ''}
                </div>`).join('')}
            </div>
            ${q.explanation ? `<div class="brain-explanation">💡 ${q.explanation}</div>` : ''}
          </div>
        </div>
      </div>

      <div class="brain-nav">
        <button class="btn btn-secondary" onclick="brainPrev()" ${brainIndex===0?'disabled':''}>← Prev</button>
        <div style="display:flex;gap:8px">
          <button class="btn btn-ghost" onclick="flipCard()" id="brain-flip-btn">🔄 Flip</button>
          <button class="btn btn-secondary" onclick="brainShuffle()">🔀 Shuffle</button>
        </div>
        <button class="btn btn-primary" onclick="brainNext()" ${brainIndex===total-1?'disabled':''}>Next →</button>
      </div>
    </div>`;

  brainFlipped = false;
}

function flipCard() {
  const inner = document.getElementById('brain-card-inner');
  if (!inner) return;
  brainFlipped = !brainFlipped;
  inner.classList.toggle('flipped', brainFlipped);
}

function brainNext() {
  if (brainIndex < brainQuestions.length - 1) { brainIndex++; renderFlashcard(); }
  else showToast('End of deck! Great studying 🎉', 'success');
}

function brainPrev() {
  if (brainIndex > 0) { brainIndex--; renderFlashcard(); }
}

function brainShuffle() {
  brainQuestions = shuffle(brainQuestions);
  brainIndex = 0;
  renderFlashcard();
  showToast('Deck shuffled!', 'info');
}

// ================================================================
// 5. ACHIEVEMENT FIRE ANIMATION (full-page celebration)
// ================================================================
function showAchievementFireAnimation(achievement) {
  // Remove existing if any
  document.getElementById('ach-fire-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'ach-fire-overlay';
  overlay.className = 'ach-fire-overlay';
  overlay.innerHTML = `
    <div class="ach-fire-content">
      <div class="ach-fire-particles" id="ach-particles"></div>
      <div class="ach-fire-icon">${achievement.icon}</div>
      <div class="ach-fire-name">${achievement.name}</div>
      <div class="ach-fire-desc">${achievement.desc}</div>
      <div class="ach-fire-label">Achievement Unlocked!</div>
      <button class="ach-fire-close" onclick="document.getElementById('ach-fire-overlay').remove()">
        Continue →
      </button>
    </div>`;
  document.body.appendChild(overlay);

  // Generate fire particles
  const particles = document.getElementById('ach-particles');
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.className = 'fire-particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      animation-delay: ${Math.random() * 1.5}s;
      animation-duration: ${0.8 + Math.random() * 1.2}s;
      width: ${6 + Math.random() * 14}px;
      height: ${6 + Math.random() * 14}px;
      background: ${['#FF6B00','#FF9500','#FFD000','#FF4500','#FF7A00'][Math.floor(Math.random()*5)]};
    `;
    particles.appendChild(p);
  }

  // Confetti too
  for (let i = 0; i < 80; i++) {
    const c = document.createElement('div');
    c.className = 'ach-confetti';
    c.style.cssText = `
      left: ${Math.random() * 100}%;
      animation-delay: ${Math.random() * 2}s;
      animation-duration: ${1 + Math.random() * 2}s;
      background: ${['#6C8EFF','#4DFFC3','#FF6B8A','#F5C842','#B57BFF','#FF7A45'][Math.floor(Math.random()*6)]};
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
    `;
    overlay.appendChild(c);
  }

  // Auto-dismiss after 5 seconds
  setTimeout(() => overlay?.remove(), 5500);
}

// Override checkAchievements to trigger fire animation
const _origCheckAchievements = window.checkAchievements;
window.checkAchievements = function() {
  if (!currentUser) return;
  const before = [...(currentUser.achievements || [])];
  _origCheckAchievements?.();
  const after = currentUser.achievements || [];
  const newOnes = after.filter(id => !before.includes(id));
  if (newOnes.length > 0) {
    const ach = ACHIEVEMENTS.find(a => a.id === newOnes[0]);
    if (ach) setTimeout(() => showAchievementFireAnimation(ach), 500);
  }
};

// ================================================================
// 6. LEVELS SECTION IN ACHIEVEMENTS PAGE
// ================================================================
function renderLevelsSection() {
  const xp = currentUser.stats?.totalXP || 0;
  const currentInfo = getLevelInfo(xp);

  return `
    <div class="card anim-fade-up" style="margin-bottom:16px">
      <div class="card-head">
        <span class="card-title">⚡ Your Level</span>
      </div>
      <div class="card-body">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;flex-wrap:wrap">
          <div style="
            width:72px;height:72px;border-radius:18px;
            background:linear-gradient(135deg,var(--accent),var(--green));
            display:flex;flex-direction:column;align-items:center;justify-content:center;
            font-family:'Syne',sans-serif;font-weight:800;color:#fff;flex-shrink:0;
          ">
            <div style="font-size:22px;line-height:1">${currentInfo.current.level}</div>
            <div style="font-size:9px;opacity:.8;margin-top:2px">LEVEL</div>
          </div>
          <div style="flex:1">
            <div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:700;color:var(--t1)">${currentInfo.current.title}</div>
            <div style="font-size:13px;color:var(--t2);margin-bottom:10px">${xp.toLocaleString()} XP total</div>
            <div class="xp-bar-bg" style="height:8px">
              <div class="xp-bar-fill" style="width:${currentInfo.progress}%;height:100%"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--t3);margin-top:4px">
              <span>${currentInfo.next ? currentInfo.xpIntoLevel + ' / ' + currentInfo.xpForNextLevel + ' XP' : 'MAX LEVEL'}</span>
              ${currentInfo.next ? `<span>Next: ${currentInfo.next.title}</span>` : '<span>🏆 Legend!</span>'}
            </div>
          </div>
        </div>
      </div>

      <div style="padding:0 18px 18px">
        <div style="font-family:'Syne',sans-serif;font-size:13px;font-weight:600;color:var(--t1);margin-bottom:12px">All Levels</div>
        <div class="levels-grid">
          ${LEVELS.map(lv => {
            const isUnlocked = xp >= lv.xpRequired;
            const isCurrent = lv.level === currentInfo.current.level;
            return `<div class="level-badge ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}">
              <div class="level-badge-num">${lv.level}</div>
              <div class="level-badge-title">${lv.title}</div>
              <div class="level-badge-xp">${lv.xpRequired.toLocaleString()} XP</div>
              ${isCurrent ? '<div class="level-current-dot"></div>' : ''}
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
}

// ================================================================
// 7. UPDATED AUTH — backend with localStorage fallback
// ================================================================
async function handleLoginWithBackend() {
  clearErr('err-login-email'); clearErr('err-login-pw');
  const email = document.getElementById('login-email').value.trim();
  const pw = document.getElementById('login-password').value;
  const remember = document.getElementById('remember-me').checked;
  if (!validateEmail(email)) return showErr('err-login-email', 'Please enter a valid email');
  if (pw.length < 8) return showErr('err-login-pw', 'Password must be at least 8 characters');
  setLoading('btn-login', 'spin-login', true);

  const online = await checkServer();
  try {
    if (online) {
      currentUser = await AuthAPI.login(email, pw);
    } else {
      // Fallback: localStorage auth
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      const user = users[email];
      if (!user || user.password !== btoa(pw)) throw new Error('Invalid email or password');
      currentUser = user;
    }
    notifications = currentUser.notifications || [];
    if (remember) { localStorage.setItem('currentUser', JSON.stringify(currentUser)); localStorage.setItem('rememberMe', 'true'); }
    setLoading('btn-login', 'spin-login', false);
    launchApp();
  } catch (err) {
    setLoading('btn-login', 'spin-login', false);
    showErr('err-login-pw', err.message || 'Login failed');
  }
}

async function handleSignupWithBackend() {
  clearErr('err-su-name'); clearErr('err-su-email'); clearErr('err-su-pw'); clearErr('err-su-confirm');
  const name = document.getElementById('su-name').value.trim();
  const email = document.getElementById('su-email').value.trim();
  const pw = document.getElementById('su-password').value;
  const confirm = document.getElementById('su-confirm').value;
  if (name.length < 2) return showErr('err-su-name', 'Name must be at least 2 characters');
  if (!validateEmail(email)) return showErr('err-su-email', 'Please enter a valid email');
  if (pw.length < 8) return showErr('err-su-pw', 'Password must be at least 8 characters');
  if (pw !== confirm) return showErr('err-su-confirm', 'Passwords do not match');
  setLoading('btn-signup', 'spin-signup', true);

  const online = await checkServer();
  try {
    if (online) {
      currentUser = await AuthAPI.register(name, email, pw);
    } else {
      // Fallback: localStorage
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      if (users[email]) throw new Error('Email already registered');
      currentUser = {
        name, email, password: btoa(pw),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6C8EFF&color=fff&size=128`,
        bio: '', joinDate: new Date().toISOString(),
        stats: { quizzesTaken:0, totalPoints:0, totalXP:0, streak:0, lastQuizDate:null, dailyChallengesDone:0, categoriesPlayed:[] },
        history:[], achievements:[], notifications:[], settings:{ theme:'midnight' },
        lastDailyChallenge: null, isNew: true
      };
      users[email] = currentUser;
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      localStorage.setItem('rememberMe', 'true');
    }
    notifications = currentUser.notifications || [];
    setLoading('btn-signup', 'spin-signup', false);
    launchApp();
    addNotif('Account created! Welcome to Quiz Academy 🎉', 'success');
  } catch (err) {
    setLoading('btn-signup', 'spin-signup', false);
    showErr('err-su-email', err.message || 'Signup failed');
  }
}

async function updateUserWithBackend() {
  if (!currentUser) return;
  // Always sync localStorage
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  users[currentUser.email] = currentUser;
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  updateUserDisplay();

  // If backend available, sync there too
  const online = await checkServer();
  if (online) {
    try {
      await AuthAPI.updateMe({
        name: currentUser.name,
        bio: currentUser.bio,
        avatar: currentUser.avatar,
        stats: currentUser.stats,
        history: currentUser.history,
        achievements: currentUser.achievements,
        notifications: currentUser.notifications,
        settings: currentUser.settings,
        lastDailyChallenge: currentUser.lastDailyChallenge,
        customCourses: currentUser.customCourses,
        isNew: currentUser.isNew
      });
    } catch (e) {
      // Silent fail — localStorage is the source of truth for now
    }
  }
}

// ================================================================
// 8. UPDATED AI — calls backend proxy instead of direct API
// ================================================================
async function generateAIQuestionsViaBackend(topic, difficulty, count) {
  const online = await checkServer();

  if (online) {
    // Use backend proxy (API key never exposed)
    return AIAPI.generate(topic, difficulty, count);
  } else {
    // Fallback: ask user for their own key (original behavior)
    const apiKey = localStorage.getItem('qa_api_key');
    if (!apiKey) throw new Error('Backend not available and no API key saved. Please enter your Anthropic API key.');
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        messages: [{ role: 'user', content: `Generate ${count} ${difficulty} MCQ questions about "${topic}" as JSON array: [{"q":"?","opts":["A","B","C","D"],"a":0,"difficulty":"medium","explanation":"..."}]` }]
      })
    });
    if (!res.ok) throw new Error('AI API error: ' + res.status);
    const data = await res.json();
    const text = data.content?.[0]?.text || '';
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('Invalid AI response');
    return JSON.parse(match[0]);
  }
}

// ================================================================
// INIT — call from app.js DOMContentLoaded
// ================================================================
function initFeatures() {
  setupTabSwitchBlocker();
  setupSidebarCollapse();
}
