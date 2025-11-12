const serviceAccount = require('./serviceAccountKey.json');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function processAllCalls() {
  const calls = await db.collection('aiReceptionistCalls').get();
  let count = 0;
  
  for (const doc of calls.docs) {
    const data = doc.data();
    if (!data.processed) {
      const name = data['Intake Form: May I ask for your full name so I may help you with better accuracy?'] || 'Unknown';
      const email = (data['Intake Form: Can you say or spell out your email address please?'] || '').toLowerCase().replace(/\s+at\s+/g, '@').replace(/\s+dot\s+/g, '.').replace(/\s+/g, '');
      const phone = (data.caller || '').replace(/\D/g, '');
      
      await db.collection('contacts').add({
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' '),
        fullName: name,
        email: email,
        phone: phone,
        category: 'lead',
        leadScore: 7,
        source: 'ai-receptionist',
        createdAt: new Date()
      });
      
      await doc.ref.update({processed: true});
      console.log(`Processed: ${name} - ${phone}`);
      count++;
    }
  }
  console.log(`\nDone! Processed ${count} calls`);
}

processAllCalls();