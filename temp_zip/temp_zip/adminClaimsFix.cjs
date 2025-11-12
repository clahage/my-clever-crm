// adminClaimsFix.js - Fix SpeedyCRM Admin Access
// SAVE THIS FILE AS: adminClaimsFix.js in your project root folder
// Run this script to set correct custom claims for admin users

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./my-clever-crm-admin-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://my-clever-crm-default-rtdb.firebaseapp.com"
});

async function fixAdminAccess() {
  try {
    console.log('🚀 Starting admin access fix...');
    
    // Define admin emails
    const adminEmails = [
      'chris@speedycreditrepair.com',
      'clahage@gmail.com'
    ];
    
    // Define master admin custom claims
    const masterAdminClaims = {
      role: "admin",
      tier: "master",
      permissions: [
        "full_access",
        "analytics", 
        "admin_dashboard",
        "user_management",
        "system_config",
        "reports",
        "bulk_operations"
      ],
      isAdmin: true,
      isMaster: true,
      createdAt: new Date().toISOString()
    };
    
    // Process each admin email
    for (const email of adminEmails) {
      try {
        console.log(`\n📧 Processing: ${email}`);
        
        // Get user by email
        const userRecord = await admin.auth().getUserByEmail(email);
        console.log(`✅ Found user: ${userRecord.uid}`);
        
        // Set custom claims
        await admin.auth().setCustomUserClaims(userRecord.uid, {
          ...masterAdminClaims,
          email: email
        });
        
        console.log(`🎯 Custom claims set for: ${email}`);
        
        // Verify claims were set
        const updatedUser = await admin.auth().getUser(userRecord.uid);
        console.log(`🔍 Verified claims:`, updatedUser.customClaims);
        
        // Also update Firestore user document
        const db = admin.firestore();
        await db.collection('users').doc(userRecord.uid).set({
          uid: userRecord.uid,
          email: email,
          displayName: email === 'chris@speedycreditrepair.com' ? 'Chris Lahage' : 'Chris Lahage',
          role: 'master_admin',
          tier: 'master',
          permissions: masterAdminClaims.permissions,
          status: 'active',
          accountCreated: admin.firestore.FieldValue.serverTimestamp(),
          lastLogin: admin.firestore.FieldValue.serverTimestamp(),
          loginCount: 1,
          createdBy: 'system',
          lastModifiedBy: 'system',
          lastModified: admin.firestore.FieldValue.serverTimestamp(),
          notes: 'Master Admin Account'
        }, { merge: true });
        
        console.log(`✅ Firestore document updated for: ${email}`);
        
      } catch (userError) {
        console.error(`❌ Error processing ${email}:`, userError.message);
      }
    }
    
    console.log('\n🎉 Admin access fix complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Log out of SpeedyCRM completely');
    console.log('2. Log back in using Google Sign-In');
    console.log('3. Check that your role shows as "master_admin"');
    console.log('4. Verify access to Admin UI Panel');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    // Clean up
    process.exit(0);
  }
}

// Run the fix
fixAdminAccess();