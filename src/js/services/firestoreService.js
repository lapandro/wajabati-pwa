// src/js/services/firestoreService.js
import { getFirestore, doc, getDoc, setDoc, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';
import { app } from '../main.js'; // تأكد من استيراد 'app' من main.js حيث يتم تهيئته
import { appId } from '../config/firebaseConfig.js'; // استيراد معرف التطبيق

const db = getFirestore(app);

/**
 * بناء مسار المجموعة لمستخدم معين (خاص أو عام).
 * @param {string} collectionName - اسم المجموعة (مثل 'userData/profile', 'restaurants', 'orders').
 * @param {string} userId - معرف المستخدم.
 * @param {boolean} isPublic - إذا كانت المجموعة عامة (true) أو خاصة بالمستخدم (false).
 * @returns {string} - المسار الكامل للمجموعة.
 */
function buildCollectionPath(collectionName, userId, isPublic = false) {
    if (isPublic) {
        // البيانات العامة يتم تخزينها في /artifacts/{appId}/public/data/{collectionName}
        return `artifacts/${appId}/public/data/${collectionName}`;
    } else {
        // البيانات الخاصة بالمستخدم يتم تخزينها في /artifacts/{appId}/users/{userId}/{collectionName}
        return `artifacts/${appId}/users/${userId}/${collectionName}`;
    }
}

/**
 * بناء مسار المستند لمستخدم معين (خاص أو عام).
 * @param {string} collectionName - اسم المجموعة.
 * @param {string} userId - معرف المستخدم.
 * @param {string} documentId - معرف المستند.
 * @param {boolean} isPublic - إذا كانت المجموعة عامة (true) أو خاصة بالمستخدم (false).
 * @returns {string} - المسار الكامل للمستند.
 */
function buildDocumentPath(collectionName, userId, documentId, isPublic = false) {
    return `${buildCollectionPath(collectionName, userId, isPublic)}/${documentId}`;
}

/**
 * جلب مستند واحد من Firestore.
 * @param {string} collectionName - اسم المجموعة.
 * @param {string} userId - معرف المستخدم الحالي.
 * @param {string} documentId - معرف المستند المراد جلبه.
 * @param {boolean} isPublic - هل المستند في مجموعة عامة.
 * @returns {Promise<Object|null>} - يعيد بيانات المستند أو null إذا لم يتم العثور عليه.
 */
export async function getDocument(collectionName, userId, documentId, isPublic = false) {
    if (!userId) {
        console.error("Firestore Error: userId is required to get a document.");
        return null;
    }
    try {
        const docRef = doc(db, buildDocumentPath(collectionName, userId, documentId, isPublic));
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.log(`No such document: ${documentId} in ${collectionName}`);
            return null;
        }
    } catch (error) {
        console.error("Error getting document:", error);
        return null;
    }
}

/**
 * إضافة مستند جديد إلى مجموعة.
 * @param {string} collectionName - اسم المجموعة.
 * @param {string} userId - معرف المستخدم الحالي.
 * @param {Object} data - البيانات المراد إضافتها.
 * @param {boolean} isPublic - هل المستند في مجموعة عامة.
 * @returns {Promise<Object|null>} - يعيد معرف المستند الجديد أو null في حالة الخطأ.
 */
export async function addDocument(collectionName, userId, data, isPublic = false) {
    if (!userId) {
        console.error("Firestore Error: userId is required to add a document.");
        return null;
    }
    try {
        const colRef = collection(db, buildCollectionPath(collectionName, userId, isPublic));
        const docRef = await addDoc(colRef, data);
        console.log("Document written with ID:", docRef.id);
        return { id: docRef.id, ...data };
    } catch (error) {
        console.error("Error adding document:", error);
        return null;
    }
}

/**
 * تعيين (إنشاء أو تحديث) مستند في Firestore بمعرف محدد.
 * @param {string} collectionName - اسم المجموعة.
 * @param {string} userId - معرف المستخدم الحالي.
 * @param {string} documentId - معرف المستند لتعيينه.
 * @param {Object} data - البيانات المراد تعيينها.
 * @param {boolean} isPublic - هل المستند في مجموعة عامة.
 * @param {boolean} merge - دمج البيانات إذا كان المستند موجودًا.
 * @returns {Promise<boolean>} - يعيد true عند النجاح، false عند الفشل.
 */
export async function setDocument(collectionName, userId, documentId, data, isPublic = false, merge = false) {
    if (!userId) {
        console.error("Firestore Error: userId is required to set a document.");
        return false;
    }
    try {
        const docRef = doc(db, buildDocumentPath(collectionName, userId, documentId, isPublic));
        await setDoc(docRef, data, { merge });
        console.log("Document successfully set!");
        return true;
    } catch (error) {
        console.error("Error setting document:", error);
        return false;
    }
}

/**
 * تحديث مستند موجود في Firestore.
 * @param {string} collectionName - اسم المجموعة.
 * @param {string} userId - معرف المستخدم الحالي.
 * @param {string} documentId - معرف المستند لتحديثه.
 * @param {Object} data - البيانات المراد تحديثها.
 * @param {boolean} isPublic - هل المستند في مجموعة عامة.
 * @returns {Promise<boolean>} - يعيد true عند النجاح، false عند الفشل.
 */
export async function updateDocument(collectionName, userId, documentId, data, isPublic = false) {
    if (!userId) {
        console.error("Firestore Error: userId is required to update a document.");
        return false;
    }
    try {
        const docRef = doc(db, buildDocumentPath(collectionName, userId, documentId, isPublic));
        await updateDoc(docRef, data);
        console.log("Document successfully updated!");
        return true;
    } catch (error) {
        console.error("Error updating document:", error);
        return false;
    }
}

/**
 * حذف مستند من Firestore.
 * @param {string} collectionName - اسم المجموعة.
 * @param {string} userId - معرف المستخدم الحالي.
 * @param {string} documentId - معرف المستند لحذفه.
 * @param {boolean} isPublic - هل المستند في مجموعة عامة.
 * @returns {Promise<boolean>} - يعيد true عند النجاح، false عند الفشل.
 */
export async function deleteDocument(collectionName, userId, documentId, isPublic = false) {
    if (!userId) {
        console.error("Firestore Error: userId is required to delete a document.");
        return false;
    }
    try {
        const docRef = doc(db, buildDocumentPath(collectionName, userId, documentId, isPublic));
        await deleteDoc(docRef);
        console.log("Document successfully deleted!");
        return true;
    } catch (error) {
        console.error("Error deleting document:", error);
        return false;
    }
}

/**
 * جلب جميع المستندات من مجموعة أو مستندات مطابقة لمعايير استعلام معينة.
 * @param {string} collectionName - اسم المجموعة.
 * @param {string} userId - معرف المستخدم الحالي.
 * @param {boolean} isPublic - هل المجموعة عامة.
 * @param {Array<Array>} [conditions=[]] - مصفوفة من الشروط (مثال: [['field', '==', 'value']]).
 * @returns {Promise<Array<Object>>} - يعيد مصفوفة من المستندات.
 */
export async function getCollection(collectionName, userId, isPublic = false, conditions = []) {
    if (!userId) {
        console.error("Firestore Error: userId is required to get a collection.");
        return [];
    }
    try {
        const colRef = collection(db, buildCollectionPath(collectionName, userId, isPublic));
        let q = query(colRef);

        conditions.forEach(cond => {
            if (cond.length === 3) {
                q = query(q, where(cond[0], cond[1], cond[2]));
            }
        });

        const querySnapshot = await getDocs(q);
        const docs = [];
        querySnapshot.forEach((docSnap) => {
            docs.push({ id: docSnap.id, ...docSnap.data() });
        });
        return docs;
    } catch (error) {
        console.error("Error getting collection:", error);
        return [];
    }
}


/**
 * الاستماع للتغييرات في مجموعة معينة في الوقت الفعلي (Realtime).
 * @param {string} collectionName - اسم المجموعة.
 * @param {string} userId - معرف المستخدم الحالي.
 * @param {function} callback - دالة يتم استدعاؤها مع البيانات المحدثة.
 * @param {boolean} isPublic - هل المجموعة عامة.
 * @param {Array<Array>} [conditions=[]] - مصفوفة من الشروط.
 * @returns {function} - دالة لإلغاء الاشتراك في المستمع.
 */
export function listenToCollection(collectionName, userId, callback, isPublic = false, conditions = []) {
    if (!userId) {
        console.error("Firestore Error: userId is required to listen to a collection.");
        return () => {}; // return an empty unsubscribe function
    }
    const colRef = collection(db, buildCollectionPath(collectionName, userId, isPublic));
    let q = query(colRef);

    conditions.forEach(cond => {
        if (cond.length === 3) {
            q = query(q, where(cond[0], cond[1], cond[2]));
        }
    });

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const docs = [];
        querySnapshot.forEach((docSnap) => {
            docs.push({ id: docSnap.id, ...docSnap.data() });
        });
        callback(docs);
    }, (error) => {
        console.error("Error listening to collection:", error);
    });

    return unsubscribe; // أعد دالة لإلغاء الاشتراك
}

/**
 * الاستماع للتغييرات في مستند واحد في الوقت الفعلي (Realtime).
 * @param {string} collectionName - اسم المجموعة.
 * @param {string} userId - معرف المستخدم الحالي.
 * @param {string} documentId - معرف المستند.
 * @param {function} callback - دالة يتم استدعاؤها مع البيانات المحدثة.
 * @param {boolean} isPublic - هل المستند في مجموعة عامة.
 * @returns {function} - دالة لإلغاء الاشتراك في المستمع.
 */
export function listenToDocument(collectionName, userId, documentId, callback, isPublic = false) {
    if (!userId) {
        console.error("Firestore Error: userId is required to listen to a document.");
        return () => {}; // return an empty unsubscribe function
    }
    const docRef = doc(db, buildDocumentPath(collectionName, userId, documentId, isPublic));

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback({ id: docSnap.id, ...docSnap.data() });
        } else {
            console.log(`Document ${documentId} does not exist in ${collectionName}`);
            callback(null);
        }
    }, (error) => {
        console.error("Error listening to document:", error);
    });

    return unsubscribe; // أعد دالة لإلغاء الاشتراك
}


