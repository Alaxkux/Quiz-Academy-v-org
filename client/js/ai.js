/* ================================================================
   QUIZ ACADEMY — AI PAGE v4
   Calls /api/ai/generate — powered by Google Gemini (free tier).
   API key lives on server, never exposed to browser.
   ================================================================ */

let generatedQuestions = null;

function renderAIPage() {
  document.getElementById('page-wrap').innerHTML = `
    <div class="ai-shell anim-fade-up">
      <div class="page-header">
        <h1>🤖 AI Question Generator</h1>
        <p>Generate custom quiz questions powered by Google Gemini — free, no API key needed</p>
      </div>

      <div class="ai-card">
        <h3>Generate Questions</h3>
        <p>Type any topic and AI will create accurate multiple-choice questions with explanations. Powered by Gemini 1.5 Flash on the server.</p>
        <div class="field">
          <label>Topic / Subject</label>
          <input type="text" id="ai-topic" placeholder="e.g. Nigerian history, Python programming, Photosynthesis..."
            onkeypress="if(event.key==='Enter')generateAIQuestions()">
        </div>
        <div class="ai-options-row">
          <div class="ai-option-group">
            <label>Difficulty</label>
            <select id="ai-difficulty">
              <option value="easy">Easy</option>
              <option value="medium" selected>Medium</option>
              <option value="hard">Hard</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          <div class="ai-option-group">
            <label>Number of Questions</label>
            <select id="ai-count">
              <option value="5">5 questions</option>
              <option value="10" selected>10 questions</option>
              <option value="15">15 questions</option>
              <option value="20">20 questions</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary" onclick="generateAIQuestions()" id="ai-gen-btn">✨ Generate Questions</button>
      </div>

      <div id="ai-result-area"></div>
    </div>`;
}

async function generateAIQuestions() {
  const topic      = document.getElementById('ai-topic').value.trim();
  const difficulty = document.getElementById('ai-difficulty').value;
  const count      = parseInt(document.getElementById('ai-count').value);

  if (!topic) return showToast('Please enter a topic', 'warning');

  const resultArea = document.getElementById('ai-result-area');
  const genBtn     = document.getElementById('ai-gen-btn');
  genBtn.disabled  = true;

  resultArea.innerHTML = `
    <div class="ai-card">
      <div class="ai-generating">
        <div class="ai-spinner"></div>
        <div class="ai-gen-text">Generating ${count} ${difficulty} questions about "${topic}"...</div>
        <div style="font-size:11px;color:var(--t3);margin-top:4px">Powered by Google Gemini</div>
      </div>
    </div>`;

  try {
    const data = await AI.generateQuestions(topic, difficulty, count);
    generatedQuestions = data.questions;
    showAIPreview(topic, data.questions);
  } catch(err) {
    resultArea.innerHTML = `
      <div class="ai-card" style="text-align:center;padding:28px">
        <div style="font-size:36px;margin-bottom:12px">⚠️</div>
        <h3 style="color:var(--red);margin-bottom:8px">Generation Failed</h3>
        <p style="color:var(--t2);margin-bottom:16px">${err.message}</p>
        <button class="btn btn-secondary" onclick="renderAIPage()">Try Again</button>
      </div>`;
  } finally {
    if (genBtn) genBtn.disabled = false;
  }
}

function showAIPreview(topic, questions) {
  const previews = questions.slice(0, 3).map((q, i) =>
    `<div class="ai-preview-q">
      <div class="ai-preview-q-num">Q${i+1} · ${q.difficulty}</div>
      <div class="ai-preview-q-text">${q.q}</div>
    </div>`
  ).join('');

  const safeTitle = topic.replace(/'/g, "\\'");

  document.getElementById('ai-result-area').innerHTML = `
    <div class="ai-card">
      <h3>✅ ${questions.length} Questions Generated</h3>
      <p>Topic: <strong>${topic}</strong></p>
      <div style="margin:12px 0">
        ${previews}
        ${questions.length > 3 ? `<p style="font-size:11px;color:var(--t3);margin-top:5px">+${questions.length - 3} more questions...</p>` : ''}
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="playAIQuestions('${safeTitle}')">▶ Play These Questions</button>
        <button class="btn btn-secondary" onclick="renderAIPage()">Generate New Set</button>
        <button class="btn btn-ghost" onclick="saveAIQuestionsAsCourse('${safeTitle}')">💾 Save as Course</button>
      </div>
    </div>`;
}

function playAIQuestions(topic) {
  if (!generatedQuestions?.length) return showToast('No AI questions to play','error');
  showQuizConfig({
    category:  'AI: ' + topic,
    questions: generatedQuestions,
    title:     'AI Quiz — ' + topic
  });
  generatedQuestions = null;
}

function saveAIQuestionsAsCourse(topic) {
  if (!generatedQuestions?.length) return;
  const id      = 'AI_' + topic.replace(/\s+/g,'_').slice(0,20) + '_' + Date.now().toString(36);
  const courses = JSON.parse(localStorage.getItem('qa_custom_courses') || '{}');
  courses[id]   = {
    name:        'AI: ' + topic,
    description: 'AI-generated questions about ' + topic,
    icon:        '🤖',
    color:       'rgba(108,142,255,.12)',
    colorAccent: '#6C8EFF',
    questions:   generatedQuestions,
    isCustom:    true,
    createdAt:   new Date().toISOString()
  };
  localStorage.setItem('qa_custom_courses', JSON.stringify(courses));
  showToast('Saved as course "AI: ' + topic + '" ✓', 'success');
  addNotif('AI course "' + topic + '" saved to your courses', 'success');
  generatedQuestions = null;
}
