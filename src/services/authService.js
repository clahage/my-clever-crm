import { auth } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    throw new Error(error.message || 'Google sign-in failed');
  }
}

export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
}

export async function register(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message || 'Registration failed');
  }
}

export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(error.message || 'Logout failed');
  }
}

export function subscribeAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}
