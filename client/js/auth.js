/* ================================================================
   QUIZ ACADEMY — AUTH v4.1
   Login, signup, logout, forgot/reset password, Google OAuth.
   ================================================================ */

// ── PANEL SWITCHING ──
function showPanel(name) {
  document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
}

function clearErr(id)     { const e = document.getElementById(id); if(e){ e.textContent=''; e.classList.remove('show'); } }
function showErr(id, msg) { const e = document.getElementById(id); if(e){ e.textContent=msg; e.classList.add('show'); } }
function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

function setLoading(btnId, spinId, on) {
  const btn  = document.getElementById(btnId);
  const spin = document.getElementById(spinId);
  if (!btn || !spin) return;
  const span = btn.querySelector('span');
  if (span) span.style.display = on ? 'none' : '';
  spin.style.display = on ? 'block' : 'none';
  btn.disabled = on;
}

function togglePw(inputId, btn) {
  const inp = document.getElementById(inputId);
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁' : '👁️‍🗨️';
}

function checkPwStrength(pw) {
  const el = document.getElementById('pw-strength'); if (!el) return;
  let s = 0;
  if (pw.length >= 8)                         s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw))                       s++;
  if (/[^a-zA-Z0-9]/.test(pw))               s++;
  const labels = ['','Weak','Fair','Good','Strong'];
  const colors = ['','var(--red)','var(--gold)','var(--green)','var(--green)'];
  el.textContent = labels[s] || '';
  el.style.color = colors[s] || '';
}

// ── LOGIN ──
async function handleLogin() {
  ['err-login-email','err-login-pw'].forEach(clearErr);
  const email    = document.getElementById('login-email').value.trim();
  const pw       = document.getElementById('login-password').value;
  const remember = document.getElementById('remember-me').checked;

  if (!validateEmail(email)) return showErr('err-login-email','Please enter a valid email address');
  if (pw.length < 8)         return showErr('err-login-pw','Password must be at least 8 characters');

  setLoading('btn-login','spin-login',true);
  try {
    const { user } = await Auth.login(email, pw, remember);
    currentUser   = user;
    notifications = user.notifications || [];
    setLoading('btn-login','spin-login',false);
    launchApp();
  } catch(err) {
    setLoading('btn-login','spin-login',false);
    showErr('err-login-pw', err.message || 'Login failed');
  }
}

// ── SIGNUP ──
async function handleSignup() {
  ['err-su-name','err-su-email','err-su-pw','err-su-confirm'].forEach(clearErr);
  const name    = document.getElementById('su-name').value.trim();
  const email   = document.getElementById('su-email').value.trim();
  const pw      = document.getElementById('su-password').value;
  const confirm = document.getElementById('su-confirm').value;

  if (name.length < 2)       return showErr('err-su-name','Name must be at least 2 characters');
  if (!validateEmail(email)) return showErr('err-su-email','Please enter a valid email address');
  if (pw.length < 8)         return showErr('err-su-pw','Password must be at least 8 characters');
  if (pw !== confirm)        return showErr('err-su-confirm','Passwords do not match');

  setLoading('btn-signup','spin-signup',true);
  try {
    const { user } = await Auth.signup(name, email, pw);
    currentUser   = user;
    notifications = [];
    setLoading('btn-signup','spin-signup',false);
    launchApp();
    addNotif('Account created! Welcome to Quiz Academy 🎉','success');
  } catch(err) {
    setLoading('btn-signup','spin-signup',false);
    if (err.message?.toLowerCase().includes('email')) showErr('err-su-email', err.message);
    else showErr('err-su-pw', err.message || 'Signup failed');
  }
}

// ── GOOGLE OAUTH CALLBACK ──
// Called by Google Identity Services after user picks an account
async function handleGoogleCredential(response) {
  const btn = document.getElementById('google-signin-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Signing in...'; }

  try {
    const { user } = await Auth.googleLogin(response.credential);
    currentUser   = user;
    notifications = user.notifications || [];
    launchApp();
    if (user.isNewUser !== false) {
      addNotif('Welcome to Quiz Academy! 🎉','success');
    }
  } catch(err) {
    showToast(err.message || 'Google sign-in failed','error');
    if (btn) { btn.disabled = false; btn.textContent = 'Continue with Google'; }
  }
}

// ── FORGOT PASSWORD ──
async function handleForgot() {
  clearErr('err-forgot-email');
  const email = document.getElementById('forgot-email').value.trim();
  if (!validateEmail(email)) return showErr('err-forgot-email','Please enter a valid email address');

  setLoading('btn-forgot','spin-forgot',true);
  try {
    await apiFetch('/auth/forgot-password', { method:'POST', body:JSON.stringify({ email }) });
    setLoading('btn-forgot','spin-forgot',false);
    showConfirm(
      'Email Sent ✓',
      "If this email is registered, a reset link has been sent. Check your spam folder if you don't see it within a minute.",
      '📧', null, true
    );
    showPanel('login');
  } catch(err) {
    setLoading('btn-forgot','spin-forgot',false);
    showErr('err-forgot-email', err.message || 'Failed to send reset email');
  }
}

// ── LOGOUT ──
async function handleLogout() {
  showConfirm('Sign Out','Are you sure you want to sign out?','🚪', async () => {
    await Auth.logout();
    currentUser = null; notifications = [];
    window.location.reload();
  });
}

// ── CHECK AUTH (on load) ──
async function checkAuth() {
  try {
    const user = await checkServerAuth();
    if (user) {
      currentUser   = user;
      notifications = user.notifications || [];
      launchApp();
    } else {
      showAuthPage();
    }
  } catch(err) {
    showAuthPage();
  }
}

function showAuthPage() {
  const el = document.getElementById('auth');
  el.classList.add('show');
  requestAnimationFrame(() => setTimeout(() => el.classList.add('visible'), 50));

  // Initialise Google Sign In button if client ID is available
  if (window.google && window.__GOOGLE_CLIENT_ID__) {
    google.accounts.id.initialize({
      client_id:         window.__GOOGLE_CLIENT_ID__,
      callback:          handleGoogleCredential,
      auto_select:       false,
      cancel_on_tap_outside: true
    });
    google.accounts.id.renderButton(
      document.getElementById('google-btn-container'),
      {
        theme:  'filled_black',
        size:   'large',
        width:  '100%',
        text:   'continue_with',
        shape:  'rectangular',
        logo_alignment: 'left'
      }
    );
  }
}

// ── LAUNCH APP ──
function launchApp() {
  document.getElementById('auth').style.display = 'none';
  document.getElementById('app').classList.add('show');

  const theme = currentUser.settings?.theme || localStorage.getItem('qa_theme') || 'midnight';
  applyTheme(theme);
  updateUserDisplay();

  if (currentUser.isNewUser) {
    currentUser.isNewUser = false;
    updateUser();
    showOnboarding();
  } else {
    navigate('home');
    addNotif('Welcome back, ' + currentUser.name + '! 👋','login');
  }
}

// ── SYNC USER ──
async function updateUser() {
  if (!currentUser) return;

  const users = JSON.parse(localStorage.getItem('users') || '{}');
  users[currentUser.email] = currentUser;
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify(currentUser));

  updateUserDisplay();

  Auth.sync({
    stats:              currentUser.stats,
    history:            currentUser.history,
    achievements:       currentUser.achievements,
    notifications:      (currentUser.notifications || []).slice(0, 50),
    settings:           currentUser.settings,
    lastDailyChallenge: currentUser.lastDailyChallenge,
    bio:                currentUser.bio,
    avatar:             currentUser.avatar,
    name:               currentUser.name,
    isNewUser:          currentUser.isNewUser
  }).catch(err => console.warn('Sync failed:', err.message));
}
