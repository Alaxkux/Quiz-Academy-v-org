/* ================================================================
   QUIZ ACADEMY — APP INIT v4
   Global state, loading screen, splash, auth check.
   Theme applied immediately to prevent flash on load.
   ================================================================ */

let currentUser   = null;
let notifications = [];

// ── Apply theme IMMEDIATELY (before anything renders) ──
// This prevents the flash of wrong theme on load
(function applyThemeEarly() {
  const saved = localStorage.getItem('qa_theme') || 'midnight';
  document.body.setAttribute('data-theme', saved);
})();

window.addEventListener('DOMContentLoaded', () => {
  // Wire up all event listeners
  setupDropdownClose();
  setupSidebarNav();
  setupDragDrop();
  setupModalClose();
  setupSearchEnter();

  // Hide loading screen after 1.8s then show splash
  setTimeout(() => {
    const loading = document.getElementById('loading');
    loading.style.opacity = '0';
    setTimeout(() => {
      loading.style.display = 'none';
      showSplash();
    }, 500);
  }, 1800);

  // Init sidebar collapse state
  setTimeout(initSidebarCollapse, 200);
});

// ── SPLASH ──
function showSplash() {
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  document.getElementById('quote-text').textContent   = '"' + q.text + '"';
  document.getElementById('quote-author').textContent = '— ' + q.author;
  const splash = document.getElementById('splash');
  splash.classList.add('show');
  requestAnimationFrame(() => setTimeout(() => splash.classList.add('visible'), 50));
}

// Splash continue button
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('splash-cta');
  if (btn) {
    btn.addEventListener('click', () => {
      const splash = document.getElementById('splash');
      splash.style.opacity = '0';
      setTimeout(() => {
        splash.style.display = 'none';
        checkAuth().catch(err => {
          console.warn('Auth check error:', err);
          showAuthPage();
        });
      }, 500);
    });
  }

  // Init push notifications in background after page loads
  setTimeout(() => initPushNotifications(), 2000);
});
