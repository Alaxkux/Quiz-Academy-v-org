/* ================================================================
   QUIZ ACADEMY — WEB PUSH CLIENT v4
   Registers service worker, manages push subscriptions,
   provides permission UI for streak reminder notifications.
   ================================================================ */

let _swRegistration = null;
let _pushVapidKey   = null;

// ── INITIALISE — call once on app launch ──
async function initPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported on this browser');
    return;
  }

  try {
    // Register service worker
    _swRegistration = await navigator.serviceWorker.register('/sw.js');
    console.log('✅ Service worker registered');

    // Fetch VAPID public key from server
    const res = await fetch('/api/push/vapid-public-key');
    if (!res.ok) return; // push not configured on server
    const { publicKey } = await res.json();
    _pushVapidKey = publicKey;

    // If user already has permission + subscription, re-sync it
    if (Notification.permission === 'granted') {
      await syncSubscription();
    }
  } catch (err) {
    console.warn('Push init failed:', err.message);
  }
}

// ── REQUEST PERMISSION + SUBSCRIBE ──
async function requestPushPermission() {
  if (!_swRegistration || !_pushVapidKey) {
    showToast('Push notifications not available on this device', 'info');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      showToast('Notifications blocked — enable them in browser settings', 'warning');
      return false;
    }

    await syncSubscription();
    showToast('Streak reminders enabled! 🔥', 'success');
    addNotif('Push notifications enabled — we\'ll remind you to keep your streak!', 'success');
    return true;
  } catch (err) {
    console.error('Push subscribe error:', err);
    showToast('Could not enable notifications', 'error');
    return false;
  }
}

// ── UNSUBSCRIBE ──
async function unsubscribePush() {
  if (!_swRegistration) return;
  try {
    const sub = await _swRegistration.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
      // Tell server to remove this subscription
      await apiFetch('/push/unsubscribe', {
        method: 'POST',
        body:   JSON.stringify({ endpoint: sub.endpoint })
      });
    }
    showToast('Streak reminders disabled', 'info');
    return true;
  } catch (err) {
    console.warn('Unsubscribe error:', err);
    return false;
  }
}

// ── SYNC SUBSCRIPTION WITH SERVER ──
async function syncSubscription() {
  if (!_swRegistration || !_pushVapidKey) return;

  try {
    // Get or create subscription
    let sub = await _swRegistration.pushManager.getSubscription();
    if (!sub) {
      sub = await _swRegistration.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(_pushVapidKey)
      });
    }

    // Send subscription to server
    await apiFetch('/push/subscribe', {
      method: 'POST',
      body:   JSON.stringify({ subscription: sub.toJSON() })
    });
  } catch (err) {
    console.warn('Subscription sync error:', err.message);
  }
}

// ── CHECK PUSH STATUS ──
function getPushStatus() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported';
  if (!_pushVapidKey) return 'not-configured';
  const p = Notification.permission;
  if (p === 'denied')  return 'blocked';
  if (p === 'granted') return 'enabled';
  return 'prompt'; // default — not yet asked
}

// ── HELPER: convert VAPID key ──
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = window.atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

// ── PUSH SETTINGS UI (rendered inside Settings page) ──
function renderPushSettingsSection() {
  const status = getPushStatus();

  if (status === 'unsupported') {
    return `
      <div class="settings-section">
        <h3>🔔 Streak Reminders</h3>
        <p style="font-size:13px;color:var(--t3)">Push notifications are not supported on this browser or device.</p>
      </div>`;
  }

  if (status === 'not-configured') {
    return `
      <div class="settings-section">
        <h3>🔔 Streak Reminders</h3>
        <p style="font-size:13px;color:var(--t3)">Push notifications are not configured on the server. Add <code>VAPID_PUBLIC_KEY</code> and <code>VAPID_PRIVATE_KEY</code> to your <code>.env</code> to enable them.</p>
      </div>`;
  }

  if (status === 'blocked') {
    return `
      <div class="settings-section">
        <h3>🔔 Streak Reminders</h3>
        <p style="font-size:13px;color:var(--t3)">Notifications are blocked. To enable them, click the lock icon in your browser address bar and allow notifications for this site.</p>
      </div>`;
  }

  if (status === 'enabled') {
    return `
      <div class="settings-section">
        <h3>🔔 Streak Reminders</h3>
        <div class="setting-item">
          <div class="setting-info">
            <h4>Daily Streak Reminders <span style="color:var(--green);font-size:11px">● Active</span></h4>
            <p>You'll get a reminder if you haven't taken a quiz by 8 PM each day</p>
          </div>
          <button class="btn btn-secondary" style="font-size:12px" onclick="unsubscribePush().then(()=>renderSettings())">
            Turn Off
          </button>
        </div>
      </div>`;
  }

  // status === 'prompt'
  return `
    <div class="settings-section">
      <h3>🔔 Streak Reminders</h3>
      <div class="setting-item">
        <div class="setting-info">
          <h4>Daily Streak Reminders</h4>
          <p>Get a gentle nudge at 8 PM if you haven't quizzed today — keeps your streak alive 🔥</p>
        </div>
        <button class="btn btn-primary" style="font-size:12px" onclick="requestPushPermission().then(()=>renderSettings())">
          Enable
        </button>
      </div>
    </div>`;
}
