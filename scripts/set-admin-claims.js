// scripts/set-admin-claims.js
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../src/lib/firebase";

async function setAdminClaims() {
  const fn = httpsCallable(getFunctions(app), "setUserClaims");
  try {
    const res = await fn({ email: "Contact@speedycreditrepair.com", claims: { role: "admin" } });
    console.log("[Admin Setup] Claims assignment result:", res.data);
    alert("Admin claims set for Contact@speedycreditrepair.com");
  } catch (err) {
    console.error("[Admin Setup] Error setting claims:", err);
    alert("Failed to set admin claims: " + (err.message || err));
  }
}

setAdminClaims();
