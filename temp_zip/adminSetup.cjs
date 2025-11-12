// adminSetup.cjs

const admin = require("firebase-admin");
const serviceAccount = require("./my-clever-crm-admin-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function setupUsers() {
  try {
    // Chris Lahage - Master Admin
    const chrisUser = await admin.auth().createUser({
      email: "chris@speedycreditrepair.com",
      password: "Master123",
      displayName: "Chris Lahage",
    });

    await admin.auth().setCustomUserClaims(chrisUser.uid, {
      role: "admin",
      tier: "master",
      permissions: [
        "full_access",
        "analytics",
        "admin_dashboard",
        "user_management",
      ],
    });

    // clahage@gmail.com - Master Admin clone
    const clahageUser = await admin.auth().createUser({
      email: "clahage@gmail.com",
      password: "Master123",
      displayName: "Chris Lahage",
    });

    await admin.auth().setCustomUserClaims(clahageUser.uid, {
      role: "admin",
      tier: "master",
      permissions: [
        "full_access",
        "analytics",
        "admin_dashboard",
        "user_management",
      ],
    });

    // Laurie - Elevated User
    const laurieUser = await admin.auth().createUser({
      email: "laurie@speedycreditrepair.com",
      password: "Master123",
      displayName: "Laurie",
    });

    await admin.auth().setCustomUserClaims(laurieUser.uid, {
      role: "user",
      tier: "elevated",
      permissions: [
        "limited_access",
        "client_view",
        "note_edit",
      ],
    });

    console.log("✅ Users created and custom claims assigned.");
  } catch (error) {
    console.error("❌ Error creating users or setting claims:", error);
  }
}

setupUsers();
