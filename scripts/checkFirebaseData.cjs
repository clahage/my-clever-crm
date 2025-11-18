// Check Firebase collections for existing data
const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://speedycrm-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

async function checkCollections() {
  const collections = [
    'clients',
    'leads',
    'invoices',
    'disputes',
    'creditScores',
    'tasks',
    'activities',
    'contacts',
    'campaigns',
    'users'
  ];

  console.log('🔍 Checking Firebase Collections...\n');

  for (const collectionName of collections) {
    try {
      const snapshot = await db.collection(collectionName).get();
      const count = snapshot.size;
      
      console.log(`📦 ${collectionName}: ${count} documents`);
      
      if (count > 0 && count <= 5) {
        // Show sample data for small collections
        console.log(`   Sample docs:`);
        snapshot.docs.slice(0, 3).forEach(doc => {
          const data = doc.data();
          console.log(`   - ${doc.id}:`, JSON.stringify(data).substring(0, 100) + '...');
        });
      }
      
    } catch (error) {
      console.error(`❌ Error checking ${collectionName}:`, error.message);
    }
  }
  
  console.log('\n✅ Collection check complete');
  process.exit(0);
}

checkCollections().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
