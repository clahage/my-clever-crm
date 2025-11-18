import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from "react";
import { onAuthStateChanged, getRedirectResult, signInWithRedirect, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { handleGoogleRedirectOnce } from "@/auth/google";

const AuthContext = createContext({
  user: null,
  loading: true,
  claims: {},
  signInWithGoogleRedirect: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [claims, setClaims] = useState({});
  const handledRedirectRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    // One-time: handle Google redirect result so we don't bounce back to /login
    if (!handledRedirectRef.current) {
      handledRedirectRef.current = true;
      getRedirectResult(auth).catch((e) => {
        // swallow expected "no redirect" errors
        console.debug("[Auth] getRedirectResult:", e?.code || e?.message || e);
      });
    }
    // Now watch the auth state and only then finish initializing.
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u ?? null);
      if (u) {
        try {
          const tokenResult = await u.getIdTokenResult(true);
          setClaims((c) => ({ ...tokenResult.claims }));
        } catch (err) {
          console.error("[Auth] token/claims error:", err);
          setClaims({});
        }
      } else {
        setClaims({});
      }
      setBootstrapped(true);
    });
    return () => unsub();
  }, []);

  const signInWithGoogleRedirect = async () => {
    await signInWithRedirect(auth, googleProvider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const value = useMemo(
    () => ({ user, loading: !bootstrapped, claims, signInWithGoogleRedirect, signOut }),
    [user, bootstrapped, claims]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
