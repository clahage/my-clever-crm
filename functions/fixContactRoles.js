// functions/fixContactRoles.js
const serviceAccount = require('./serviceAccountKey.json');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixContacts() {
  const contacts = await db.collection('contacts').where('source', '==', 'ai-receptionist').get();
  
  for (const doc of contacts.docs) {
    await doc.ref.update({
      category: 'lead',
      primaryRole: 'lead',
      roles: ['lead'],
      leadScore: 7,
      urgencyLevel: 'high',
      lifecycleStatus: 'new'
    });
    console.log(`Updated ${doc.data().fullName} to lead`);
  }
  console.log('Done! Check your Pipeline page now.');
}

fixContacts();