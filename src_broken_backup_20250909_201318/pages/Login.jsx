import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { auth, googleProvider } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  signInWithRedirect, 
  getRedirectResult, 
  signInWithPopup,
  onAuthStateChanged 
} from "firebase/auth";
import BrandLogo from "@/components/BrandLogo";
import { useTheme } from '@/theme/ThemeProvider';

// --- ON-SCREEN BEACON ---
const Beacon = () => (
  <div style={{background:'#fef9c3',color:'#92400e',padding:'4px 0',textAlign:'center',fontWeight:'bold',letterSpacing:1,marginBottom:12,zIndex:9999}}>
    [BEACON: Login.jsx]
  </div>
);

const env = import.meta.env || {};
const fbEnv = {
  API_KEY: env.VITE_FIREBASE_API_KEY,
  AUTH_DOMAIN: env.VITE_FIREBASE_AUTH_DOMAIN,
  PROJECT_ID: env.VITE_FIREBASE_PROJECT_ID,
  STORAGE_BUCKET: env.VITE_FIREBASE_STORAGE_BUCKET,
  MSG_SENDER_ID: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  APP_ID: env.VITE_FIREBASE_APP_ID,
};

const mask = (v) => {
  if (!v) return "(missing)";
  if (v.length <= 7) return v;
  return `${v.slice(0,3)}…${v.slice(-3)}`;
};

const allPresent = Object.entries(fbEnv).every(([k, v]) => !!v);
const isLocalhost = window.location.hostname === "localhost";

export default function Login() {
  const { user, loading, claims } = useAuth();
  const lastAuthError = claims?._lastAuthError;
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  const [busy, setBusy] = useState(false);
  const [showEnv, setShowEnv] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [status, setStatus] = useState("Idle");
  const [unauthDomain, setUnauthDomain] = useState(false);
  const [error, setError] = useState("");
  const { theme, setTheme } = useTheme();

  // If already signed in (including after Google redirect), leave /login immediately
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) navigate("/dashboard", { replace: true });
    });
    return () => unsub();
  }, [navigate]);

  // Handle Google redirect result
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          setStatus(`Google OK: ${result.user.uid}`);
          navigate('/dashboard');
        }
      })
      .catch((error) => {
        console.error('Redirect sign-in error:', error);
        setError('Failed to complete Google sign-in');
        setStatus(`Google redirect error: ${error?.code || error?.message}`);
      });
  }, [navigate]);

  const handleGoogle = async () => {
    try {
      console.log("[Login] Google button clicked");
      setBusy(true);
      setError("");
      
      if (isLocalhost) {
        setStatus("Opening Google popup…");
        const { user } = await signInWithPopup(auth, googleProvider);
        setStatus(`Google OK (popup): ${user.uid}`);
        navigate(from, { replace: true });
      } else {
        setStatus("Redirecting to Google…");
        await signInWithRedirect(auth, googleProvider);
      }
    } catch (e) {
      console.error("[Login] Google sign-in error:", e);
      setStatus(`Google error: ${e?.code || e?.message}`);
      setError('Failed to start Google sign-in');
      if (e?.code === "auth/unauthorized-domain" || (typeof e?.message === "string" && e.message.includes("UNAUTHORIZED_DOMAIN"))) {
        setUnauthDomain(true);
      }
    } finally {
      setBusy(false);
    }
  };

  const doEmail = async () => {
    setStatus("Signing in with email…");
    setError("");
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, pw);
      setStatus(`Email OK: ${user.uid}`);
      navigate(from, { replace: true });
    } catch (e) {
      console.error("[Auth] Email error:", e);
      setStatus(`Email error: ${e?.code || e?.message}`);
      setError('Failed to sign in with email');
      if (e?.code === "auth/unauthorized-domain" || (typeof e?.message === "string" && e.message.includes("UNAUTHORIZED_DOMAIN"))) {
        setUnauthDomain(true);
      }
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Checking session…</div>;

  // Show already signed in hint
  const alreadySignedIn = auth.currentUser;

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        {import.meta.env.DEV && <Beacon />}
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded shadow p-8 flex flex-col items-center">
          <BrandLogo variant="client" theme={theme === 'dark' ? 'dark' : 'light'} style={{height:48, marginBottom:16}} />
          <button
            className="mb-4 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          {status && (
            <div className="mt-3 text-sm rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
              {status}
            </div>
          )}
          {unauthDomain && (
            <div className="mt-3 text-sm rounded-md border-2 border-amber-400 bg-amber-50 px-3 py-2 text-amber-900 font-semibold">
              This domain isn't authorized. Add <code className="px-1 py-0.5 bg-amber-100 rounded">{window.location.host}</code> in
              <span className="font-semibold"> Firebase → Authentication → Settings → Authorized domains</span>.
            </div>
          )}
          {lastAuthError && (
            <div className="mt-3 text-sm rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-800">
              <strong>Sign-in error:</strong> <code>{lastAuthError.code}</code>
              <div className="mt-1">{lastAuthError.message}</div>
            </div>
          )}
          {alreadySignedIn && (
            <div className="mt-3 text-xs text-green-700 text-center">
              Already signed in as <span className="font-semibold">{alreadySignedIn.email}</span> &rarr; <span className="underline">Continue</span>
            </div>
          )}
          <button
            onClick={handleGoogle}
            disabled={busy}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-slate-800 shadow-sm disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 533.5 544.3" aria-hidden="true">
              <g><path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.2H272v95h146.9c-6.3 34.1-25.1 62.9-53.6 82.2l87 67.7c50.7-46.8 80.2-115.7 80.2-194.7z"/><path fill="#34A853" d="M272 544.3c72.6 0 133.7-24.1 178.3-65.5l-87-67.7c-24.2 16.2-55.1 25.8-91.3 25.8-70.2 0-129.7-47.4-151-111.1l-89.5 69.2c44.7 88.1 137.2 149.3 240.5 149.3z"/><path fill="#FBBC05" d="M121 325.8c-10.2-30.1-10.2-62.7 0-92.8l-89.5-69.2C7.1 210.1 0 242.5 0 278.4c0 35.9 7.1 68.3 31.5 114.6l89.5-69.2z"/><path fill="#EA4335" d="M272 107.7c39.6 0 75.1 13.6 103.1 40.2l77.4-77.4C405.7 24.1 344.6 0 272 0 168.7 0 76.2 61.2 31.5 163.8l89.5 69.2C142.3 155.1 201.8 107.7 272 107.7z"/></g>
            </svg>
            Continue with Google
          </button>
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"/></div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs uppercase tracking-wide text-slate-400">or</span>
            </div>
          </div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="name@company.com"
            autoComplete="email"
          />
          <label className="mt-3 block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="mt-1 w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <button
            onClick={doEmail}
            disabled={busy}
            className="mt-5 w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 shadow-sm disabled:opacity-60"
          >
            Sign in with Email
          </button>
          <p className="mt-4 text-center text-xs text-slate-500">
            Trouble signing in? Clear site data (Application → Storage) and try again.
          </p>
        </div>
      </div>

      {/* Env Debug Toggle and Panel (unchanged, keep at root for dev) */}
      <button
        onClick={() => setShowEnv(s => !s)}
        className="fixed right-3 bottom-3 px-2.5 py-1.5 rounded-md z-[9999] shadow bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
      >
        Env
      </button>
      {showEnv && (
        <div
          style={{
            position: "fixed",
            right: 12,
            bottom: 52,
            width: 360,
            maxWidth: "90vw",
            padding: 12,
            borderRadius: 8,
            border: "1px solid #e5e5e5",
            background: "#fafafa",
            boxShadow: "0 2px 14px rgba(0,0,0,0.18)",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 12,
            color: "#222",
            zIndex: 9999
          }}
        >
          <div style={{marginBottom: 8, fontWeight: 600}}>
            Firebase Env Status: {allPresent ? "✅ Configured" : "❌ Missing keys"}
          </div>
          <div>PROJECT_ID: <code>{fbEnv.PROJECT_ID || "(missing)"}</code></div>
          <div>AUTH_DOMAIN: <code>{fbEnv.AUTH_DOMAIN || "(missing)"}</code></div>
          <div>API_KEY: <code>{mask(fbEnv.API_KEY)}</code></div>
          <div>STORAGE_BUCKET: <code>{fbEnv.STORAGE_BUCKET || "(missing)"}</code></div>
          <div>MSG_SENDER_ID: <code>{mask(fbEnv.MSG_SENDER_ID || "")}</code></div>
          <div>APP_ID: <code>{mask(fbEnv.APP_ID || "")}</code></div>
          <div style={{marginTop:8, opacity:0.8}}>
            Tip: Values come from <code>.env</code>. After edits, run a fresh build & deploy.
          </div>
        </div>
      )}
    </>
  );
}