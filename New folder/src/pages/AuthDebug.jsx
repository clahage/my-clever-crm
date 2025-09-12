import React, { useEffect, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  inMemoryPersistence,
  onAuthStateChanged,
} from "firebase/auth";

// IMPORTANT: import from the same single source used in the app
import { auth } from "../lib/firebase";

function testStorage(name, fn) {
  try { fn(); return `${name}: OK`; } catch (e) { return `${name}: FAIL - ${e?.message || e}`; }
}

export default function AuthDebug() {
  const [info, setInfo] = useState({});
  const [persistenceResult, setPersistenceResult] = useState("Not tested");

  useEffect(() => {
    const details = {};

    // App instances
    details.appsCount = getApps().length;

    // Origin & document info
    details.locationHref = window.location.href;
    details.origin = window.location.origin;
    details.userAgent = navigator.userAgent;
    details.cookieEnabled = navigator.cookieEnabled;

    // Storage availability
    details.storageChecks = [
      testStorage("localStorage", () => localStorage.setItem("__t", "1")),
      testStorage("sessionStorage", () => sessionStorage.setItem("__t", "1")),
      testStorage("IndexedDB", () => indexedDB.open("__idbTest")),
    ];

    // Headers meta (basic signal)
    const metas = Array.from(document.querySelectorAll("meta[http-equiv]"))
      .map(m => `${m.httpEquiv}: ${m.content}`);
    details.metaHttpEquiv = metas;

    setInfo(details);

    const unsub = onAuthStateChanged(auth, (u) => {
      setInfo(prev => ({ ...prev, authUser: u ? (u.email || u.uid) : null }));
    });
    return () => unsub();
  }, []);

  async function tryPersistence() {
    try {
      await setPersistence(auth, indexedDBLocalPersistence);
      setPersistenceResult("indexedDBLocalPersistence: OK");
    } catch {
      try {
        await setPersistence(auth, browserLocalPersistence);
        setPersistenceResult("browserLocalPersistence: OK");
      } catch {
        await setPersistence(auth, inMemoryPersistence);
        setPersistenceResult("inMemoryPersistence: OK (fallback)");
      }
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>Auth Debug</h1>
      <pre style={{ background: "#f5f5f5", padding: 16, borderRadius: 8 }}>
        {JSON.stringify(info, null, 2)}
      </pre>
      <button onClick={tryPersistence} style={{ padding: "10px 14px", marginTop: 12 }}>
        Test Persistence (IDB → Local → Memory)
      </button>
      <p>{persistenceResult}</p>
    </div>
  );
}
