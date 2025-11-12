// functions/fixAIContacts.js
const serviceAccount = require('./serviceAccountKey.json');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixAIContacts() {
  const contacts = await db.collection('contacts').where('source', 'in', ['ai-receptionist', 'AI Receptionist']).get();
  
  for (const doc of contacts.docs) {
    const data = doc.data();
    await doc.ref.update({
      roles: ['lead', 'contact'],
      primaryRole: 'lead',
      category: 'lead',
      leadScore: 7,
      urgencyLevel: 'high',
      lifecycleStatus: 'active',
      pipelineStage: 'new',
      conversionProbability: 65,
      nextBestAction: 'Call within 24 hours',
      tags: ['ai-qualified', 'hot-lead', 'needs-followup'],
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Updated ${data.fullName || data.firstName} to proper lead status`);
  }
  
  console.log('AI contacts fixed! Check your Pipeline page.');
}

fixAIContacts();