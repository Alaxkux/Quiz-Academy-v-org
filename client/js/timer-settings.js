/* ================================================================
   QUIZ ACADEMY — TIME LIMIT SETTINGS
   Users can set a per-question time limit (in seconds).
   0 = no limit. Stored in currentUser.settings.timeLimit.
   The quiz engine reads this value and enforces it.
   ================================================================ */

function renderTimerSettings() {
  const current = currentUser.settings?.timeLimit || 0;
  const presets = [
    { label: 'No limit', value: 0 },
    { label: '15 sec', value: 15 },
    { label: '30 sec', value: 30 },
    { label: '45 sec', value: 45 },
    { label: '60 sec', value: 60 },
    { label: '90 sec', value: 90 },
    { label: '2 min', value: 120 },
  ];

  document.getElementById('page-wrap').innerHTML = `
    <div class="anim-fade-up">
      <div class="page-header">
        <h1>⏱ Time Limits</h1>
        <p>Set how long you have to answer each question</p>
      </div>

      <div class="tl-card">
        <div class="tl-card-title">Per-Question Time Limit</div>
        <p class="tl-desc">When a time limit is set, each question will have a countdown timer.
        If time runs out, the question is automatically marked as skipped and the quiz moves forward.</p>

        <div class="tl-presets">
          ${presets.map(p => `
            <button class="tl-preset ${current === p.value ? 'active' : ''}"
                    onclick="setTimeLimit(${p.value}, this)">
              ${p.label}
            </button>`).join('')}
        </div>

        <div class="tl-custom-row">
          <label>Custom (seconds)</label>
          <input type="number" id="tl-custom-input" class="tl-input" min="5" max="300" step="5"
                 value="${current > 0 ? current : ''}" placeholder="e.g. 25">
          <button class="tl-apply-btn" onclick="applyCustomTimeLimit()">Apply</button>
        </div>

        <div class="tl-current">
          Current setting:
          <span id="tl-current-label" class="tl-current-value">
            ${current === 0 ? 'No limit' : current + ' seconds per question'}
          </span>
        </div>
      </div>

      <div class="tl-card">
        <div class="tl-card-title">Preview</div>
        <div class="tl-preview ${current > 0 ? '' : 'tl-preview-off'}">
          ${current > 0 ? `
            <div class="quiz-timer" style="width:fit-content">
              ⏱ <span>${Math.floor(current/60)}:${String(current%60).padStart(2,'0')}</span>
            </div>
            <p style="font-size:13px;color:var(--t2);margin-top:10px">This timer will count down for each question in all quizzes.</p>
          ` : `
            <p style="font-size:13px;color:var(--t3)">No time limit — questions will not auto-advance.</p>
          `}
        </div>
      </div>
    </div>`;
}

function setTimeLimit(value, btnEl) {
  document.querySelectorAll('.tl-preset').forEach(b => b.classList.remove('active'));
  btnEl.classList.add('active');
  currentUser.settings = currentUser.settings || {};
  currentUser.settings.timeLimit = value;
  updateUser();
  const label = document.getElementById('tl-current-label');
  if (label) label.textContent = value === 0 ? 'No limit' : value + ' seconds per question';
  const input = document.getElementById('tl-custom-input');
  if (input) input.value = value > 0 ? value : '';
  showToast(value === 0 ? 'Time limit removed ✓' : `Time limit set to ${value}s per question ✓`, 'success');
  // Re-render preview
  setTimeout(() => renderTimerSettings(), 300);
}

function applyCustomTimeLimit() {
  const val = parseInt(document.getElementById('tl-custom-input').value);
  if (!val || val < 5) return showToast('Minimum time limit is 5 seconds', 'warning');
  if (val > 300) return showToast('Maximum time limit is 300 seconds (5 minutes)', 'warning');
  document.querySelectorAll('.tl-preset').forEach(b => b.classList.remove('active'));
  currentUser.settings = currentUser.settings || {};
  currentUser.settings.timeLimit = val;
  updateUser();
  showToast(`Time limit set to ${val}s per question ✓`, 'success');
  setTimeout(() => renderTimerSettings(), 300);
}

// ── QUIZ ENGINE INTEGRATION ──
// Called from quiz.js — starts a per-question countdown if limit > 0
let questionTimer = null;
let questionTimeLeft = 0;

function startQuestionTimer(limit, onExpire) {
  clearQuestionTimer();
  if (!limit || limit <= 0) return;
  questionTimeLeft = limit;
  updateQuestionTimerDisplay();
  questionTimer = setInterval(() => {
    questionTimeLeft--;
    updateQuestionTimerDisplay();
    if (questionTimeLeft <= 0) {
      clearQuestionTimer();
      onExpire();
    }
  }, 1000);
}

function clearQuestionTimer() {
  if (questionTimer) { clearInterval(questionTimer); questionTimer = null; }
}

function updateQuestionTimerDisplay() {
  const el = document.getElementById('question-timer-countdown');
  if (!el) return;
  const m = Math.floor(questionTimeLeft / 60);
  const s = questionTimeLeft % 60;
  el.textContent = `${m}:${String(s).padStart(2,'0')}`;
  el.classList.toggle('warn', questionTimeLeft <= 10);
}
