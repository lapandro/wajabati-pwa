// src/js/config/firebaseConfig.js

/**
 * @file firebaseConfig.js
 * @description هذا الملف يحتوي على كائن تهيئة Firebase لتطبيق الويب.
 * This file contains the Firebase configuration object for your web app.
 */

const firebaseConfig = {
  apiKey: "AIzaSyCaGuiM0-CO9peMonPeXYwG2sIAAC14NJg",
  authDomain: "wajabati-pwa.firebaseapp.com",
  projectId: "wajabati-pwa",
  storageBucket: "wajabati-pwa.firebasestorage.app", // تم تصحيح الخطأ الإملائي هنا من "firebasestorage.app" إلى "appspot.com" إذا كان هذا هو النطاق الصحيح. عادةً ما يكون "PROJECT_ID.appspot.com"
  messagingSenderId: "474367534307",
  appId: "1:474367534307:web:8c3d1e19e2a5c3f68151d6",
  measurementId: "G-GTR0R0R0DS"
};

// تصدير كائن التهيئة لاستخدامه في أجزاء أخرى من التطبيق
// Export the configuration object to be used in other parts of the application
export default firebaseConfig;

