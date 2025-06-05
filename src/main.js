// src/js/main.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

import { firebaseConfig, appId } from './config/firebaseConfig.js';
import * as authService from './services/authService.js';
import * as firestoreService from './services/firestoreService.js';

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
export { app };
const db = getFirestore(app);
const auth = getAuth(app);

let userId = null;
let isAuthReady = false;

// تم تغيير المعرف هنا ليتوافق مع id="app-root" في index.html
const appRoot = document.getElementById('app-root'); 
const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');
const logoutButton = document.getElementById('logout-button');

// وظيفة لعرض رسالة مؤقتة للمستخدم
function showMessage(message, type = 'info') {
    const messageBox = document.createElement('div');
    // استخدام كلاسات Tailwind التي تتوافق مع الأنماط المضمنة
    messageBox.className = `fixed bottom-4 right-4 p-3 rounded-lg shadow-lg text-white ${type === 'error' ? 'bg-red-500' : 'bg-green-500'} z-50`;
    messageBox.textContent = message;
    document.body.appendChild(messageBox);
    setTimeout(() => {
        messageBox.remove();
    }, 3000);
}

// تسجيل Service Worker
// هذا الجزء هو المسؤول عن تسجيل Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js') // استخدام المسار الجذري
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}

// معالجة حالة المصادقة
onAuthStateChanged(auth, async (user) => {
    isAuthReady = true;
    if (user) {
        userId = user.uid;
        console.log('المستخدم مسجل الدخول:', userId);
        showMessage('تم تسجيل الدخول بنجاح!', 'success');
        loginButton.classList.add('hidden');
        signupButton.classList.add('hidden');
        logoutButton.classList.remove('hidden');
        await fetchUserRole(userId);
    } else {
        userId = null;
        console.log('المستخدم غير مسجل الدخول.');
        showMessage('يرجى تسجيل الدخول أو إنشاء حساب.', 'info');
        loginButton.classList.remove('hidden');
        signupButton.classList.remove('hidden');
        logoutButton.classList.add('hidden');
        renderPublicView();

        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            try {
                await signInWithCustomToken(auth, __initial_auth_token);
                console.log('تم تسجيل الدخول تلقائيًا باستخدام الرمز المخصص.');
            } catch (error) {
                console.error('فشل تسجيل الدخول بالرمز المخصص:', error);
                try {
                    await signInAnonymously(auth);
                    console.log('تم تسجيل الدخول كمستخدم مجهول.');
                } catch (anonError) {
                    console.error('فشل تسجيل الدخول كمجهول:', anonError);
                }
            }
        } else {
            try {
                await signInAnonymously(auth);
                console.log('تم تسجيل الدخول كمستخدم مجهول.');
            } catch (anonError) {
                console.error('فشل تسجيل الدخول كمجهول:', anonError);
            }
        }
    }
});

// وظيفة لجلب دور المستخدم من Firestore
async function fetchUserRole(uid) {
    if (!isAuthReady) {
        console.warn("Firestore operations attempted before auth state is ready.");
        return;
    }
    try {
        const userData = await firestoreService.getDocument('userData/profile', uid, 'profile', false);

        if (userData) {
            const role = userData.role;
            console.log('دور المستخدم:', role);
            if (role === 'customer') {
                renderCustomerDashboard();
            } else if (role === 'restaurant_owner') {
                renderRestaurantDashboard();
            } else {
                renderPublicView();
            }
        } else {
            console.log('مستند المستخدم غير موجود في Firestore، ربما مستخدم جديد.');
            renderProfileSetupView();
        }
    } catch (error) {
        console.error('خطأ في جلب دور المستخدم:', error);
        showMessage('خطأ في جلب معلومات المستخدم.', 'error');
        renderPublicView();
    }
}

// وظائف لعرض الواجهات المختلفة
function renderPublicView() {
    appRoot.innerHTML = `
        <h2 class="text-3xl font-semibold text-center text-red-700 mb-6">مرحباً بك في وجباتي!</h2>
        <p class="text-center text-gray-700 mb-8">منصة المطاعم والطلبات الذكية.</p>
        <div class="flex justify-center">
            <img src="https://placehold.co/400x250/FEE2E2/B91C1C?text=وجباتي" alt="صورة ترحيبية" class="rounded-lg shadow-md max-w-full h-auto">
        </div>
        <p class="text-center text-gray-600 mt-8">يرجى تسجيل الدخول أو إنشاء حساب للبدء.</p>
    `;
}

function renderCustomerDashboard() {
    appRoot.innerHTML = `
        <h2 class="text-3xl font-semibold text-center text-green-700 mb-6">لوحة تحكم العميل</h2>
        <p class="text-center text-gray-700 mb-4">مرحباً بك أيها العميل! استكشف المطاعم أو تتبع طلباتك.</p>
        <p class="text-center text-gray-700 mb-8">معرف المستخدم الخاص بك: <span class="font-bold text-blue-600">${userId}</span></p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="bg-blue-100 p-6 rounded-lg shadow-md flex flex-col items-center">
                <svg class="w-16 h-16 text-blue-600 mb-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>
                <h3 class="text-xl font-semibold text-blue-800 mb-2">تصفح المطاعم</h3>
                <p class="text-center text-blue-700">اكتشف أفضل المطاعم القريبة منك.</p>
                <button class="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-colors">ابدأ التصفح</button>
            </div>
            <div class="bg-purple-100 p-6 rounded-lg shadow-md flex flex-col items-center">
                <svg class="w-16 h-16 text-purple-600 mb-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9.243 3.03a1 1 0 01.727 1.052l-1.313 7a1 1 0 01-1.637.525l-2.455-2.455a1 1 0 01-.02.02L3 12.364V17a1 1 0 001 1h12a1 1 0 001-1v-4.636l-2.828-2.829a1 1 0 01-.02-.02l-2.455 2.455a1 1 0 01-1.637-.525l-1.313-7a1 1 0 011.052-.727zM12 14a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
                <h3 class="text-xl font-semibold text-purple-800 mb-2">طلباتي</h3>
                <p class="text-center text-purple-700">تابع حالة طلباتك الحالية والسابقة.</p>
                <button class="mt-4 bg-purple-600 text-white px-6 py-3 rounded-lg shadow hover:bg-purple-700 transition-colors">عرض الطلبات</button>
            </div>
            <div class="bg-yellow-100 p-6 rounded-lg shadow-md flex flex-col items-center">
                <svg class="w-16 h-16 text-yellow-600 mb-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a2 2 0 100 4 2 2 0 000-4z" clip-rule="evenodd"/></svg>
                <h3 class="text-xl font-semibold text-yellow-800 mb-2">محفظتي</h3>
                <p class="text-center text-yellow-700">إدارة رصيد محفظتك ونقاط الولاء.</p>
                <button class="mt-4 bg-yellow-600 text-white px-6 py-3 rounded-lg shadow hover:bg-yellow-700 transition-colors">إدارة المحفظة</button>
            </div>
        </div>
    `;
}

function renderRestaurantDashboard() {
    appRoot.innerHTML = `
        <h2 class="text-3xl font-semibold text-center text-orange-700 mb-6">لوحة تحكم المطعم</h2>
        <p class="text-center text-gray-700 mb-4">مرحباً بك يا صاحب المطعم! قم بإدارة طلباتك وقوائمك.</p>
        <p class="text-center text-gray-700 mb-8">معرف المستخدم الخاص بك: <span class="font-bold text-blue-600">${userId}</span></p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="bg-red-100 p-6 rounded-lg shadow-md flex flex-col items-center">
                <svg class="w-16 h-16 text-red-600 mb-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM8.293 7.293a1 1 0 011.414 0L10 8.586l.293-.293a1 1 0 111.414 1.414L11.414 10l.293.293a1 1 0 01-1.414 1.414L10 11.414l-.293.293a1 1 0 01-1.414-1.414L8.586 10l-.293-.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                <h3 class="text-xl font-semibold text-red-800 mb-2">إدارة الطلبات</h3>
                <p class="text-center text-red-700">راجع الطلبات الجديدة وحدث حالتها.</p>
                <button class="mt-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow hover:bg-red-700 transition-colors">عرض الطلبات</button>
            </div>
            <div class="bg-green-100 p-6 rounded-lg shadow-md flex flex-col items-center">
                <svg class="w-16 h-16 text-green-600 mb-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm1.475 2.475a.75.75 0 00-1.06 1.06L6 10.06l-2.586 2.585a.75.75 0 101.06 1.06L7.06 11.12l2.585 2.586a.75.75 0 101.06-1.06L8.12 10.06l2.586-2.585a.75.75 0 10-1.06-1.06L7.06 8.12l-2.585-2.586z" clip-rule="evenodd"/></svg>
                <h3 class="text-xl font-semibold text-green-800 mb-2">إدارة القائمة</h3>
                <p class="text-center text-green-700">أضف، عدّل، أو احذف وجباتك.</p>
                <button class="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition-colors">تعديل القائمة</button>
            </div>
            <div class="bg-indigo-100 p-6 rounded-lg shadow-md flex flex-col items-center">
                <svg class="w-16 h-16 text-indigo-600 mb-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.5-6.5a.5.5 0 011 0v3a.5.5 0 01-1 0v-3zM10 6a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2A.5.5 0 0110 6z" clip-rule="evenodd"/></svg>
                <h3 class="text-xl font-semibold text-indigo-800 mb-2">التقارير</h3>
                <p class="text-center text-indigo-700">عرض تقارير المبيعات والأداء.</p>
                <button class="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700 transition-colors">عرض التقارير</button>
            </div>
        </div>
    `;
}

function renderProfileSetupView() {
    appRoot.innerHTML = `
        <h2 class="text-3xl font-semibold text-center text-purple-700 mb-6">إعداد الملف الشخصي</h2>
        <p class="text-center text-gray-700 mb-4">يبدو أنك مستخدم جديد. يرجى اختيار دورك:</p>
        <div class="flex justify-center space-x-6 mt-8">
            <button id="select-customer-role" class="bg-blue-500 text-white px-8 py-4 rounded-lg shadow-lg hover:bg-blue-600 transition-colors text-xl font-bold">أنا عميل</button>
            <button id="select-restaurant-role" class="bg-orange-500 text-white px-8 py-4 rounded-lg shadow-lg hover:bg-orange-600 transition-colors text-xl font-bold">أنا صاحب مطعم</button>
        </div>
    `;

    document.getElementById('select-customer-role').addEventListener('click', () => saveUserRole('customer'));
    document.getElementById('select-restaurant-role').addEventListener('click', () => saveUserRole('restaurant_owner'));
}

async function saveUserRole(role) {
    if (!userId) {
        showMessage('خطأ: لا يوجد مستخدم مسجل الدخول.', 'error');
        return;
    }
    if (!isAuthReady) {
        console.warn("Firestore operations attempted before auth state is ready.");
        showMessage('الرجاء الانتظار حتى يتم تهيئة المصادقة.', 'error');
        return;
    }
    try {
        const success = await firestoreService.setDocument('userData/profile', userId, 'profile', {
            email: auth.currentUser.email || '',
            role: role,
            displayName: auth.currentUser.displayName || `مستخدم ${role}`,
            createdAt: new Date(),
        }, false, true);

        if (success) {
            showMessage(`تم حفظ دورك كـ ${role} بنجاح!`, 'success');
            if (role === 'customer') {
                renderCustomerDashboard();
            } else {
                renderRestaurantDashboard();
            }
        } else {
            showMessage('فشل حفظ دور المستخدم. يرجى المحاولة مرة أخرى.', 'error');
        }
    } catch (error) {
        console.error('خطأ في حفظ دور المستخدم:', error);
        showMessage('فشل حفظ دور المستخدم. يرجى المحاولة مرة أخرى.', 'error');
    }
}


loginButton.addEventListener('click', async () => {
    showMessage('سيتم عرض نموذج تسجيل الدخول قريباً. (ميزة قيد التطوير)', 'info');
});

signupButton.addEventListener('click', async () => {
    showMessage('سيتم عرض نموذج إنشاء حساب قريباً. (ميزة قيد التطوير)', 'info');
});

logoutButton.addEventListener('click', async () => {
    const result = await authService.signOutUser();
    if (result.success) {
        showMessage('تم تسجيل الخروج بنجاح!', 'success');
        renderPublicView();
    } else {
        showMessage(result.error || 'فشل تسجيل الخروج.', 'error');
    }
});

renderPublicView();

