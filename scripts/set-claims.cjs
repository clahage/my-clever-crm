// scripts/set-claims.js
const admin = require("firebase-admin");
const path = require("path");

// Load service account from project root: C:\SCR Project\my-clever-crm\serviceAccount.json
const serviceAccount = require(path.join(__dirname, "..", "serviceAccount.json"));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

(async () => {
  const email = "chris@speedycreditrepair.com"; // target user
  const user = await admin.auth().getUserByEmail(email);

  // Merge idiq:true with any existing custom claims
  const existing = user.customClaims || {};
  const newClaims = { ...existing, idiq: true };

  await admin.auth().setCustomUserClaims(user.uid, newClaims);
  console.log("✅ Set claims for", email, "uid:", user.uid, "->", newClaims);
  console.log("ℹ️  Now refresh the user token in the browser (sign out/in or getIdToken(true)).");
  process.exit(0);
})().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
