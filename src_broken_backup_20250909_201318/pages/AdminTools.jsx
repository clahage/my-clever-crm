import React from "react";
import { setClaimsForUser } from "../utils/setMyClaims";
import { auth } from "../lib/firebase";

export default function AdminTools() {
  const giveIdiq = async () => {
    await setClaimsForUser({ email: "chris@speedycreditrepair.com", claims: { idiq: true } });
    await auth.currentUser.getIdToken(true); // refresh token
    alert("IDIQ claim set. Refresh the page.");
  };
  return (
    <div style={{ padding: 24 }}>
      <h1>Admin Tools</h1>
      <button onClick={giveIdiq}>Grant IDIQ to chris@speedycreditrepair.com</button>
    </div>
  );
}
