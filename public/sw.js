// public/sw.js
// اسم ذاكرة التخزين المؤقت (Cache)
const CACHE_NAME = 'wajabati-cache-v1';
// قائمة بالملفات التي سيتم تخزينها مؤقتًا عند التثبيت
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css', // هذا الملف سيتم إنشاؤه بواسطة Tailwind
    '/js/main.js',
    '/manifest.json',
    '/assets/icons/icon-192x192.png', // مثال، أضف جميع الأيقونات هنا
    // أضف أي أصول أخرى تريد تخزينها مؤقتًا (صور، خطوط، إلخ.)
];

// حدث التثبيت (Install Event)
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('[Service Worker] Cache addAll failed:', err);
            })
    );
});

// حدث الجلب (Fetch Event)
self.addEventListener('fetch', (event) => {
    // استراتيجية Cache-First: حاول جلب من ذاكرة التخزين المؤقت أولاً، ثم الشبكة
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // إذا كان الطلب موجودًا في ذاكرة التخزين المؤقت، قم بإعادته
                if (response) {
                    console.log(`[Service Worker] Serving from cache: ${event.request.url}`);
                    return response;
                }
                // إذا لم يكن موجودًا في ذاكرة التخزين المؤقت، حاول جلبه من الشبكة
                console.log(`[Service Worker] Fetching from network: ${event.request.url}`);
                return fetch(event.request)
                    .then((networkResponse) => {
                        // إذا كان الجلب ناجحًا، قم بتخزينه مؤقتًا ثم أعد الاستجابة
                        if (networkResponse.ok || networkResponse.type === 'opaque') {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });
                        }
                        return networkResponse;
                    })
                    .catch((error) => {
                        console.error(`[Service Worker] Fetch failed for: ${event.request.url}`, error);
                        // يمكنك هنا عرض صفحة "عدم الاتصال بالإنترنت" إذا فشل الجلب
                        // مثال: return caches.match('/offline.html');
                    });
            })
    );
});

// حدث التفعيل (Activate Event)
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // تأكد من أن Service Worker يتحكم في جميع العملاء فورًا
    return self.clients.claim();
});

// حدث الإشعارات (Push Notifications) - سيتم تفعيلها لاحقًا مع FCM
self.addEventListener('push', (event) => {
    const data = event.data.json();
    console.log('[Service Worker] Push Received:', data);

    const title = data.title || 'إشعار جديد من وجباتي';
    const options = {
        body: data.body || 'لديك تحديث جديد.',
        icon: data.icon || '/assets/icons/icon-192x192.png',
        badge: data.badge || '/assets/icons/icon-72x72.png',
        data: {
            url: data.url || '/' // URL لفتحها عند النقر على الإشعار
        }
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// حدث النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // إغلاق الإشعار بعد النقر

    const urlToOpen = event.notification.data.url || '/';
    event.waitUntil(
        clients.openWindow(urlToOpen)
    );
});


