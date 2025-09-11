import { auth, googleProvider } from "@/lib/firebase";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";

// Use popup on localhost, redirect elsewhere. Toggle for testing if desired.
const FORCE_POPUP = false;

// Begin Google sign-in (decides popup vs redirect)
export async function signInWithGoogle() {
  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");
  if (FORCE_POPUP || isLocal) {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user ?? null;
  }
  await signInWithRedirect(auth, googleProvider);
  return null;
}

// Handle redirect result exactly once at app start
let _redirectHandled = false;
export async function handleGoogleRedirectOnce() {
  if (_redirectHandled) return null;
  _redirectHandled = true;
  try {
    const result = await getRedirectResult(auth);
    return result?.user ?? null;
  } catch (e) {
    // swallow; login page will show friendly message if needed
    return null;
  }
}
