// src/js/config/firebaseConfig.js

// لا تقم بتضمين مفتاح API هنا مباشرة في مشروع حقيقي مفتوح المصدر.
// استخدم متغيرات البيئة أو Firebase Hosting config.
// ولكن لأغراض العرض والتجربة في بيئة Canvas، سنستخدم المتغيرات العامة.

// يتم توفير __app_id و __firebase_config و __initial_auth_token بواسطة بيئة Canvas
// إذا كنت تقوم بالتشغيل خارج Canvas، فستحتاج إلى توفير هذه القيم يدويًا.

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    // هذه هي إعدادات Firebase الخاصة بك، استبدلها بإعدادات مشروعك الحقيقية
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID" // اختياري
};

// تصدير الإعدادات لاستخدامها في ملفات JavaScript الأخرى
export { firebaseConfig, appId };


