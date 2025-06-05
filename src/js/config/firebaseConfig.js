// src/js/config/firebaseConfig.js

// يتم توفير __app_id و __firebase_config و __initial_auth_token بواسطة بيئة Canvas
// إذا كنت تقوم بالتشغيل خارج Canvas، فستحتاج إلى توفير هذه القيم يدويًا.

// استخدم __app_id المتوفر في بيئة Canvas أو استخدم معرف المشروع من firebaseConfig كاحتياطي
const appId = typeof __app_id !== 'undefined' ? __app_id : "wajabati-pwa";

// استخدم __firebase_config المتوفر في بيئة Canvas أو استخدم إعدادات Firebase الخاصة بك
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    apiKey: "AIzaSyCaGuiM0-CO9peMonPeXYwG2sIAAC14NJg",
    authDomain: "wajabati-pwa.firebaseapp.com",
    projectId: "wajabati-pwa",
    storageBucket: "wajabati-pwa.firebasestorage.app",
    messagingSenderId: "474367534307",
    appId: "1:474367534307:web:8c3d1e19e2a5c3f68151d6",
    measurementId: "G-GTR0R0R0DS"
};

// تصدير الإعدادات لاستخدامها في ملفات JavaScript الأخرى
export { firebaseConfig, appId };

