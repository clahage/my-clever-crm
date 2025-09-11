import React, { useEffect, useState } from "react";
import { auth, googleProvider } from "../lib/firebase";
import {
  signInWithRedirect,
  getRedirectResult,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const isLocalhost = window.location.hostname === "localhost";

export default function LoginTest() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("Idle");

  // Reflect current auth state (helps after redirects)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u && !status.startsWith("Email OK") && !status.startsWith("Google OK")) {
        setStatus(`Signed in: ${u.uid}`);
      }
    });
    return () => unsub();
  }, [status]);

  // Complete Google redirect if returning from accounts.google.com
  useEffect(() => {
    (async () => {
      try {
        console.log("[Auth] Checking redirect result…");
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log("[Auth] Redirect completed:", result.user.uid);
          setStatus(`Google OK: ${result.user.uid}`);
        } else {
          console.log("[Auth] No redirect result (this is normal on first load).");
        }
      } catch (e) {
        console.error("[Auth] Google redirect error:", e);
        setStatus(`Google redirect error: ${e?.code || e?.message || String(e)}`);
      }
    })();
  }, []);

  const doGoogle = async () => {
    try {
      if (isLocalhost) {
        setStatus("Opening Google popup…");
        const { user } = await signInWithPopup(auth, googleProvider);
        setStatus(`Google OK (popup): ${user.uid}`);
      } else {
        setStatus("Redirecting to Google…");
        await signInWithRedirect(auth, googleProvider);
      }
    } catch (e) {
      console.error("[Auth] Google sign-in start error:", e);
      setStatus(`Google sign-in error: ${e?.code || e?.message || String(e)}`);
    }
  };

  const doEmail = async () => {
    setStatus("Signing in with email…");
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, pw);
      setStatus(`Email OK: ${user.uid}`);
    } catch (e) {
      console.error("[Auth] Email/pw login failed:", e);
      setStatus(`Email error: ${e?.code || e?.message || String(e)}`);
    }
  };

  const doSignOut = async () => {
    try {
      await signOut(auth);
      setStatus("Signed out");
    } catch (e) {
      console.error("[Auth] Sign out error:", e);
      setStatus(`Sign out error: ${e?.code || e?.message || String(e)}`);
    }
  };

  return (
    <div style={{ maxWidth: 440, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>Login Test</h1>
      <p><strong>Status:</strong> {status}</p>
      <p><strong>Auth User:</strong> {user ? (user.email || user.uid) : "None"}</p>

      <hr style={{ margin: "16px 0" }} />

      <button onClick={doGoogle} style={{ padding: "10px 14px", marginBottom: 16 }}>
        {isLocalhost ? "Continue with Google (Popup on localhost)" : "Continue with Google (Redirect)"}
      </button>

      <div style={{ display: "grid", gap: 8 }}>
        <input
          type="email"
          placeholder="test@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 8 }}
        />
        <input
          type="password"
          placeholder="••••••••"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          style={{ padding: 8 }}
        />
        <button onClick={doEmail} style={{ padding: "10px 14px" }}>
          Sign in with Email/Password
        </button>
      </div>

      <button onClick={doSignOut} style={{ padding: "10px 14px", marginTop: 16 }}>
        Sign out
      </button>
    </div>
  );
}
