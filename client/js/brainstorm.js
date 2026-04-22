/* ================================================================
   QUIZ ACADEMY — BRAINSTORMING MODE
   A study mode where questions are shown, user clicks to reveal
   the answer for each one. No scoring, no timer.
   Perfect for reviewing before an exam.
   ================================================================ */

function renderBrainstorm() {
  const all = typeof getAllCourses === 'function' ? getAllCourses() : QUIZ_DATA;
  const categories = Object.keys(all);

  document.getElementById('page-wrap').innerHTML = `
    <div class="anim-fade-up">
      <div class="page-header">
        <h1>🧠 Brainstorming</h1>
        <p>Study mode — click any question to reveal the answer</p>
      </div>

      <!-- Category selector -->
      <div class="bs-cat-bar">
        <button class="bs-cat-btn active" data-cat="all" onclick="loadBrainstormQuestions('all', this)">All</button>
        ${categories.map(c => `<button class="bs-cat-btn" data-cat="${c}" onclick="loadBrainstormQuestions('${c}', this)">${c}</button>`).join('')}
      </div>

      <!-- Filter row -->
      <div class="bs-filter-row">
        <div class="bs-filter-group">
          <label>Difficulty</label>
          <select id="bs-diff" class="bs-select" onchange="refreshBrainstorm()">
            <option value="all">All</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div class="bs-filter-group">
          <label>Show</label>
          <select id="bs-show" class="bs-select" onchange="refreshBrainstorm()">
            <option value="all">All questions</option>
            <option value="unanswered">Not yet revealed</option>
          </select>
        </div>
        <button class="bs-reset-btn" onclick="resetBrainstorm()">↺ Reset All</button>
        <div class="bs-progress-label" id="bs-progress-label"></div>
      </div>

      <!-- Questions grid -->
      <div class="bs-grid" id="bs-grid"></div>
    </div>`;

  loadBrainstormQuestions('all', document.querySelector('.bs-cat-btn[data-cat="all"]'));
}

let bsCurrentCat = 'all';
let bsRevealed = {}; // { questionId: true }

function loadBrainstormQuestions(cat, btnEl) {
  bsCurrentCat = cat;
  document.querySelectorAll('.bs-cat-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  refreshBrainstorm();
}

function refreshBrainstorm() {
  const all = typeof getAllCourses === 'function' ? getAllCourses() : QUIZ_DATA;
  const diff = document.getElementById('bs-diff')?.value || 'all';
  const show = document.getElementById('bs-show')?.value || 'all';

  let questions = [];
  if (bsCurrentCat === 'all') {
    Object.entries(all).forEach(([cat, data]) => {
      data.questions.forEach((q, i) => questions.push({ ...q, _cat: cat, _id: `${cat}__${i}` }));
    });
  } else {
    const data = all[bsCurrentCat];
    if (data) data.questions.forEach((q, i) => questions.push({ ...q, _cat: bsCurrentCat, _id: `${bsCurrentCat}__${i}` }));
  }

  if (diff !== 'all') questions = questions.filter(q => q.difficulty === diff);
  if (show === 'unanswered') questions = questions.filter(q => !bsRevealed[q._id]);

  const total = questions.length;
  const revealed = questions.filter(q => bsRevealed[q._id]).length;
  const prog = document.getElementById('bs-progress-label');
  if (prog) prog.textContent = `${revealed} / ${total} revealed`;

  const grid = document.getElementById('bs-grid');
  if (!grid) return;

  if (!questions.length) {
    grid.innerHTML = `<div class="bs-empty">
      <div style="font-size:36px;margin-bottom:8px">🎉</div>
      <p>${show === 'unanswered' ? "You've revealed all questions in this category!" : 'No questions match this filter.'}</p>
    </div>`;
    return;
  }

  grid.innerHTML = questions.map(q => {
    const isRevealed = !!bsRevealed[q._id];
    const diffColor = q.difficulty === 'easy' ? 'var(--green)' : q.difficulty === 'hard' ? 'var(--red)' : 'var(--gold)';
    return `
      <div class="bs-card ${isRevealed ? 'bs-revealed' : ''}" id="bscard-${q._id.replace(/\s/g,'_')}" onclick="toggleBsAnswer('${q._id.replace(/'/g,"\\'")}', this)">
        <div class="bs-card-top">
          <span class="bs-cat-label">${q._cat}</span>
          <span class="bs-diff-label" style="color:${diffColor}">${q.difficulty || 'medium'}</span>
        </div>
        <div class="bs-question">${q.q}</div>
        <div class="bs-answer-wrap ${isRevealed ? 'show' : ''}">
          <div class="bs-answer-label">✓ Answer</div>
          <div class="bs-answer-text">${q.opts[q.a]}</div>
          ${q.explanation ? `<div class="bs-explanation">💡 ${q.explanation}</div>` : ''}
          <div class="bs-all-opts">
            ${q.opts.map((o, i) => `<div class="bs-opt ${i === q.a ? 'bs-opt-correct' : ''}">${String.fromCharCode(65+i)}. ${o}</div>`).join('')}
          </div>
        </div>
        <div class="bs-tap-hint">${isRevealed ? 'Click to hide' : '👆 Click to reveal answer'}</div>
      </div>`;
  }).join('');
}

function toggleBsAnswer(id, cardEl) {
  if (bsRevealed[id]) {
    delete bsRevealed[id];
    cardEl.classList.remove('bs-revealed');
    cardEl.querySelector('.bs-answer-wrap')?.classList.remove('show');
    cardEl.querySelector('.bs-tap-hint').textContent = '👆 Click to reveal answer';
  } else {
    bsRevealed[id] = true;
    cardEl.classList.add('bs-revealed');
    cardEl.querySelector('.bs-answer-wrap')?.classList.add('show');
    cardEl.querySelector('.bs-tap-hint').textContent = 'Click to hide';
  }
  // Update progress
  const all = typeof getAllCourses === 'function' ? getAllCourses() : QUIZ_DATA;
  let total = 0;
  if (bsCurrentCat === 'all') Object.values(all).forEach(d => total += d.questions.length);
  else total = all[bsCurrentCat]?.questions.length || 0;
  const prog = document.getElementById('bs-progress-label');
  if (prog) prog.textContent = `${Object.keys(bsRevealed).length} / ${total} revealed`;
}

function resetBrainstorm() {
  bsRevealed = {};
  refreshBrainstorm();
  showToast('All answers hidden — fresh start!', 'info');
}
