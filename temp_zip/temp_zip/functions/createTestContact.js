const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createTestContact() {
  try {
    const testContact = {
      firstName: 'AutoTest',
      lastName: 'User-' + Date.now(),
      emails: [{address: 'clahage@gmail.com', isPrimary: true}],
      phones: [{number: '555-0199', isPrimary: true}],
      leadSource: 'ai-receptionist',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const ref = await db.collection('contacts').add(testContact);
    console.log('✅ Test contact created:', ref.id);
    console.log('⏰ Wait 15 minutes for scheduled email (processWorkflowStages runs every 15 min)');
    console.log('📧 Check clahage@gmail.com for email');
    console.log('🔍 Check Firebase Console → Firestore → emailWorkflows collection');
    console.log('');
    console.log('Next scheduled run times:');
    const now = new Date();
    const minutes = now.getMinutes();
    const nextRun = new Date(now);
    nextRun.setMinutes(Math.ceil(minutes / 15) * 15, 0, 0);
    console.log('  Next run: ' + nextRun.toLocaleTimeString());
    nextRun.setMinutes(nextRun.getMinutes() + 15);
    console.log('  Following run: ' + nextRun.toLocaleTimeString());
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

createTestContact();
