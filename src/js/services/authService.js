import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../config/firebaseConfig.js';

const auth = getAuth(app);

export async function loginUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}
