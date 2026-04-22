/* ================================================================
   QUIZ ACADEMY — SERVICE WORKER v4
   Handles background push notifications for streak reminders.
   Registered from client/js/push.js
   ================================================================ */

const CACHE_NAME = 'quiz-academy-v4';

// ── INSTALL ──
self.addEventListener('install', event => {
  self.skipWaiting();
});

// ── ACTIVATE ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── PUSH NOTIFICATION RECEIVED ──
self.addEventListener('push', event => {
  if (!event.data) return;

  let data = {};
  try { data = event.data.json(); } catch { data = { title: 'Quiz Academy', body: event.data.text() }; }

  const title   = data.title   || '🎓 Quiz Academy';
  const options = {
    body:    data.body    || 'You have a new notification',
    icon:    data.icon    || '/icons/icon-192.png',
    badge:   data.badge   || '/icons/icon-72.png',
    tag:     data.tag     || 'quiz-academy',
    data:    { url: data.url || '/' },
    vibrate: [100, 50, 100],
    actions: data.actions || [
      { action: 'open',    title: '▶ Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── NOTIFICATION CLICK ──
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Focus existing tab if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new tab
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
