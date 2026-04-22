/* ================================================================
   QUIZ ACADEMY — UI v4
   - Notification panel: max 3 visible, scrollable, dismissable
   - Recommendation banner redesigned
   - Categories: no mode tabs, better info layout
   - Leaderboard: medals, rankings, polished
   - Smart avg score on dashboard
   - Quick Actions: Review Mistakes added
   - Levels page: no horizontal overflow
   ================================================================ */

// ── THEME ──
function applyTheme(themeId) {
  document.body.setAttribute('data-theme', themeId || 'midnight');
  localStorage.setItem('qa_theme', themeId || 'midnight');
  if (currentUser) {
    currentUser.settings = currentUser.settings || {};
    currentUser.settings.theme = themeId;
  }
}

function toggleTheme() {
  const current    = document.body.getAttribute('data-theme') || 'midnight';
  const lightThemes = ['snow','paper','rose'];
  applyTheme(lightThemes.includes(current) ? 'midnight' : 'snow');
  if (currentUser) updateUser();
}

// ── NAVIGATION ──
const PAGE_TITLES = {
  home: 'Dashboard', categories: 'Categories', play: 'Play Quiz',
  leaderboard: 'Leaderboard', history: 'History', achievements: 'Achievements & Levels',
  brainstorm: 'Brainstorming', timelimits: 'Time Limits', users: 'Users',
  profile: 'My Profile', settings: 'Settings', ai: 'AI Questions', builder: 'Course Builder'
};

function navigate(page) {
  // Block nav if quiz is active
  if (currentQuiz) { showQuitPrompt(); return; }

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navEl) navEl.classList.add('active');
  document.getElementById('topbar-title').textContent = PAGE_TITLES[page] || 'Quiz Academy';
  closeAllDropdowns();

  const pageMap = {
    home:         renderHome,
    categories:   renderCategories,
    play:         renderPlay,
    leaderboard:  renderLeaderboard,
    history:      renderHistory,
    achievements: renderAchievementsAndLevels,
    users:        renderUsers,
    profile:      renderProfile,
    settings:     renderSettings,
    ai:           renderAIPage,
    // Heavy pages — lazy loaded on first visit
    builder:      () => lazyRender('builder',    renderCourseBuilder,  '🏗️ Course Builder'),
    brainstorm:   () => lazyRender('brainstorm', renderBrainstorm,     '🧠 Brainstorming'),
    timelimits:   () => lazyRender('timelimits', renderTimerSettings,  '⏱ Time Limits')
  };
  if (pageMap[page]) pageMap[page]();
  if (window.innerWidth <= 700) closeSidebar();
}

// ── LAZY RENDER — shows skeleton then renders ──
function lazyRender(page, renderFn, title) {
  // Show skeleton immediately so user sees instant response
  document.getElementById('page-wrap').innerHTML = `
    <div class="page-header"><h1>${title}</h1></div>
    <div class="lazy-skeleton">
      <div class="skeleton-bar" style="width:60%;height:18px"></div>
      <div class="skeleton-bar" style="width:100%;height:80px;margin-top:8px"></div>
      <div class="skeleton-bar" style="width:100%;height:80px"></div>
      <div class="skeleton-bar" style="width:100%;height:80px"></div>
    </div>`;

  // Render on next frame so skeleton paints first
  requestAnimationFrame(() => {
    setTimeout(() => {
      if (typeof renderFn === 'function') renderFn();
    }, 50);
  });
}

// ── SIDEBAR ──
function openSidebar()  { document.getElementById('sidebar').classList.add('open'); }
function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); }

function setupSidebarNav() {
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => {
      if (currentQuiz) { showQuitPrompt(); return; }
      navigate(item.dataset.page);
    });
  });
}

// ── USER DISPLAY ──
function updateUserDisplay() {
  if (!currentUser) return;
  const av = currentUser.avatar;
  document.getElementById('sb-avatar').src = av;
  document.getElementById('tb-avatar').src = av;
  document.getElementById('sb-name').textContent = currentUser.name;
  document.getElementById('sb-pts').textContent  = (currentUser.stats?.totalPoints || 0).toLocaleString() + ' pts';
  updateXPBar();
}

// ── NOTIFICATIONS ──
function addNotif(msg, type = 'info') {
  const n = {
    id:        Date.now(),
    message:   msg,
    type,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date:      new Date().toLocaleDateString()
  };
  notifications.unshift(n);
  if (notifications.length > 50) notifications.length = 50;
  if (currentUser) { currentUser.notifications = [...notifications]; updateUser(); }
  renderNotifBadge();
  renderNotifList();
}

function renderNotifBadge() {
  const dot = document.getElementById('notif-dot');
  if (dot) dot.classList.toggle('show', notifications.length > 0);
}

function renderNotifList() {
  const list = document.getElementById('notif-list');
  if (!list) return;
  if (!notifications.length) {
    list.innerHTML = '<div class="notif-empty">No notifications yet</div>';
    return;
  }

  // Max 3 visible, rest scrollable via CSS
  const typeIcons = { success: '✅', info: 'ℹ️', warning: '⚠️', error: '❌', login: '👋' };

  list.innerHTML = notifications.map((n, idx) => `
    <div class="notif-item ${idx >= 3 ? 'notif-hidden' : ''}" id="notif-${n.id}">
      <div class="notif-type-dot ${n.type}"></div>
      <div class="notif-body">
        <div class="notif-msg">${n.message}</div>
        <div class="notif-time">${n.timestamp}</div>
      </div>
      <button class="notif-dismiss" onclick="dismissNotif(${n.id})" title="Dismiss">✕</button>
    </div>`).join('');

  // Show "X more" label if more than 3
  if (notifications.length > 3) {
    list.innerHTML += `<div class="notif-more-label">${notifications.length - 3} more — scroll to see</div>`;
  }
}

function dismissNotif(id) {
  notifications = notifications.filter(n => n.id !== id);
  if (currentUser) { currentUser.notifications = [...notifications]; updateUser(); }
  renderNotifBadge();
  renderNotifList();
}

function toggleNotifDd() {
  const dd = document.getElementById('notif-dd');
  const isOpen = dd.classList.contains('open');
  closeAllDropdowns();
  if (!isOpen) { dd.classList.add('open'); renderNotifList(); }
}

function clearAllNotifs() {
  if (!notifications.length) return;
  showConfirm('Clear Notifications', 'Clear all notifications?', '🗑️', () => {
    notifications = [];
    if (currentUser) { currentUser.notifications = []; updateUser(); }
    renderNotifBadge();
    renderNotifList();
    closeAllDropdowns();
  });
}

// ── PROFILE DROPDOWN ──
function toggleProfileDd() {
  const dd = document.getElementById('profile-dd');
  const isOpen = dd.classList.contains('open');
  closeAllDropdowns();
  if (!isOpen) dd.classList.add('open');
}

function closeAllDropdowns() {
  document.getElementById('notif-dd')?.classList.remove('open');
  document.getElementById('profile-dd')?.classList.remove('open');
}

function setupDropdownClose() {
  document.addEventListener('click', e => {
    const notifBtn = document.getElementById('notif-btn');
    const notifDd  = document.getElementById('notif-dd');
    const profBtn  = document.getElementById('profile-btn');
    const profDd   = document.getElementById('profile-dd');
    if (notifDd && !notifDd.contains(e.target) && !notifBtn?.contains(e.target)) notifDd.classList.remove('open');
    if (profDd  && !profDd.contains(e.target)  && !profBtn?.contains(e.target))  profDd.classList.remove('open');
  });
}

// ── TOAST ──
function showToast(msg, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success: '✅', info: 'ℹ️', warning: '⚠️', error: '❌' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('out'); setTimeout(() => toast.remove(), 300); }, duration);
}

// ── SEARCH ──
function handleSearch() {
  const q = document.getElementById('search-input').value.trim().toLowerCase();
  if (!q) return;
  const all = typeof getAllCourses === 'function' ? getAllCourses() : QUIZ_DATA;
  const matches = Object.keys(all).filter(k =>
    k.toLowerCase().includes(q) || all[k].description?.toLowerCase().includes(q)
  );
  document.getElementById('search-input').value = '';
  if (matches.length) { navigate('categories'); showToast(`Found ${matches.length} matching course`, 'success'); }
  else showToast(`No courses found for "${q}"`, 'info');
}

// ── FULLSCREEN ──
function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
  else document.exitFullscreen();
}

// ── CONFIRM MODAL ──
function showConfirm(title, msg, icon, onConfirm, infoOnly = false) {
  document.getElementById('modal-title').textContent   = title;
  document.getElementById('modal-msg').textContent     = msg;
  document.getElementById('modal-icon').textContent    = icon;
  const confirmBtn = document.getElementById('modal-confirm-btn');
  if (infoOnly) { confirmBtn.style.display = 'none'; }
  else {
    confirmBtn.style.display = '';
    confirmBtn.onclick = () => { closeModal(); onConfirm?.(); };
  }
  document.getElementById('confirm-modal').classList.add('open');
}

function closeModal() { document.getElementById('confirm-modal').classList.remove('open'); }

// ── IMAGE UPLOAD ──
function openUploadModal() {
  document.getElementById('img-preview').style.display = 'none';
  document.getElementById('upload-placeholder').style.display = 'block';
  document.getElementById('upload-modal').classList.add('open');
}
function closeUploadModal() {
  document.getElementById('upload-modal').classList.remove('open');
  document.getElementById('file-input').value = '';
}
function previewImage(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const preview = document.getElementById('img-preview');
    preview.src = ev.target.result;
    preview.style.display = 'block';
    document.getElementById('upload-placeholder').style.display = 'none';
  };
  reader.readAsDataURL(file);
}
function saveAvatar() {
  const preview = document.getElementById('img-preview');
  if (!preview.src || preview.style.display === 'none') return showToast('Please select an image first', 'warning');
  showConfirm('Update Photo', 'Update your profile picture?', '📷', () => {
    currentUser.avatar = preview.src;
    updateUser();
    closeUploadModal();
    const img = document.getElementById('profile-av-img');
    if (img) img.src = preview.src;
    showToast('Profile picture updated ✓', 'success');
  });
}
function setupDragDrop() {
  const area = document.getElementById('upload-area');
  if (!area) return;
  area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('dragover'); });
  area.addEventListener('dragleave', () => area.classList.remove('dragover'));
  area.addEventListener('drop', e => {
    e.preventDefault(); area.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => {
        document.getElementById('img-preview').src = ev.target.result;
        document.getElementById('img-preview').style.display = 'block';
        document.getElementById('upload-placeholder').style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
  });
}

// ── SETUP MODAL CLOSE ON BACKDROP ──
function setupModalClose() {
  document.getElementById('confirm-modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('confirm-modal')) closeModal();
  });
  document.getElementById('upload-modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('upload-modal')) closeUploadModal();
  });
}

function setupSearchEnter() {
  document.getElementById('search-input')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') handleSearch();
  });
}

// ================================================================
// HOME PAGE
// ================================================================
function renderHome() {
  const stats   = currentUser.stats || {};
  const hist    = currentUser.history || [];
  const xpInfo  = getLevelInfo(stats.totalXP || 0);

  // Smart average score
  const smartAvg = hist.length ? calculateSmartAverage(hist) : 0;

  const inProgress = localStorage.getItem('inProgressQuiz');

  // Weak topic detection
  const all = typeof getAllCourses === 'function' ? getAllCourses() : QUIZ_DATA;
  const weakCats = Object.keys(all).filter(cat => {
    const m = getCategoryMastery(cat);
    return m > 0 && m < 60;
  });

  // Redesigned recommendation banner
  const recommendation = weakCats.length ? `
    <div class="recommendation-banner">
      <div class="rec-icon">💡</div>
      <div class="rec-content">
        <div class="rec-title">Keep improving</div>
        <div class="rec-text">You're below 60% in <strong>${weakCats.slice(0,3).join(', ')}${weakCats.length > 3 ? ` +${weakCats.length-3} more` : ''}</strong></div>
      </div>
      <button class="btn btn-ghost rec-btn" onclick="startWeakTopics()">Practice →</button>
    </div>` : '';

  const resumeCard = inProgress ? `
    <div class="action-card resume-card" onclick="resumeLastQuiz()">
      <div class="action-icon">▶️</div>
      <h3>Resume Quiz</h3>
      <p>Continue where you left off</p>
    </div>` : '';

  document.getElementById('page-wrap').innerHTML = `
    <div class="page-header">
      <h1>Welcome back, ${currentUser.name}! 👋</h1>
      <p>Level ${xpInfo.current.level} ${xpInfo.current.title} ${xpInfo.current.emoji} · ${stats.streak || 0} day streak 🔥</p>
    </div>

    ${recommendation}

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-emoji">🎯</div>
        <div class="stat-label">Quizzes Taken</div>
        <div class="stat-value">${stats.quizzesTaken || 0}</div>
        <div class="stat-sub">All time</div>
      </div>
      <div class="stat-card">
        <div class="stat-emoji">📈</div>
        <div class="stat-label">Average Score</div>
        <div class="stat-value">${smartAvg}%</div>
        <div class="stat-sub">Weighted recent</div>
      </div>
      <div class="stat-card">
        <div class="stat-emoji">🏆</div>
        <div class="stat-label">Total Points</div>
        <div class="stat-value">${(stats.totalPoints || 0).toLocaleString()}</div>
        <div class="stat-sub">Keep earning!</div>
      </div>
      <div class="stat-card">
        <div class="stat-emoji">🔥</div>
        <div class="stat-label">Day Streak</div>
        <div class="stat-value">${stats.streak || 0}</div>
        <div class="stat-sub">${stats.streak >= 7 ? 'On fire! 🔥' : 'Keep it up!'}</div>
      </div>
    </div>

    <div>
      <div class="section-title">Quick Actions</div>
      <div class="action-grid">
        ${resumeCard}
        <div class="action-card" onclick="startDailyChallenge()">
          <div class="action-icon">${isDailyChallengeCompleted() ? '✅' : '⭐'}</div>
          <h3>Daily Challenge</h3>
          <p>${isDailyChallengeCompleted() ? 'Completed today!' : 'New challenge available'}</p>
        </div>
        <div class="action-card" onclick="navigate('categories')">
          <div class="action-icon">📚</div>
          <h3>Browse Courses</h3>
          <p>All quiz categories</p>
        </div>
        <div class="action-card" onclick="startRandomQuiz()">
          <div class="action-icon">🎲</div>
          <h3>Quick Play</h3>
          <p>Random mixed quiz</p>
        </div>
        <div class="action-card" onclick="startWeakTopics()">
          <div class="action-icon">💪</div>
          <h3>Weak Topics</h3>
          <p>${weakCats.length ? weakCats.length + ' topics to improve' : 'All topics strong!'}</p>
        </div>
        <div class="action-card" onclick="reviewMistakes()">
          <div class="action-icon">🔍</div>
          <h3>Review Mistakes</h3>
          <p>Practice what you got wrong</p>
        </div>
        <div class="action-card new-badge" onclick="navigate('ai')">
          <div class="action-icon">🤖</div>
          <h3>AI Questions</h3>
          <p>Generate with Gemini AI</p>
        </div>
        <div class="action-card" onclick="navigate('leaderboard')">
          <div class="action-icon">🏆</div>
          <h3>Leaderboard</h3>
          <p>See global rankings</p>
        </div>
      </div>
    </div>`;
}

// ================================================================
// CATEGORIES — no mode tabs, show useful info
// ================================================================
function renderCategories() {
  const all = typeof getAllCourses === 'function' ? getAllCourses() : QUIZ_DATA;
  const cards = Object.entries(all).map(([id, data]) => {
    const mastery    = getCategoryMastery(id);
    const hist       = (currentUser.history || []).filter(h => h.category === id);
    const attempts   = hist.length;
    const bestScore  = attempts ? Math.max(...hist.map(h => h.percentage)) : null;
    const isCustom   = data.isCustom;

    const masteryBar = mastery > 0 ? `
      <div class="cat-mastery-wrap">
        <div class="cat-mastery-bar"><div class="cat-mastery-fill" style="width:${mastery}%"></div></div>
        <div class="cat-mastery-label">Mastery ${mastery}%</div>
      </div>` : '';

    const customBadge = isCustom
      ? `<span class="cat-custom-badge">Custom</span>` : '';

    const editBtn = isCustom
      ? `<button class="cat-edit-btn" onclick="event.stopPropagation();editCourse('${id}')">✏️</button>` : '';

    return `
      <div class="category-card" onclick="showQuizConfig({category:'${id}'})">
        <div class="cat-card-top">
          <div class="cat-icon-box" style="background:${data.color}">${data.icon}</div>
          ${editBtn}
        </div>
        <div class="cat-name">${data.name || id} ${customBadge}</div>
        <div class="cat-meta">${data.questions.length} questions</div>
        <div class="cat-desc">${data.description || ''}</div>
        <div class="cat-stats-row">
          <span class="cat-stat-pill">🎯 ${attempts} attempt${attempts !== 1 ? 's' : ''}</span>
          ${bestScore !== null ? `<span class="cat-stat-pill">⭐ Best: ${bestScore}%</span>` : ''}
        </div>
        ${masteryBar}
        <button class="btn btn-primary cat-start-btn">Start Quiz →</button>
      </div>`;
  }).join('');

  document.getElementById('page-wrap').innerHTML = `
    <div class="page-header">
      <h1>📚 Categories</h1>
      <p>Click any course to configure and start your quiz</p>
    </div>
    <div class="categories-grid anim-fade-up">${cards}</div>`;
}

// ================================================================
// PLAY PAGE
// ================================================================
function renderPlay() {
  const daily = getDailyChallenge();
  const done  = isDailyChallengeCompleted();
  document.getElementById('page-wrap').innerHTML = `
    <div class="page-header"><h1>🎮 Play Quiz</h1><p>Choose your mode</p></div>
    <div class="daily-card anim-fade-up">
      <div class="daily-icon">⭐</div>
      <div class="daily-info">
        <h3>Daily Challenge — ${daily.category}</h3>
        <p>5 fresh questions every day. Earn +50 bonus XP!</p>
        ${done
          ? '<div class="daily-done-badge">✓ Completed today!</div>'
          : `<button class="btn btn-primary" onclick="startDailyChallenge()">Start Daily Challenge</button>`}
        <div class="daily-countdown">${getDailyCountdown()}</div>
      </div>
    </div>
    <div class="play-grid anim-fade-up">
      <div class="play-card">
        <h3>🎲 Quick Random Quiz</h3>
        <p>Random questions from all categories. Great for general practice.</p>
        <button class="btn btn-primary" onclick="startRandomQuiz()">Start Random Quiz</button>
      </div>
      <div class="play-card">
        <h3>💪 Practice Weak Topics</h3>
        <p>Targets categories where you're scoring below 60%.</p>
        <button class="btn btn-ghost" onclick="startWeakTopics()">Start Practice</button>
      </div>
      <div class="play-card">
        <h3>🔍 Review Mistakes</h3>
        <p>Practice questions you previously got wrong from recent quizzes.</p>
        <button class="btn btn-secondary" onclick="reviewMistakes()">Review Mistakes</button>
      </div>
      <div class="play-card">
        <h3>🤖 AI-Generated Quiz</h3>
        <p>Generate custom questions on any topic using Gemini AI.</p>
        <button class="btn btn-secondary" onclick="navigate('ai')">Open AI Generator</button>
      </div>
    </div>`;
}

// ================================================================
// LEADERBOARD — medals, rankings, polished
// ================================================================
async function renderLeaderboard() {
  document.getElementById('page-wrap').innerHTML = `
    <div class="page-header"><h1>🏆 Leaderboard</h1><p>Loading rankings...</p></div>
    <div class="card anim-fade-up" style="padding:32px;text-align:center">
      <div class="ai-spinner"></div>
    </div>`;

  let allUsers = [];
  try {
    const data = await Auth.getLeaderboard();
    allUsers = (data.users || []).sort((a, b) => (b.stats?.totalPoints || 0) - (a.stats?.totalPoints || 0));
  } catch {
    // Fallback to localStorage
    allUsers = Object.values(JSON.parse(localStorage.getItem('users') || '{}')).sort((a, b) => (b.stats?.totalPoints || 0) - (a.stats?.totalPoints || 0));
  }

  const weeklyUsers = [...allUsers].sort((a, b) => getWeeklyPoints(b) - getWeeklyPoints(a));

  function buildRows(users, pointFn) {
    if (!users.length) return `<div class="lb-empty">No users yet. Be the first!</div>`;
    return users.slice(0, 10).map((u, i) => {
      const pts     = pointFn(u);
      const avg     = u.history?.length ? calculateSmartAverage(u.history) : 0;
      const medals  = ['🥇','🥈','🥉'];
      const medal   = medals[i] || `${i + 1}`;
      const isMe    = u.email === currentUser.email;
      const xpInfo  = getLevelInfo(u.stats?.totalXP || 0);
      return `
        <div class="lb-row ${isMe ? 'lb-me' : ''}">
          <div class="lb-rank">${medal}</div>
          <img class="lb-avatar" src="${u.avatar}" alt="${u.name}">
          <div class="lb-info">
            <div class="lb-name">${u.name}${isMe ? ' <span class="lb-you">You</span>' : ''}</div>
            <div class="lb-level">Lv.${xpInfo.current.level} ${xpInfo.current.title}</div>
          </div>
          <div class="lb-stats">
            <div class="lb-pts">${pts.toLocaleString()} pts</div>
            <div class="lb-sub">${u.stats?.quizzesTaken || 0} quizzes · ${avg}% avg</div>
          </div>
        </div>`;
    }).join('');
  }

  document.getElementById('page-wrap').innerHTML = `
    <div class="page-header"><h1>🏆 Leaderboard</h1><p>${allUsers.length} learners competing</p></div>
    <div class="lb-tabs-bar">
      <button class="lb-tab active" onclick="switchLbTab('all',this)" id="lb-tab-all">All Time</button>
      <button class="lb-tab" onclick="switchLbTab('weekly',this)" id="lb-tab-weekly">This Week</button>
    </div>
    <div class="lb-list anim-fade-up" id="lb-all">${buildRows(allUsers, u => u.stats?.totalPoints || 0)}</div>
    <div class="lb-list anim-fade-up" id="lb-weekly" style="display:none">${buildRows(weeklyUsers, u => getWeeklyPoints(u))}</div>`;
}

function switchLbTab(tab, el) {
  document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('lb-all').style.display     = tab === 'all'    ? '' : 'none';
  document.getElementById('lb-weekly').style.display  = tab === 'weekly' ? '' : 'none';
}

// ================================================================
// HISTORY
// ================================================================
// ================================================================
// HISTORY — paginated, server-fetched
// ================================================================
let _histPage = 1;
let _histItems = [];
let _histHasMore = false;

async function renderHistory(reset = true) {
  if (reset) { _histPage = 1; _histItems = []; }

  if (reset) {
    document.getElementById('page-wrap').innerHTML = `
      <div class="page-header"><h1>📊 History</h1><p>Loading your quiz history...</p></div>
      <div class="history-list anim-fade-up" id="history-list">
        <div class="empty-state" style="padding:32px">
          <div class="ai-spinner" style="margin:0 auto 12px"></div>
          <p>Fetching history...</p>
        </div>
      </div>`;
  }

  try {
    const data = await History.getPage(_histPage, 10);
    _histItems = reset ? data.history : [..._histItems, ...data.history];
    _histHasMore = data.hasMore;
    _renderHistoryList(data.total);
  } catch (err) {
    // Fallback to local history if server fails
    _renderHistoryLocal();
  }
}

function _renderHistoryLocal() {
  const hist = (currentUser.history || []).slice().reverse();
  if (!hist.length) {
    document.getElementById('page-wrap').innerHTML = `
      <div class="page-header"><h1>📊 History</h1></div>
      <div class="empty-state"><div class="empty-icon">📋</div><h3>No history yet</h3><p>Complete your first quiz to see it here!</p></div>`;
    return;
  }
  _histItems = hist.map((h, i) => ({ ...h, _index: hist.length - 1 - i, hasReview: !!(h.questionData?.length) }));
  _histHasMore = false;
  _renderHistoryList(hist.length);
}

function _renderHistoryList(total) {
  const items = _histItems.map(h => {
    const emoji  = h.percentage >= 80 ? '⭐' : h.percentage >= 60 ? '👍' : '📝';
    const color  = h.percentage >= 80 ? 'var(--green)' : h.percentage >= 60 ? 'var(--gold)' : 'var(--red)';
    const daily  = h.isDailyChallenge ? '<span class="daily-mini-badge">⭐ Daily</span>' : '';
    const review = h.hasReview !== false
      ? `onclick="showHistoryDetail(${h._index})" style="cursor:pointer"`
      : '';
    return `<div class="history-item" ${review}>
      <div class="h-emoji">${emoji}</div>
      <div class="h-info">
        <div class="h-cat">${h.category} ${daily}</div>
        <div class="h-meta">${new Date(h.date).toLocaleDateString()} · ${h.timeTaken}</div>
      </div>
      <div class="score-ring" style="border-color:${color};color:${color}">${h.percentage}%</div>
      <div style="text-align:right">
        <div style="font-size:12px;color:var(--t2)">${h.score}/${h.total}</div>
        <div class="h-pts">+${h.points}pts</div>
      </div>
    </div>`;
  }).join('');

  const loadMore = _histHasMore ? `
    <button class="btn btn-secondary" style="width:100%;margin-top:4px"
      onclick="_histPage++;renderHistory(false)">
      Load More
    </button>` : '';

  document.getElementById('page-wrap').innerHTML = `
    <div class="page-header">
      <h1>📊 History</h1>
      <p>${total} quiz${total !== 1 ? 'zes' : ''} completed · Click any to review</p>
    </div>
    <div class="history-list anim-fade-up" id="history-list">
      ${items || '<div class="empty-state"><div class="empty-icon">📋</div><h3>No history yet</h3><p>Complete your first quiz to see it here!</p></div>'}
    </div>
    ${loadMore}`;
}

async function showHistoryDetail(index) {
  // Try to get from local memory first
  const local = currentUser.history[index];
  if (local?.questionData?.length) {
    renderReviewScreen(local);
    return;
  }

  // Fetch full entry from server
  showToast('Loading review...', 'info', 1200);
  try {
    const data = await History.getEntry(index);
    if (data.entry?.questionData?.length) {
      renderReviewScreen(data.entry);
    } else {
      showToast('Review not available for this quiz', 'info');
    }
  } catch (err) {
    showToast('Could not load review', 'error');
  }
}

// ================================================================
// ACHIEVEMENTS & LEVELS — no horizontal overflow
// ================================================================
function renderAchievementsAndLevels() {
  const unlocked = currentUser.achievements || [];
  const xp       = currentUser.stats?.totalXP || 0;
  const info     = getLevelInfo(xp);

  const xpCard = `
    <div class="xp-progress-card">
      <div class="xp-card-top">
        <div>
          <div class="xp-card-level">Level ${info.current.level} — ${info.current.title} ${info.current.emoji}</div>
          <div class="xp-card-total">${xp.toLocaleString()} XP total</div>
        </div>
      </div>
      <div class="prog-bg" style="height:10px">
        <div class="prog-fill" style="width:${info.progress}%"></div>
      </div>
      <div class="xp-card-sub">
        <span>${info.xpIntoLevel.toLocaleString()} XP into level</span>
        <span>${info.next ? info.xpForNextLevel.toLocaleString() + ' XP to Level ' + (info.current.level + 1) : 'MAX LEVEL 🏆'}</span>
      </div>
    </div>`;

  // Level grid — wrapping grid, no horizontal scroll
  const levelCards = LEVELS.map(lv => {
    const isReached = info.current.level >= lv.level;
    const isCurrent = info.current.level === lv.level;
    return `
      <div class="level-card ${isReached ? 'reached' : ''} ${isCurrent ? 'current' : ''}">
        <div class="level-emoji">${lv.emoji}</div>
        <div class="level-num">Lv.${lv.level}</div>
        <div class="level-title">${lv.title}</div>
        <div class="level-xp">${lv.xpRequired.toLocaleString()} XP</div>
        ${isCurrent ? `<div class="level-badge-tag current-tag">Current</div>` : ''}
        ${isReached && !isCurrent ? `<div class="level-badge-tag reached-tag">✓</div>` : ''}
      </div>`;
  }).join('');

  const achCards = ACHIEVEMENTS.map(a => {
    const isUnlocked = unlocked.includes(a.id);
    return `<div class="ach-card ${isUnlocked ? 'unlocked' : 'locked'}">
      <div class="ach-icon">${a.icon}</div>
      <div class="ach-name">${a.name}</div>
      <div class="ach-desc">${a.desc}</div>
      <div class="ach-req">${a.req}</div>
      ${isUnlocked ? '<div class="ach-unlocked-badge">✓ Unlocked</div>' : ''}
    </div>`;
  }).join('');

  document.getElementById('page-wrap').innerHTML = `
    <div class="page-header">
      <h1>🏅 Achievements & Levels</h1>
      <p>${unlocked.length}/${ACHIEVEMENTS.length} achievements · Level ${info.current.level}</p>
    </div>
    ${xpCard}
    <div class="section-title" style="margin-top:8px">🎖️ Level Progression</div>
    <div class="levels-grid anim-fade-up">${levelCards}</div>
    <div class="section-title">🏅 Achievements</div>
    <div class="achievements-grid anim-fade-up">${achCards}</div>`;
}

// ================================================================
// PROFILE
// ================================================================
function renderProfile() {
  const xpInfo = getLevelInfo(currentUser.stats?.totalXP || 0);
  document.getElementById('page-wrap').innerHTML = `
    <div class="page-header"><h1>👤 My Profile</h1><p>Manage your account</p></div>
    <div class="profile-layout anim-fade-up">
      <div class="profile-av-card">
        <img id="profile-av-img" src="${currentUser.avatar}" alt="Avatar">
        <h3>${currentUser.name}</h3>
        <p style="font-size:12px;color:var(--t3)">${currentUser.email}</p>
        <div class="level-pill">Lv.${xpInfo.current.level} ${xpInfo.current.title} ${xpInfo.current.emoji}</div>
        <p style="font-size:13px;color:var(--t2)">${currentUser.bio || 'No bio yet'}</p>
        <button class="btn btn-secondary" style="font-size:12px" onclick="openUploadModal()">📷 Change Photo</button>
        <div style="font-size:11px;color:var(--t3);margin-top:8px">Member since ${new Date(currentUser.joinDate).toLocaleDateString()}</div>
      </div>
      <div class="profile-form-card">
        <h3>Edit Profile</h3>
        <div class="field"><label>Full Name</label><input type="text" id="profile-name" value="${currentUser.name}" maxlength="60"></div>
        <div class="field"><label>Email (cannot change)</label><input type="email" value="${currentUser.email}" disabled></div>
        <div class="field"><label>Bio</label><textarea class="field-ta" id="profile-bio" placeholder="Tell us about yourself..." maxlength="300">${currentUser.bio || ''}</textarea></div>
        <button class="btn btn-primary" onclick="saveProfile()">Save Changes</button>
      </div>
    </div>`;
}

function saveProfile() {
  const name = document.getElementById('profile-name').value.trim();
  const bio  = document.getElementById('profile-bio').value.trim();
  if (name.length < 2) return showToast('Name must be at least 2 characters', 'warning');
  showConfirm('Save Changes', 'Save your profile updates?', '💾', () => {
    currentUser.name = name;
    currentUser.bio  = bio;
    updateUser();
    renderProfile();
    showToast('Profile saved ✓', 'success');
  });
}

// ================================================================
// SETTINGS
// ================================================================
function renderSettings() {
  const currentTheme = document.body.getAttribute('data-theme') || 'midnight';
  const swatches = THEMES.map(t => `
    <div class="theme-swatch ${t.id === currentTheme ? 'active' : ''}"
         style="background:${t.dots[0]};border-color:${t.id === currentTheme ? 'var(--accent)' : 'transparent'}"
         onclick="applyTheme('${t.id}');renderSettings();if(currentUser)updateUser()">
      <div class="swatch-dots">
        ${t.dots.map(d => `<div class="swatch-dot" style="background:${d}"></div>`).join('')}
      </div>
      <div class="swatch-name" style="color:${t.scheme==='dark'?'#fff':'#111'}">${t.name}</div>
    </div>`).join('');

  document.getElementById('page-wrap').innerHTML = `
    <div class="page-header"><h1>⚙️ Settings</h1><p>Customize your Quiz Academy experience</p></div>
    <div class="settings-section anim-fade-up">
      <h3>🎨 Theme</h3>
      <div class="theme-grid">${swatches}</div>
    </div>
    ${typeof renderPushSettingsSection === 'function' ? renderPushSettingsSection() : ''}
    <div class="settings-section">
      <h3>Account</h3>
      <div class="setting-item">
        <div class="setting-info"><h4>Reset All Data</h4><p>Permanently delete all quiz history, achievements and progress</p></div>
        <button class="btn btn-danger" onclick="clearAllData()">Reset</button>
      </div>
    </div>`;
}

function clearAllData() {
  showConfirm('Reset All Data', 'This permanently deletes all quiz history, achievements, and progress. Cannot be undone!', '⚠️', () => {
    currentUser.history      = [];
    currentUser.achievements = [];
    currentUser.stats        = { quizzesTaken:0, totalPoints:0, totalXP:0, currentLevel:1, streak:0, lastQuizDate:null, dailyChallengesDone:0, categoriesPlayed:[], weightedAvgScore:null };
    currentUser.notifications = [];
    notifications = [];
    updateUser();
    renderNotifBadge();
    navigate('home');
    showToast('All data reset ✓', 'info');
  });
}

// ================================================================
// USERS
// ================================================================
function renderUsers() {
  const others = Object.values(JSON.parse(localStorage.getItem('users') || '{}')).filter(u => u.email !== currentUser.email);
  if (!others.length) {
    document.getElementById('page-wrap').innerHTML = `
      <div class="page-header"><h1>👥 Users</h1></div>
      <div class="empty-state"><div class="empty-icon">👤</div><h3>No other users yet</h3><p>Invite friends to join Quiz Academy!</p></div>`;
    return;
  }
  const cards = others.map(u => `
    <div class="user-card">
      <img src="${u.avatar}" alt="${u.name}">
      <h3>${u.name}</h3>
      <p>${(u.stats?.totalPoints || 0).toLocaleString()} pts</p>
      <p>${u.stats?.quizzesTaken || 0} quizzes</p>
    </div>`).join('');
  document.getElementById('page-wrap').innerHTML = `
    <div class="page-header"><h1>👥 Users</h1><p>${others.length} learner${others.length !== 1 ? 's' : ''}</p></div>
    <div class="users-grid anim-fade-up">${cards}</div>`;
}

// ================================================================
// ONBOARDING
// ================================================================
let onboardStep = 0;
const onboardSteps = [
  { icon: '🎓', title: 'Welcome to Quiz Academy!', body: 'Test your knowledge, earn XP, climb the leaderboard, and unlock achievements. Let\'s get you set up!' },
  { icon: '📚', title: 'Choose your first topic', body: 'Pick the categories you want to focus on. We\'ll track your mastery in each one.' },
  { icon: '⭐', title: 'Complete Daily Challenges', body: 'A fresh 5-question challenge drops every day. Earn bonus XP and build your streak!' },
  { icon: '🏆', title: 'You\'re all set!', body: 'Earn XP, level up, unlock achievements, and compete on the leaderboard. Let\'s go!' }
];

function showOnboarding() {
  onboardStep = 0;
  renderOnboardStep();
  document.getElementById('topbar-title').textContent = 'Welcome';
}

function renderOnboardStep() {
  const step   = onboardSteps[onboardStep];
  const dots   = onboardSteps.map((_, i) => `<div class="onboard-dot ${i === onboardStep ? 'active' : ''}"></div>`).join('');
  const isLast = onboardStep === onboardSteps.length - 1;
  const catPicker = onboardStep === 1 ? `
    <div class="onboard-cats">
      ${Object.entries(QUIZ_DATA).map(([name, data]) => `
        <div class="onboard-cat" onclick="this.classList.toggle('picked')">
          <span>${data.icon}</span><span style="font-size:13px;color:var(--t1)">${name}</span>
          <span class="onboard-cat-check">✓</span>
        </div>`).join('')}
    </div>` : '';
  document.getElementById('page-wrap').innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:60vh">
      <div class="onboard-card">
        <div class="onboard-step-dots">${dots}</div>
        <div class="onboard-icon">${step.icon}</div>
        <h2>${step.title}</h2>
        <p>${step.body}</p>
        ${catPicker}
        <button class="btn btn-primary" style="width:100%;padding:13px" onclick="${isLast ? 'navigate(\'home\')' : 'nextOnboardStep()'}">
          ${isLast ? '🚀 Let\'s Go!' : 'Next →'}
        </button>
      </div>
    </div>`;
}

function nextOnboardStep() {
  onboardStep++;
  if (onboardStep < onboardSteps.length) renderOnboardStep();
  else navigate('home');
}

// ── SIDEBAR COLLAPSE ──
let sidebarCollapsed = false;

function toggleSidebarCollapse() {
  sidebarCollapsed = !sidebarCollapsed;
  document.getElementById('sidebar').classList.toggle('collapsed', sidebarCollapsed);
  localStorage.setItem('sb_collapsed', sidebarCollapsed);
}

function initSidebarCollapse() {
  sidebarCollapsed = localStorage.getItem('sb_collapsed') === 'true';
  if (sidebarCollapsed) document.getElementById('sidebar')?.classList.add('collapsed');
}

// ── TIMER SETTINGS ALIAS ──
function renderTimerSettings() {
  if (typeof renderTimeLimitsPage === 'function') renderTimeLimitsPage();
}
