/* ================================================================
   QUIZ ACADEMY — API CLIENT v4.1
   Centralised fetch wrapper. JWT + session auth.
   Includes Google OAuth endpoint.
   ================================================================ */

const API_BASE = '/api';

function getToken()   { return localStorage.getItem('qa_token'); }
function setToken(t)  { localStorage.setItem('qa_token', t); }
function clearToken() { localStorage.removeItem('qa_token'); }

async function apiFetch(path, options = {}) {
  const token   = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  const res  = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err    = new Error(data.error || `Request failed (${res.status})`);
    err.status   = res.status;
    throw err;
  }
  return data;
}

// ── AUTH API ──
const Auth = {
  async signup(name, email, password) {
    const data = await apiFetch('/auth/signup', { method:'POST', body:JSON.stringify({ name, email, password }) });
    if (data.token) setToken(data.token);
    return data;
  },
  async login(email, password, rememberMe = false) {
    const data = await apiFetch('/auth/login', { method:'POST', body:JSON.stringify({ email, password, rememberMe }) });
    if (data.token) setToken(data.token);
    return data;
  },
  async googleLogin(credential) {
    const data = await apiFetch('/auth/google', { method:'POST', body:JSON.stringify({ credential }) });
    if (data.token) setToken(data.token);
    return data;
  },
  async logout() {
    await apiFetch('/auth/logout', { method:'POST' }).catch(() => {});
    clearToken();
  },
  async me()                { return apiFetch('/auth/me'); },
  async updateProfile(data) { return apiFetch('/auth/me', { method:'PUT', body:JSON.stringify(data) }); },
  async sync(userData) {
    return apiFetch('/auth/sync', { method:'POST', body:JSON.stringify(userData) })
      .catch(err => console.warn('Sync failed:', err.message));
  },
  async getLeaderboard()  { return apiFetch('/auth/leaderboard'); },
  async forgotPassword(email) {
    return apiFetch('/auth/forgot-password', { method:'POST', body:JSON.stringify({ email }) });
  },
  async resetPassword(token, password) {
    return apiFetch('/auth/reset-password', { method:'POST', body:JSON.stringify({ token, password }) });
  }
};

// ── AI API ──
const AI = {
  async generateQuestions(topic, difficulty = 'medium', count = 10) {
    return apiFetch('/ai/generate', { method:'POST', body:JSON.stringify({ topic, difficulty, count }) });
  }
};

// ── HISTORY API ──
const History = {
  async getPage(page = 1, limit = 10) {
    return apiFetch(`/history?page=${page}&limit=${limit}`);
  },
  async getEntry(index) {
    return apiFetch(`/history/${index}`);
  },
  async deleteEntry(index) {
    return apiFetch(`/history/${index}`, { method: 'DELETE' });
  },
  async clearAll() {
    return apiFetch('/history', { method: 'DELETE' });
  }
};

// ── CHECK SERVER AUTH ──
async function checkServerAuth() {
  try {
    const data = await Auth.me();
    return data.user || null;
  } catch(err) {
    if (err.status === 401) return null;
    throw err;
  }
}
