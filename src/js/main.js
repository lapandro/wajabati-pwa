// src/js/main.js
// هذا الملف هو نقطة الدخول الرئيسية لمنطق JavaScript في تطبيق وجباتي.
// يقوم بتهيئة Firebase، إدارة حالة المصادقة، وتحديث الواجهة بناءً على دور المستخدم.

// استيراد وحدات Firebase الأساسية
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

// استيراد إعدادات Firebase ومعرف التطبيق الخاص بنا
import { firebaseConfig, appId } from './config/firebaseConfig.js';
// استيراد خدمات المصادقة المخصصة
import * as authService from './services/authService.js'; 
// استيراد خدمات Firestore المخصصة للتفاعل مع قاعدة البيانات
import * as firestoreService from './services/firestoreService.js'; 

// تهيئة تطبيق Firebase
const app = initializeApp(firebaseConfig);
// تصدير 'app' ليتم استخدامه في الخدمات الأخرى التي تحتاج إلى الوصول إلى كائن التطبيق المهيأ
export { app }; 
// الحصول على مثيل قاعدة بيانات Firestore
const db = getFirestore(app);
// الحصول على مثيل خدمة المصادقة
const auth = getAuth(app);

// متغيرات لتخزين معرف المستخدم وحالة المصادقة
let userId = null; // لتخزين معرف المستخدم الحالي (UID)
let isAuthReady = false; // لتحديد ما إذا كانت حالة المصادقة الأولية جاهزة

// الحصول على مراجع لعناصر HTML الرئيسية باستخدام معرفاتهم
// **التغيير الحاسم هنا:** تم تغيير appContent إلى appRoot ليتطابق مع ID في index.html
const appRoot = document.getElementById('app-root'); 
const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');
const logoutButton = document.getElementById('logout-button');

/**
 * وظيفة لعرض رسالة مؤقتة للمستخدم (إشعار) في زاوية الشاشة.
 * @param {string} message - نص الرسالة المراد عرضها.
 * @param {string} type - نوع الرسالة ('info', 'success', 'error') لتحديد اللون.
 */
function showMessage(message, type = 'info') {
    const messageBox = document.createElement('div');
    // استخدام كلاسات Tailwind لتصميم مربع الرسالة
    messageBox.className = `fixed bottom-4 right-4 p-3 rounded-lg shadow-lg text-white ${type === 'error' ? 'bg-red-500' : 'bg-green-500'} z-50`;
    messageBox.textContent = message;
    document.body.appendChild(messageBox);
    // إزالة مربع الرسالة بعد 3 ثوانٍ
    setTimeout(() => {
        messageBox.remove();
    }, 3000);
}

// تسجيل Service Worker لتفعيل ميزات PWA (التخزين المؤقت، الإشعارات)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js') // استخدام المسار الجذري الصحيح لـ sw.js
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}

// الاستماع إلى تغييرات حالة المصادقة (تسجيل الدخول، تسجيل الخروج)
onAuthStateChanged(auth, async (user) => {
    isAuthReady = true; // تم التحقق من حالة المصادقة الأولية الآن
    if (user) {
        // إذا كان المستخدم مسجلاً الدخول (بأي طريقة)
        userId = user.uid;
        console.log('المستخدم مسجل الدخول:', userId);
        showMessage('تم تسجيل الدخول بنجاح!', 'success');
        // إخفاء أزرار تسجيل الدخول/الاشتراك وإظهار زر تسجيل الخروج
        loginButton.classList.add('hidden');
        signupButton.classList.add('hidden');
        logoutButton.classList.remove('hidden');

        // جلب دور المستخدم (عميل أو صاحب مطعم) وعرض الواجهة المناسبة له
        await fetchUserRole(userId);

    } else {
        // إذا كان المستخدم غير مسجل الدخول
        userId = null;
        console.log('المستخدم غير مسجل الدخول.');
        showMessage('يرجى تسجيل الدخول أو إنشاء حساب.', 'info');
        // إظهار أزرار تسجيل الدخول/الاشتراك وإخفاء زر تسجيل الخروج
        loginButton.classList.remove('hidden');
        signupButton.classList.remove('hidden');
        logoutButton.classList.add('hidden');
        // عرض الواجهة العامة (صفحة تسجيل الدخول/الترحيب)
        renderPublicView();

        // محاولة تسجيل الدخول باستخدام الرمز المخصص (خاص ببيئة Canvas) إذا كان متاحًا
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            try {
                await signInWithCustomToken(auth, __initial_auth_token);
                console.log('تم تسجيل الدخول تلقائيًا باستخدام الرمز المخصص.');
            } catch (error) {
                console.error('فشل تسجيل الدخول بالرمز المخصص:', error);
                // إذا فشل الرمز المخصص، حاول تسجيل الدخول كمجهول (لمستخدمي Firebase)
                try {
                    await signInAnonymously(auth);
                    console.log('تم تسجيل الدخول كمستخدم مجهول.');
                } catch (anonError) {
                    console.error('فشل تسجيل الدخول كمجهول:', anonError);
                }
            }
        } else {
            // إذا لم يكن هناك رمز مخصص، سجل الدخول كمجهول (الافتراضي للمستخدمين غير المصادق عليهم)
            try {
                await signInAnonymously(auth);
                console.log('تم تسجيل الدخول كمستخدم مجهول.');
            } catch (anonError) {
                console.error('فشل تسجيل الدخول كمجهول:', anonError);
            }
        }
    }
});

/**
 * وظيفة لجلب دور المستخدم من Firestore وتحديد الواجهة المناسبة لعرضها.
 * @param {string} uid - معرف المستخدم (UID).
 */
async function fetchUserRole(uid) {
    // التحقق من أن حالة المصادقة جاهزة قبل محاولة عمليات Firestore
    if (!isAuthReady) {
        console.warn("Firestore operations attempted before auth state is ready.");
        return;
    }
    try {
        // استخدام firestoreService لجلب مستند الملف الشخصي للمستخدم
        const userData = await firestoreService.getDocument('userData/profile', uid, 'profile', false); // 'profile' هو معرف المستند داخل مجموعة userData الفرعية للمستخدم

        if (userData) {
            // إذا وجد مستند المستخدم، فاحصل على دوره
            const role = userData.role;
            console.log('دور المستخدم:', role);
            // عرض لوحة التحكم المناسبة بناءً على الدور
            if (role === 'customer') {
                renderCustomerDashboard();
            } else if (role === 'restaurant_owner') {
                renderRestaurantDashboard();
            } else {
                renderPublicView(); // دور غير معروف أو عام، العودة للواجهة العامة
            }
        } else {
            console.log('مستند المستخدم غير موجود في Firestore، ربما مستخدم جديد.');
            // إذا كان المستخدم جديدًا ولم يتم تعيين دور له، اعرض صفحة إعداد الملف الشخصي
            renderProfileSetupView();
        }
    } catch (error) {
        console.error('خطأ في جلب دور المستخدم:', error);
        showMessage('خطأ في جلب معلومات المستخدم.', 'error');
        renderPublicView(); // عرض الواجهة العامة في حالة الخطأ
    }
}

/**
 * وظيفة لعرض الواجهة العامة (صفحة الترحيب/تسجيل الدخول).
 */
function renderPublicView() {
    // استخدام appRoot لتحديث المحتوى الرئيسي للصفحة
    appRoot.innerHTML = `
        <h2 class="text-3xl font-semibold text-center text-red-700 mb-6">مرحباً بك في وجباتي!</h2>
        <p class="text-center text-gray-700 mb-8">منصة المطاعم والطلبات الذكية.</p>
        <div class="flex justify-center">
            <img src="https://placehold.co/400x250/FEE2E2/B91C1C?text=وجباتي" alt="صورة ترحيبية" class="rounded-lg shadow-md max-w-full h-auto">
        </div>
        <p class="text-center text-gray-600 mt-8">يرجى تسجيل الدخول أو إنشاء حساب للبدء.</p>
    `;
}

/**
 * وظيفة لعرض لوحة تحكم العميل.
 */
function renderCustomerDashboard() {
    // استخدام appRoot لتحديث المحتوى الرئيسي للصفحة
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

/**
 * وظيفة لعرض لوحة تحكم صاحب المطعم.
 */
function renderRestaurantDashboard() {
    // استخدام appRoot لتحديث المحتوى الرئيسي للصفحة
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

/**
 * وظيفة لعرض صفحة إعداد الملف الشخصي للمستخدمين الجدد.
 */
function renderProfileSetupView() {
    // استخدام appRoot لتحديث المحتوى الرئيسي للصفحة
    appRoot.innerHTML = `
        <h2 class="text-3xl font-semibold text-center text-purple-700 mb-6">إعداد الملف الشخصي</h2>
        <p class="text-center text-gray-700 mb-4">يبدو أنك مستخدم جديد. يرجى اختيار دورك:</p>
        <div class="flex justify-center space-x-6 mt-8">
            <button id="select-customer-role" class="bg-blue-500 text-white px-8 py-4 rounded-lg shadow-lg hover:bg-blue-600 transition-colors text-xl font-bold">أنا عميل</button>
            <button id="select-restaurant-role" class="bg-orange-500 text-white px-8 py-4 rounded-lg shadow-lg hover:bg-orange-600 transition-colors text-xl font-bold">أنا صاحب مطعم</button>
        </div>
    `;

    // إضافة مستمعي الأحداث لأزرار اختيار الدور
    document.getElementById('select-customer-role').addEventListener('click', () => saveUserRole('customer'));
    document.getElementById('select-restaurant-role').addEventListener('click', () => saveUserRole('restaurant_owner'));
}

/**
 * وظيفة لحفظ دور المستخدم المحدد في Firestore.
 * @param {string} role - الدور المراد حفظه ('customer' أو 'restaurant_owner').
 */
async function saveUserRole(role) {
    if (!userId) {
        showMessage('خطأ: لا يوجد مستخدم مسجل الدخول.', 'error');
        return;
    }
    // التأكد من أن المصادقة جاهزة قبل محاولة الكتابة على Firestore
    if (!isAuthReady) {
        console.warn("Firestore operations attempted before auth state is ready.");
        showMessage('الرجاء الانتظار حتى يتم تهيئة المصادقة.', 'error');
        return;
    }
    try {
        // استخدام firestoreService لتعيين دور المستخدم في مستند ملفه الشخصي
        const success = await firestoreService.setDocument('userData/profile', userId, 'profile', {
            email: auth.currentUser.email || '', // البريد الإلكتروني للمستخدم، قد يكون فارغًا للمستخدمين المجهولين
            role: role, // الدور المحدد
            displayName: auth.currentUser.displayName || `مستخدم ${role}`, // اسم عرض افتراضي
            createdAt: new Date(), // تاريخ إنشاء الدور
        }, false, true); // false لبيانات خاصة بالمستخدم (في مساره الخاص)، true لدمج البيانات إذا كان المستند موجودًا

        if (success) {
            showMessage(`تم حفظ دورك كـ ${role} بنجاح!`, 'success');
            // عرض لوحة التحكم المناسبة بعد حفظ الدور
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


// مستمعو الأحداث لأزرار المصادقة في شريط الرأس
loginButton.addEventListener('click', async () => {
    // هذه مجرد محاكاة للوظيفة. في تطبيق حقيقي، ستنتقل إلى صفحة تسجيل الدخول الفعلية.
    showMessage('سيتم عرض نموذج تسجيل الدخول قريباً. (ميزة قيد التطوير)', 'info');
    // يمكن هنا استدعاء authService.signInWithEmail(email, password) بواجهة مستخدم فعلية.
});

signupButton.addEventListener('click', async () => {
    // هذه مجرد محاكاة للوظيفة. في تطبيق حقيقي، ستنتقل إلى صفحة إنشاء حساب فعلية.
    showMessage('سيتم عرض نموذج إنشاء حساب قريباً. (ميزة قيد التطوير)', 'info');
    // يمكن هنا استدعاء authService.signUpWithEmail(email, password) بواجهة مستخدم فعلية.
});

logoutButton.addEventListener('click', async () => {
    // استدعاء وظيفة تسجيل الخروج من authService
    const result = await authService.signOutUser();
    if (result.success) {
        showMessage('تم تسجيل الخروج بنجاح!', 'success');
        renderPublicView(); // العودة إلى الواجهة العامة بعد تسجيل الخروج
    } else {
        showMessage(result.error || 'فشل تسجيل الخروج.', 'error');
    }
});

// تهيئة أولية للواجهة عند تحميل الصفحة
// سيتم تحديثها تلقائيًا بواسطة onAuthStateChanged بمجرد تحديد حالة المصادقة
renderPublicView();

