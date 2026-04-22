/* ================================================================
   QUIZ ACADEMY — COURSE BUILDER
   Full in-app course management:
   - Create / edit / delete custom courses
   - Add / edit / delete questions visually
   - Import questions from JSON file
   - AI auto-generate questions for a course
   - Preview before saving
   - Export course as JSON
   All custom courses stored in localStorage under 'qa_custom_courses'
   ================================================================ */

// ── STORAGE HELPERS ──
function getCustomCourses() {
  return JSON.parse(localStorage.getItem('qa_custom_courses') || '{}');
}

function saveCustomCourses(courses) {
  localStorage.setItem('qa_custom_courses', JSON.stringify(courses));
}

function getAllCourses() {
  // Merge built-in + custom, custom can override built-in by same key
  const custom = getCustomCourses();
  return { ...QUIZ_DATA, ...custom };
}

// ── BUILDER STATE ──
let builderCourse = null;   // course being edited
let builderQuestions = [];  // questions being edited
let previewQuiz = null;     // for preview mode

// ── ICONS FOR PICKER ──
const COURSE_ICONS = ['📚','💻','🛒','📝','💼','🎓','🔬','🧮','🌍','⚗️','🏛️','🎨','🧠','⚡','🔧','📊','🏥','⚖️','🎵','🌱'];
const COURSE_COLORS = [
  { label: 'Blue',   bg: 'rgba(108,142,255,.12)', accent: '#6C8EFF' },
  { label: 'Green',  bg: 'rgba(77,255,195,.1)',   accent: '#4DFFC3' },
  { label: 'Gold',   bg: 'rgba(245,200,66,.1)',   accent: '#F5C842' },
  { label: 'Red',    bg: 'rgba(255,107,138,.1)',  accent: '#FF6B8A' },
  { label: 'Purple', bg: 'rgba(181,123,255,.1)',  accent: '#B57BFF' },
  { label: 'Orange', bg: 'rgba(255,122,69,.12)',  accent: '#FF7A45' },
  { label: 'Teal',   bg: 'rgba(56,189,248,.1)',   accent: '#38BDF8' },
  { label: 'Pink',   bg: 'rgba(232,65,122,.1)',   accent: '#E8417A' },
];

// ── MAIN BUILDER PAGE ──
function renderCourseBuilder() {
  const custom = getCustomCourses();
  const customList = Object.entries(custom);
  const builtInList = Object.entries(QUIZ_DATA);

  const customCards = customList.length ? customList.map(([id, course]) => `
    <div class="cb-course-card" id="cbcard-${id}">
      <div class="cb-course-icon" style="background:${course.color}">${course.icon}</div>
      <div class="cb-course-info">
        <div class="cb-course-name">${course.name || id}</div>
        <div class="cb-course-meta">${course.questions.length} questions · ${course.description || 'Custom course'}</div>
      </div>
      <div class="cb-course-actions">
        <button class="cb-btn cb-btn-ghost" onclick="editCourse('${id}')">✏️ Edit</button>
        <button class="cb-btn cb-btn-ghost" onclick="previewCourse('${id}')">▶ Preview</button>
        <button class="cb-btn cb-btn-export" onclick="exportCourse('${id}')">⬇ Export</button>
        <button class="cb-btn cb-btn-danger" onclick="deleteCourse('${id}')">🗑</button>
      </div>
    </div>`).join('') : `<div class="cb-empty">
      <div style="font-size:36px;margin-bottom:10px">📭</div>
      <p>No custom courses yet. Create your first one below!</p>
    </div>`;

  const builtInCards = builtInList.map(([id, course]) => `
    <div class="cb-course-card cb-builtin">
      <div class="cb-course-icon" style="background:${course.color}">${course.icon}</div>
      <div class="cb-course-info">
        <div class="cb-course-name">${id} <span class="cb-builtin-badge">Built-in</span></div>
        <div class="cb-course-meta">${course.questions.length} questions · ${course.description}</div>
      </div>
      <div class="cb-course-actions">
        <button class="cb-btn cb-btn-ghost" onclick="duplicateCourse('${id}')">📋 Duplicate & Edit</button>
        <button class="cb-btn cb-btn-export" onclick="exportCourse('${id}')">⬇ Export JSON</button>
      </div>
    </div>`).join('');

  document.getElementById('page-wrap').innerHTML = `
    <div class="anim-fade-up">
      <div class="page-header">
        <h1>🏗️ Course Builder</h1>
        <p>Create, edit, and manage quiz courses</p>
      </div>

      <!-- ACTION BAR -->
      <div class="cb-action-bar">
        <button class="cb-btn cb-btn-primary" onclick="openNewCourseForm()">
          ＋ New Course
        </button>
        <button class="cb-btn cb-btn-ghost" onclick="openImportCourseModal()">
          ⬆ Import JSON
        </button>
        <button class="cb-btn cb-btn-ghost" onclick="downloadJSONTemplate()">
          📄 Download Template
        </button>
      </div>

      <!-- CUSTOM COURSES -->
      <div class="cb-section">
        <div class="cb-section-title">My Courses <span class="cb-count">${customList.length}</span></div>
        <div class="cb-course-list">${customCards}</div>
      </div>

      <!-- BUILT-IN COURSES -->
      <div class="cb-section">
        <div class="cb-section-title">Built-in Courses <span class="cb-count">${builtInList.length}</span></div>
        <div class="cb-course-list">${builtInCards}</div>
      </div>
    </div>`;
}

// ── NEW / EDIT COURSE FORM ──
function openNewCourseForm(prefill = null) {
  builderCourse = prefill || {
    id: '', name: '', description: '', icon: '📚',
    color: COURSE_COLORS[0].bg, colorAccent: COURSE_COLORS[0].accent
  };
  builderQuestions = prefill?.questions ? [...prefill.questions] : [];
  renderBuilderForm();
}

function editCourse(id) {
  const courses = getCustomCourses();
  const course = courses[id];
  if (!course) return showToast('Course not found', 'error');
  builderCourse = { ...course, id };
  builderQuestions = [...(course.questions || [])];
  renderBuilderForm();
}

function duplicateCourse(id) {
  const all = getAllCourses();
  const course = all[id];
  if (!course) return;
  const copy = {
    id: '',
    name: course.name ? `${course.name} (Copy)` : `${id} (Copy)`,
    description: course.description || '',
    icon: course.icon || '📚',
    color: course.color || COURSE_COLORS[0].bg,
    colorAccent: course.colorAccent || COURSE_COLORS[0].accent,
    questions: [...course.questions]
  };
  openNewCourseForm(copy);
}

function renderBuilderForm() {
  const isEdit = !!(builderCourse.id);
  const iconOptions = COURSE_ICONS.map(ic =>
    `<button class="cb-icon-btn ${builderCourse.icon === ic ? 'active' : ''}" onclick="selectIcon('${ic}')">${ic}</button>`
  ).join('');
  const colorOptions = COURSE_COLORS.map((c, i) =>
    `<div class="cb-color-swatch ${builderCourse.color === c.bg ? 'active' : ''}"
         style="background:${c.accent}"
         onclick="selectColor(${i})" title="${c.label}"></div>`
  ).join('');

  document.getElementById('page-wrap').innerHTML = `
    <div class="anim-fade-up">
      <div class="cb-form-header">
        <button class="cb-back-btn" onclick="renderCourseBuilder()">← Back</button>
        <h1>${isEdit ? '✏️ Edit Course' : '➕ New Course'}</h1>
      </div>

      <!-- COURSE DETAILS -->
      <div class="cb-form-card">
        <div class="cb-form-card-title">Course Details</div>
        <div class="cb-form-row">
          <div class="cb-field" style="flex:2">
            <label>Course Name *</label>
            <input type="text" id="cb-name" placeholder="e.g. Introduction to Databases" value="${builderCourse.name || ''}" maxlength="60">
          </div>
          <div class="cb-field" style="flex:1">
            <label>Short ID *</label>
            <input type="text" id="cb-id" placeholder="e.g. CSC 201" value="${builderCourse.id || ''}" maxlength="20" ${isEdit ? 'disabled' : ''}>
            ${isEdit ? '<div style="font-size:11px;color:var(--t3);margin-top:3px">ID cannot be changed after creation</div>' : ''}
          </div>
        </div>
        <div class="cb-field">
          <label>Description</label>
          <input type="text" id="cb-desc" placeholder="Brief description of this course" value="${builderCourse.description || ''}" maxlength="100">
        </div>
        <div class="cb-form-row">
          <div class="cb-field">
            <label>Icon</label>
            <div class="cb-icon-grid">${iconOptions}</div>
          </div>
          <div class="cb-field">
            <label>Color</label>
            <div class="cb-color-grid">${colorOptions}</div>
          </div>
        </div>
      </div>

      <!-- QUESTIONS -->
      <div class="cb-form-card">
        <div class="cb-form-card-header">
          <div class="cb-form-card-title">Questions <span class="cb-count" id="q-count">${builderQuestions.length}</span></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="cb-btn cb-btn-ghost cb-btn-sm" onclick="openAIGenerateForCourse()">🤖 AI Generate</button>
            <button class="cb-btn cb-btn-ghost cb-btn-sm" onclick="openImportQuestionsModal()">⬆ Import JSON</button>
            <button class="cb-btn cb-btn-primary cb-btn-sm" onclick="addNewQuestion()">＋ Add Question</button>
          </div>
        </div>
        <div id="cb-questions-list">
          ${builderQuestions.length ? renderQuestionsList() : `
            <div class="cb-empty" style="padding:32px">
              <div style="font-size:32px;margin-bottom:8px">❓</div>
              <p>No questions yet. Add one manually, import from JSON, or use AI to generate.</p>
            </div>`}
        </div>
      </div>

      <!-- FORM ACTIONS -->
      <div class="cb-form-actions">
        <button class="cb-btn cb-btn-secondary" onclick="renderCourseBuilder()">Cancel</button>
        <button class="cb-btn cb-btn-ghost" onclick="previewBuilderCourse()">▶ Preview Quiz</button>
        <button class="cb-btn cb-btn-primary" onclick="saveCourse()">
          ${isEdit ? '💾 Save Changes' : '✓ Create Course'}
        </button>
      </div>
    </div>`;
}

function renderQuestionsList() {
  return builderQuestions.map((q, i) => `
    <div class="cb-q-item" id="cbq-${i}">
      <div class="cb-q-header">
        <div class="cb-q-num">Q${i + 1} <span class="cb-diff-tag cb-diff-${q.difficulty||'medium'}">${q.difficulty || 'medium'}</span></div>
        <div class="cb-q-actions">
          <button class="cb-btn cb-btn-ghost cb-btn-xs" onclick="editQuestion(${i})">✏️ Edit</button>
          <button class="cb-btn cb-btn-ghost cb-btn-xs" onclick="moveQuestion(${i},-1)" ${i===0?'disabled':''}>↑</button>
          <button class="cb-btn cb-btn-ghost cb-btn-xs" onclick="moveQuestion(${i},1)" ${i===builderQuestions.length-1?'disabled':''}>↓</button>
          <button class="cb-btn cb-btn-danger cb-btn-xs" onclick="deleteQuestion(${i})">🗑</button>
        </div>
      </div>
      <div class="cb-q-text">${q.q}</div>
      <div class="cb-q-opts">
        ${q.opts.map((o, oi) => `<span class="cb-q-opt ${oi===q.a?'cb-q-opt-correct':''}">${String.fromCharCode(65+oi)}. ${o}${oi===q.a?' ✓':''}</span>`).join('')}
      </div>
      ${q.explanation ? `<div class="cb-q-explanation">💡 ${q.explanation}</div>` : ''}
    </div>`).join('');
}

function refreshQuestionsList() {
  const list = document.getElementById('cb-questions-list');
  const countEl = document.getElementById('q-count');
  if (list) list.innerHTML = builderQuestions.length ? renderQuestionsList() : `
    <div class="cb-empty" style="padding:32px">
      <div style="font-size:32px;margin-bottom:8px">❓</div>
      <p>No questions yet. Add manually, import JSON, or use AI.</p>
    </div>`;
  if (countEl) countEl.textContent = builderQuestions.length;
}

// ── ICON / COLOR SELECT ──
function selectIcon(icon) {
  builderCourse.icon = icon;
  document.querySelectorAll('.cb-icon-btn').forEach(b => b.classList.toggle('active', b.textContent === icon));
}

function selectColor(index) {
  builderCourse.color = COURSE_COLORS[index].bg;
  builderCourse.colorAccent = COURSE_COLORS[index].accent;
  document.querySelectorAll('.cb-color-swatch').forEach((s, i) => s.classList.toggle('active', i === index));
}

// ── ADD / EDIT QUESTION MODAL ──
let editingQuestionIndex = -1;

function addNewQuestion() {
  editingQuestionIndex = -1;
  openQuestionModal({ q: '', opts: ['', '', '', ''], a: 0, difficulty: 'medium', explanation: '' });
}

function editQuestion(index) {
  editingQuestionIndex = index;
  openQuestionModal({ ...builderQuestions[index] });
}

function openQuestionModal(q) {
  const optInputs = q.opts.map((o, i) => `
    <div class="cb-opt-row">
      <label class="cb-opt-radio">
        <input type="radio" name="correct-opt" value="${i}" ${q.a === i ? 'checked' : ''}> Correct
      </label>
      <span class="cb-opt-letter">${String.fromCharCode(65 + i)}</span>
      <input type="text" class="cb-opt-input" id="cb-opt-${i}" placeholder="Option ${String.fromCharCode(65+i)}" value="${escapeHtml(o)}" maxlength="200">
    </div>`).join('');

  showBuilderModal(`
    <div class="cb-modal-title">${editingQuestionIndex === -1 ? 'Add Question' : 'Edit Question'}</div>
    <div class="cb-field">
      <label>Question Text *</label>
      <textarea class="cb-textarea" id="cb-q-text" placeholder="Type your question here..." rows="3" maxlength="500">${escapeHtml(q.q)}</textarea>
    </div>
    <div class="cb-field">
      <label>Answer Options * <span style="font-size:11px;color:var(--t3)">(select the correct one)</span></label>
      <div id="cb-opts-wrap">${optInputs}</div>
    </div>
    <div class="cb-form-row">
      <div class="cb-field" style="flex:1">
        <label>Difficulty</label>
        <select id="cb-q-diff" class="cb-select">
          <option value="easy" ${q.difficulty==='easy'?'selected':''}>Easy</option>
          <option value="medium" ${q.difficulty==='medium'||!q.difficulty?'selected':''}>Medium</option>
          <option value="hard" ${q.difficulty==='hard'?'selected':''}>Hard</option>
        </select>
      </div>
    </div>
    <div class="cb-field">
      <label>Explanation <span style="font-size:11px;color:var(--t3)">(shown after answer is selected)</span></label>
      <textarea class="cb-textarea" id="cb-q-explanation" placeholder="Why is this the correct answer?" rows="2" maxlength="400">${escapeHtml(q.explanation || '')}</textarea>
    </div>
    <div class="cb-modal-btns">
      <button class="cb-btn cb-btn-secondary" onclick="closeBuilderModal()">Cancel</button>
      <button class="cb-btn cb-btn-primary" onclick="saveQuestion()">
        ${editingQuestionIndex === -1 ? 'Add Question' : 'Save Changes'}
      </button>
    </div>`);
}

function saveQuestion() {
  const qText = document.getElementById('cb-q-text').value.trim();
  const opts = [0,1,2,3].map(i => document.getElementById(`cb-opt-${i}`).value.trim());
  const correctRadio = document.querySelector('input[name="correct-opt"]:checked');
  const difficulty = document.getElementById('cb-q-diff').value;
  const explanation = document.getElementById('cb-q-explanation').value.trim();

  if (!qText) return showToast('Please enter a question', 'warning');
  if (opts.filter(o => o).length < 2) return showToast('Please enter at least 2 answer options', 'warning');
  if (!correctRadio) return showToast('Please select the correct answer', 'warning');

  // Fill empty options with placeholder so array stays length 4
  const finalOpts = opts.map((o, i) => o || `Option ${String.fromCharCode(65 + i)}`);
  const correctIndex = parseInt(correctRadio.value);

  const question = { q: qText, opts: finalOpts, a: correctIndex, difficulty, explanation };

  if (editingQuestionIndex === -1) {
    builderQuestions.push(question);
    showToast(`Question ${builderQuestions.length} added ✓`, 'success');
  } else {
    builderQuestions[editingQuestionIndex] = question;
    showToast('Question updated ✓', 'success');
  }

  closeBuilderModal();
  refreshQuestionsList();
}

function deleteQuestion(index) {
  builderQuestions.splice(index, 1);
  refreshQuestionsList();
  showToast('Question deleted', 'info');
}

function moveQuestion(index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= builderQuestions.length) return;
  [builderQuestions[index], builderQuestions[newIndex]] = [builderQuestions[newIndex], builderQuestions[index]];
  refreshQuestionsList();
}

// ── SAVE COURSE ──
function saveCourse() {
  const name = document.getElementById('cb-name')?.value.trim();
  const idRaw = document.getElementById('cb-id')?.value.trim();
  const desc = document.getElementById('cb-desc')?.value.trim();
  const isEdit = !!(builderCourse.id);
  const id = isEdit ? builderCourse.id : idRaw;

  if (!name) return showToast('Please enter a course name', 'warning');
  if (!id) return showToast('Please enter a course ID (e.g. CSC 201)', 'warning');
  if (builderQuestions.length < 1) return showToast('Please add at least 1 question', 'warning');

  const courses = getCustomCourses();

  // Check for ID collision on new courses
  if (!isEdit && (courses[id] || QUIZ_DATA[id])) {
    return showToast(`Course ID "${id}" already exists. Choose a different ID.`, 'error');
  }

  const newCourse = {
    name,
    description: desc || 'Custom course',
    icon: builderCourse.icon || '📚',
    color: builderCourse.color || COURSE_COLORS[0].bg,
    colorAccent: builderCourse.colorAccent || COURSE_COLORS[0].accent,
    questions: builderQuestions,
    isCustom: true,
    createdAt: isEdit ? (courses[id]?.createdAt || new Date().toISOString()) : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  courses[id] = newCourse;
  saveCustomCourses(courses);
  addNotif(`Course "${name}" ${isEdit ? 'updated' : 'created'} with ${builderQuestions.length} questions ✓`, 'success');
  showToast(`"${name}" ${isEdit ? 'saved' : 'created'} successfully!`, 'success');
  renderCourseBuilder();
}

// ── DELETE COURSE ──
function deleteCourse(id) {
  const courses = getCustomCourses();
  const name = courses[id]?.name || id;
  showConfirm('Delete Course', `Permanently delete "${name}" and all its questions?`, '🗑️', () => {
    delete courses[id];
    saveCustomCourses(courses);
    showToast(`"${name}" deleted`, 'info');
    renderCourseBuilder();
  });
}

// ── PREVIEW ──
function previewCourse(id) {
  const all = getAllCourses();
  const course = all[id];
  if (!course) return;
  startQuiz(id, 'all', false, course.questions.slice(0, 5));
  showToast('Previewing first 5 questions', 'info');
}

function previewBuilderCourse() {
  if (!builderQuestions.length) return showToast('Add at least 1 question to preview', 'warning');
  const name = document.getElementById('cb-name')?.value.trim() || 'Preview';
  currentQuiz = {
    category: `Preview: ${name}`,
    difficulty: 'all',
    isDailyChallenge: false,
    questions: builderQuestions.slice(0, 5),
    currentIndex: 0,
    answers: [],
    startTime: Date.now(),
    timeElapsed: 0,
    isPreview: true
  };
  startTimer();
  renderQuiz();
  showToast('Previewing first 5 questions — progress not saved', 'info');
}

// ── EXPORT ──
function exportCourse(id) {
  const all = getAllCourses();
  const course = all[id];
  if (!course) return;
  const exportData = {
    _info: 'Quiz Academy Course Export — import this file via Course Builder > Import JSON',
    _format_version: '1.0',
    id,
    name: course.name || id,
    description: course.description || '',
    icon: course.icon || '📚',
    color: course.color || '',
    colorAccent: course.colorAccent || '',
    questions: course.questions.map(q => ({
      q: q.q,
      opts: q.opts,
      a: q.a,
      difficulty: q.difficulty || 'medium',
      explanation: q.explanation || ''
    }))
  };
  downloadJSON(exportData, `${id.replace(/\s+/g, '_')}_course.json`);
  showToast(`"${id}" exported as JSON ✓`, 'success');
}

// ── IMPORT COURSE JSON ──
function openImportCourseModal() {
  showBuilderModal(`
    <div class="cb-modal-title">Import Course from JSON</div>
    <p style="font-size:13px;color:var(--t2);margin-bottom:16px;line-height:1.6">
      Import a course JSON file (exported from Quiz Academy or matching the template format).
      Existing courses with the same ID will be overwritten.
    </p>
    <div class="cb-upload-zone" id="cb-import-zone" onclick="document.getElementById('cb-import-file').click()">
      <input type="file" id="cb-import-file" accept=".json" style="display:none" onchange="handleImportCourseFile(event)">
      <div style="font-size:32px;margin-bottom:8px">📂</div>
      <div style="font-size:13px;color:var(--t2)">Click to select JSON file</div>
      <div style="font-size:11px;color:var(--t3);margin-top:4px">or drag and drop here</div>
    </div>
    <div id="cb-import-preview" style="margin-top:12px"></div>
    <div class="cb-modal-btns">
      <button class="cb-btn cb-btn-secondary" onclick="closeBuilderModal()">Cancel</button>
      <button class="cb-btn cb-btn-primary" id="cb-import-confirm-btn" onclick="confirmImportCourse()" disabled>Import Course</button>
    </div>`);

  // drag-drop
  const zone = document.getElementById('cb-import-zone');
  if (zone) {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', e => {
      e.preventDefault(); zone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) processImportFile(file);
    });
  }
}

let pendingImportData = null;

function handleImportCourseFile(e) {
  const file = e.target.files[0];
  if (file) processImportFile(file);
}

function processImportFile(file) {
  if (!file.name.endsWith('.json')) return showToast('Please select a .json file', 'error');
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      const validation = validateCourseJSON(data);
      if (!validation.valid) {
        document.getElementById('cb-import-preview').innerHTML = `
          <div class="cb-import-error">❌ Invalid file: ${validation.error}</div>`;
        return;
      }
      pendingImportData = data;
      document.getElementById('cb-import-preview').innerHTML = `
        <div class="cb-import-success">
          <div class="cb-import-success-icon">${data.icon || '📚'}</div>
          <div>
            <div style="font-weight:500;color:var(--t1)">${data.name || data.id}</div>
            <div style="font-size:12px;color:var(--t3)">${data.questions.length} questions · ID: ${data.id}</div>
            ${data.description ? `<div style="font-size:12px;color:var(--t2);margin-top:2px">${data.description}</div>` : ''}
          </div>
        </div>`;
      document.getElementById('cb-import-confirm-btn').disabled = false;
    } catch {
      document.getElementById('cb-import-preview').innerHTML = `
        <div class="cb-import-error">❌ Could not parse JSON file. Make sure it's valid JSON.</div>`;
    }
  };
  reader.readAsText(file);
}

function validateCourseJSON(data) {
  if (!data || typeof data !== 'object') return { valid: false, error: 'Not a valid JSON object' };
  if (!data.id || typeof data.id !== 'string') return { valid: false, error: 'Missing "id" field' };
  if (!Array.isArray(data.questions) || data.questions.length === 0) return { valid: false, error: 'Missing or empty "questions" array' };
  for (let i = 0; i < data.questions.length; i++) {
    const q = data.questions[i];
    if (!q.q) return { valid: false, error: `Question ${i+1} is missing "q" (question text)` };
    if (!Array.isArray(q.opts) || q.opts.length < 2) return { valid: false, error: `Question ${i+1} needs at least 2 options in "opts"` };
    if (typeof q.a !== 'number' || q.a < 0 || q.a >= q.opts.length) return { valid: false, error: `Question ${i+1} has invalid "a" (correct answer index)` };
  }
  return { valid: true };
}

function confirmImportCourse() {
  if (!pendingImportData) return;
  const courses = getCustomCourses();
  const data = pendingImportData;
  courses[data.id] = {
    name: data.name || data.id,
    description: data.description || 'Imported course',
    icon: data.icon || '📚',
    color: data.color || COURSE_COLORS[0].bg,
    colorAccent: data.colorAccent || COURSE_COLORS[0].accent,
    questions: data.questions.map(q => ({
      q: q.q,
      opts: q.opts,
      a: q.a,
      difficulty: q.difficulty || 'medium',
      explanation: q.explanation || ''
    })),
    isCustom: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  saveCustomCourses(courses);
  pendingImportData = null;
  closeBuilderModal();
  addNotif(`Course "${data.name || data.id}" imported with ${data.questions.length} questions ✓`, 'success');
  showToast(`"${data.name || data.id}" imported successfully!`, 'success');
  renderCourseBuilder();
}

// ── IMPORT QUESTIONS INTO BUILDER ──
function openImportQuestionsModal() {
  showBuilderModal(`
    <div class="cb-modal-title">Import Questions from JSON</div>
    <p style="font-size:13px;color:var(--t2);margin-bottom:16px;line-height:1.6">
      Import questions into this course from a JSON array. These will be added to your existing questions.
    </p>
    <div class="cb-upload-zone" onclick="document.getElementById('cb-q-import-file').click()">
      <input type="file" id="cb-q-import-file" accept=".json" style="display:none" onchange="handleImportQuestionsFile(event)">
      <div style="font-size:28px;margin-bottom:6px">📋</div>
      <div style="font-size:13px;color:var(--t2)">Select a JSON file with questions array</div>
    </div>
    <div id="cb-q-import-preview" style="margin-top:12px"></div>
    <div class="cb-modal-btns">
      <button class="cb-btn cb-btn-secondary" onclick="closeBuilderModal()">Cancel</button>
      <button class="cb-btn cb-btn-primary" id="cb-q-import-btn" onclick="confirmImportQuestions()" disabled>Add Questions</button>
    </div>`);
}

let pendingImportQuestions = null;

function handleImportQuestionsFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      let data = JSON.parse(ev.target.result);
      // Support both full course JSON and bare questions array
      if (data.questions && Array.isArray(data.questions)) data = data.questions;
      if (!Array.isArray(data)) throw new Error('Expected a JSON array of questions');
      const valid = data.filter(q => q.q && Array.isArray(q.opts) && typeof q.a === 'number');
      if (!valid.length) throw new Error('No valid questions found in file');
      pendingImportQuestions = valid;
      document.getElementById('cb-q-import-preview').innerHTML = `
        <div class="cb-import-success">
          <div style="font-size:20px">✅</div>
          <div style="font-size:13px;color:var(--t1)">${valid.length} questions ready to import</div>
        </div>`;
      document.getElementById('cb-q-import-btn').disabled = false;
    } catch (err) {
      document.getElementById('cb-q-import-preview').innerHTML = `
        <div class="cb-import-error">❌ ${err.message}</div>`;
    }
  };
  reader.readAsText(file);
}

function confirmImportQuestions() {
  if (!pendingImportQuestions) return;
  builderQuestions.push(...pendingImportQuestions);
  pendingImportQuestions = null;
  closeBuilderModal();
  refreshQuestionsList();
  showToast(`${pendingImportQuestions?.length || 'Questions'} added ✓`, 'success');
}

// ── AI GENERATE FOR COURSE ──
function openAIGenerateForCourse() {
  const savedKey = localStorage.getItem('qa_api_key') || '';
  const courseName = document.getElementById('cb-name')?.value.trim() || '';
  showBuilderModal(`
    <div class="cb-modal-title">🤖 AI Generate Questions</div>
    <p style="font-size:13px;color:var(--t2);margin-bottom:16px;line-height:1.6">
      Use Claude AI to generate questions for this course. Questions will be added to your list.
    </p>
    <div class="cb-field">
      <label>Anthropic API Key</label>
      <input type="password" id="cb-ai-key" placeholder="sk-ant-api03-..." value="${savedKey}">
      <div style="font-size:11px;color:var(--t3);margin-top:3px">Get your key at console.anthropic.com</div>
    </div>
    <div class="cb-field">
      <label>Topic / Subject</label>
      <input type="text" id="cb-ai-topic" placeholder="What should the questions be about?" value="${courseName}">
    </div>
    <div class="cb-form-row">
      <div class="cb-field" style="flex:1">
        <label>Difficulty</label>
        <select id="cb-ai-diff" class="cb-select">
          <option value="easy">Easy</option>
          <option value="medium" selected>Medium</option>
          <option value="hard">Hard</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>
      <div class="cb-field" style="flex:1">
        <label>How many?</label>
        <select id="cb-ai-count" class="cb-select">
          <option value="5">5 questions</option>
          <option value="10" selected>10 questions</option>
          <option value="15">15 questions</option>
        </select>
      </div>
    </div>
    <div id="cb-ai-gen-status"></div>
    <div class="cb-modal-btns">
      <button class="cb-btn cb-btn-secondary" onclick="closeBuilderModal()">Cancel</button>
      <button class="cb-btn cb-btn-primary" id="cb-ai-gen-btn" onclick="runAIGenerateForCourse()">✨ Generate</button>
    </div>`);
}

async function runAIGenerateForCourse() {
  const apiKey = document.getElementById('cb-ai-key').value.trim();
  const topic = document.getElementById('cb-ai-topic').value.trim();
  const difficulty = document.getElementById('cb-ai-diff').value;
  const count = parseInt(document.getElementById('cb-ai-count').value);
  const saveKey = apiKey.startsWith('sk-ant-');

  if (!apiKey || !apiKey.startsWith('sk-ant-')) return showToast('Please enter a valid Anthropic API key', 'warning');
  if (!topic) return showToast('Please enter a topic', 'warning');
  if (saveKey) localStorage.setItem('qa_api_key', apiKey);

  const statusEl = document.getElementById('cb-ai-gen-status');
  const genBtn = document.getElementById('cb-ai-gen-btn');
  statusEl.innerHTML = `<div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--bg2);border-radius:8px;margin-bottom:8px"><div class="ai-spinner" style="width:20px;height:20px;border-width:2px"></div><span style="font-size:13px;color:var(--t2)">Generating ${count} questions...</span></div>`;
  genBtn.disabled = true;

  const diffInstruction = difficulty === 'mixed' ? 'Mix easy, medium, and hard.' : `All ${difficulty} difficulty.`;
  const prompt = `Generate exactly ${count} multiple choice quiz questions about: "${topic}". ${diffInstruction}

Return ONLY a valid JSON array, no markdown, no extra text:
[{"q":"Question?","opts":["A","B","C","D"],"a":0,"explanation":"Why A is correct.","difficulty":"medium"}]

Rules: "a" is zero-based correct answer index. Exactly 4 options each. difficulty must be easy/medium/hard.`;

  try {
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
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (res.status === 401) throw new Error('Invalid API key');
      if (res.status === 429) throw new Error('Rate limit — please wait and try again');
      throw new Error(err.error?.message || `API error ${res.status}`);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Could not parse response');
    const questions = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(questions) || !questions.length) throw new Error('No questions returned');

    const valid = questions.filter(q => q.q && Array.isArray(q.opts) && typeof q.a === 'number');
    builderQuestions.push(...valid);
    closeBuilderModal();
    refreshQuestionsList();
    showToast(`${valid.length} AI questions added ✓`, 'success');

  } catch (err) {
    statusEl.innerHTML = `<div style="padding:10px;background:var(--red-dim);border:1px solid rgba(255,107,138,.2);border-radius:8px;font-size:13px;color:var(--red)">❌ ${err.message}</div>`;
    genBtn.disabled = false;
  }
}

// ── JSON TEMPLATE DOWNLOAD ──
function downloadJSONTemplate() {
  const template = {
    _info: 'Quiz Academy Course Template — fill in and import via Course Builder',
    _format_version: '1.0',
    id: 'COURSE_ID',
    name: 'Course Name',
    description: 'Brief description of this course',
    icon: '📚',
    color: 'rgba(108,142,255,.12)',
    colorAccent: '#6C8EFF',
    questions: [
      {
        q: 'What is the capital of Nigeria?',
        opts: ['Lagos', 'Abuja', 'Kano', 'Ibadan'],
        a: 1,
        difficulty: 'easy',
        explanation: 'Abuja became the capital of Nigeria in 1991, replacing Lagos as the political capital.'
      },
      {
        q: 'Another question here?',
        opts: ['Option A', 'Option B', 'Option C', 'Option D'],
        a: 0,
        difficulty: 'medium',
        explanation: 'Explanation of why Option A is correct.'
      }
    ]
  };
  downloadJSON(template, 'quiz_academy_course_template.json');
  showToast('Template downloaded ✓', 'success');
}

// ── UTILS ──
function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ── BUILDER MODAL ──
function showBuilderModal(html) {
  let modal = document.getElementById('builder-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'builder-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `<div class="modal-box cb-modal-box" id="builder-modal-box"></div>`;
    modal.addEventListener('click', e => { if (e.target === modal) closeBuilderModal(); });
    document.body.appendChild(modal);
  }
  document.getElementById('builder-modal-box').innerHTML = html;
  modal.classList.add('open');
}

function closeBuilderModal() {
  document.getElementById('builder-modal')?.classList.remove('open');
}

// ── PATCH NAVIGATE + CATEGORIES to include custom courses ──
// Override renderCategories so custom courses show up in the normal categories page
const _origRenderCategories = window.renderCategories;
window.renderCategories = function() {
  const all = getAllCourses();
  const cards = Object.entries(all).map(([name, data]) => {
    const mastery = getCategoryMastery(name);
    const masteryBar = mastery > 0 ? `
      <div class="cat-mastery-wrap">
        <div class="cat-mastery-bar"><div class="cat-mastery-fill" style="width:${mastery}%"></div></div>
        <div class="cat-mastery-label">Mastery: ${mastery}%</div>
      </div>` : '';
    const customBadge = data.isCustom ? `<span style="font-size:10px;color:var(--green);background:var(--green-dim);border:1px solid rgba(77,255,195,.2);padding:2px 6px;border-radius:8px;margin-left:6px">Custom</span>` : '';
    return `
      <div class="category-card">
        <div class="cat-icon-box" style="background:${data.color}">${data.icon}</div>
        <div class="cat-name">${data.name || name}${customBadge}</div>
        <div class="cat-meta">${data.questions.length} questions · ${data.description || ''}</div>
        ${masteryBar}
        <div class="diff-tabs">
          <button class="diff-tab active" onclick="startQuiz('${name}','all')">All</button>
          <button class="diff-tab" onclick="startQuiz('${name}','easy')">Easy</button>
          <button class="diff-tab" onclick="startQuiz('${name}','medium')">Medium</button>
          <button class="diff-tab" onclick="startQuiz('${name}','hard')">Hard</button>
        </div>
      </div>`;
  }).join('');
  document.getElementById('page-wrap').innerHTML = `
    <div class="page-header">
      <h1>📚 Categories</h1>
      <p>Choose a category and difficulty to start · <button class="link-btn" onclick="navigate('builder')">+ Add Course</button></p>
    </div>
    <div class="categories-grid anim-fade-up">${cards}</div>`;
};

// Also patch startQuiz to check custom courses
const _origStartQuiz = window.startQuiz;
window.startQuiz = function(category, difficulty, isDailyChallenge, providedQuestions) {
  if (providedQuestions) return _origStartQuiz(category, difficulty, isDailyChallenge, providedQuestions);
  const all = getAllCourses();
  if (all[category]) {
    const questions = all[category].questions;
    return _origStartQuiz.call(this, category, difficulty, isDailyChallenge, questions);
  }
  return _origStartQuiz.call(this, category, difficulty, isDailyChallenge, providedQuestions);
};
