// src/js/services/authService.js
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { app } from '../main.js'; // تأكد من استيراد 'app' من main.js حيث يتم تهيئته

const auth = getAuth(app);

/**
 * تسجيل مستخدم جديد بالبريد الإلكتروني وكلمة المرور.
 * @param {string} email - البريد الإلكتروني للمستخدم.
 * @param {string} password - كلمة المرور للمستخدم.
 * @returns {Promise<Object>} - يعيد وعدًا بكائن يحتوي على معلومات المستخدم أو خطأ.
 */
export async function signUpWithEmail(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('تم إنشاء حساب جديد:', userCredential.user);
        return { user: userCredential.user };
    } catch (error) {
        console.error('خطأ في إنشاء الحساب:', error.message);
        return { error: error.message };
    }
}

/**
 * تسجيل دخول المستخدم بالبريد الإلكتروني وكلمة المرور.
 * @param {string} email - البريد الإلكتروني للمستخدم.
 * @param {string} password - كلمة المرور للمستخدم.
 * @returns {Promise<Object>} - يعيد وعدًا بكائن يحتوي على معلومات المستخدم أو خطأ.
 */
export async function signInWithEmail(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('تم تسجيل الدخول بنجاح:', userCredential.user);
        return { user: userCredential.user };
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error.message);
        return { error: error.message };
    }
}

/**
 * تسجيل خروج المستخدم.
 * @returns {Promise<Object>} - يعيد وعدًا بكائن يشير إلى النجاح أو خطأ.
 */
export async function signOutUser() {
    try {
        await signOut(auth);
        console.log('تم تسجيل الخروج بنجاح.');
        return { success: true };
    } catch (error) {
        console.error('خطأ في تسجيل الخروج:', error.message);
        return { error: error.message };
    }
}

/**
 * الحصول على المستخدم الحالي المصادق عليه.
 * @returns {Object|null} - كائن المستخدم إذا كان مسجلاً الدخول، أو null.
 */
export function getCurrentUser() {
    return auth.currentUser;
}

