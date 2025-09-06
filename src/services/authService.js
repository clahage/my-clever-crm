import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';

export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    console.log('[Google Sign-in] Button clicked, calling signInWithRedirect');
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error('[Google Sign-in] signInWithRedirect error:', error);
    throw new Error(error.message || 'Google sign-in failed');
  }
}

export async function handleGoogleRedirect() {
  console.log('handleGoogleRedirect called');
  try {
    const result = await getRedirectResult(auth);
    console.log('Redirect result:', result);
    if (result && result.user) {
      console.log('User found from redirect:', result.user.email);
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('Error handling redirect:', error);
    return null;
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
