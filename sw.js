
const CACHE = 'ai-tracker-v21';
const URLS  = ['index.html','claude.html','lp-courses.html','cloud.html','linux.html','python.html'];

// ── Install ──────────────────────────────────────────────────────
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c){ return c.addAll(URLS); })
      .catch(function(){})
      .then(function(){ return self.skipWaiting(); })
  );
});

// ── Activate ─────────────────────────────────────────────────────
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys()
      .then(function(keys){
        return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
      })
      .then(function(){ return self.clients.claim(); })
  );
});

// ── Fetch ────────────────────────────────────────────────────────
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request)
      .then(function(r){ return r || fetch(e.request).catch(function(){ return caches.match('index.html'); }); })
  );
});

// ── Periodic Background Sync ─────────────────────────────────────
// Fires ~daily when Chrome on Android is awake (user doesn't need to have app open)
self.addEventListener('periodicsync', function(e) {
  if (e.tag === 'daily-study-reminder') {
    e.waitUntil(showStudyReminder());
  }
});

// ── Push (fallback from server push, not used but ready) ─────────
self.addEventListener('push', function(e) {
  e.waitUntil(showStudyReminder());
});

// ── Notification click → open app ────────────────────────────────
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(wins) {
        if (wins.length > 0) { return wins[0].focus(); }
        return clients.openWindow('index.html');
      })
  );
});

// ── Helper: show the reminder notification ───────────────────────
function showStudyReminder() {
  var msgs = [
    "Time to study! 📚 Keep your streak going.",
    "Your AI Engineering roadmap won't complete itself! 🚀",
    "10 minutes of study = progress. Open your tracker! ⚡",
    "Claude Fast Track — day not done yet! 🟠",
    "Network engineers learn AI faster. Prove it today! 🐧"
  ];
  var msg = msgs[Math.floor(Math.random() * msgs.length)];
  return self.registration.showNotification('AI Tracker — Study Reminder', {
    body: msg,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: 'study-reminder',
    renotify: true,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open',    title: '📖 Open Tracker' },
      { action: 'dismiss', title: 'Later' }
    ]
  });
}
