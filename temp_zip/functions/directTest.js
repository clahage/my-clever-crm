const admin = require('firebase-admin');

// Initialize without service account (will use default credentials)
admin.initializeApp();

async function createTestDoc() {
  try {
    console.log('Creating test document directly...');
    const docRef = await admin.firestore()
      .collection('aiReceptionistCalls')
      .add({
        username: 'DirectTest',
        caller: '+15555551234',
        transcript: 'Hi my name is Direct Test',
        timestamp: new Date().toISOString(),
        processed: false
      });
    console.log('Document created:', docRef.id);
    console.log('Check function logs in 10 seconds...');
  } catch (error) {
    console.error('Error:', error.message);
  }
  setTimeout(() => process.exit(0), 2000);
}

createTestDoc();
