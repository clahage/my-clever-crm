// scripts/addSampleLeads.js
// Run with: node scripts/addSampleLeads.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const { firebaseConfig } = require('../src/firebaseConfig');

// Initialize Firebase app (NO analytics)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const leads = [
  { name: 'John Smith', temperature: 'Hot', score: 92, intro: 'Looking for fast credit repair.' },
  { name: 'Jane Doe', temperature: 'Warm', score: 78, intro: 'Interested in business credit.' },
  { name: 'Carlos Rivera', temperature: 'Cold', score: 55, intro: 'Just browsing options.' },
  { name: 'Emily Chen', temperature: 'Hot', score: 88, intro: 'Needs urgent help with credit.' },
  { name: 'Priya Patel', temperature: 'Warm', score: 73, intro: 'Wants to improve score for mortgage.' },
  { name: 'Mike Johnson', temperature: 'Cold', score: 60, intro: 'DIY credit repair.' },
  { name: 'Sara Lee', temperature: 'Hot', score: 95, intro: 'Referred by a friend.' },
  { name: 'David Kim', temperature: 'Warm', score: 80, intro: 'Interested in credit monitoring.' },
  { name: 'Anna Ivanova', temperature: 'Cold', score: 50, intro: 'Exploring services.' },
  { name: 'Mohammed Ali', temperature: 'Hot', score: 90, intro: 'Needs help after bankruptcy.' },
  { name: 'Linda Green', temperature: 'Warm', score: 76, intro: 'Preparing to buy a car.' },
  { name: 'Chris Brown', temperature: 'Cold', score: 58, intro: 'Wants to learn more.' },
  { name: 'Olivia White', temperature: 'Hot', score: 93, intro: 'Urgent: denied for loan.' },
  { name: 'Ethan Black', temperature: 'Warm', score: 75, intro: 'Looking for business funding.' },
  { name: 'Sophia Blue', temperature: 'Cold', score: 62, intro: 'Just checking prices.' },
  { name: 'Lucas Gray', temperature: 'Hot', score: 89, intro: 'Needs credit for new home.' },
  { name: 'Mia Gold', temperature: 'Warm', score: 79, intro: 'Interested in family plan.' },
  { name: 'Noah Silver', temperature: 'Cold', score: 57, intro: 'DIY but open to help.' },
  { name: 'Ava Violet', temperature: 'Hot', score: 91, intro: 'Needs fast results.' },
  { name: 'William Red', temperature: 'Warm', score: 77, intro: 'Preparing for business loan.' }
];

(async () => {
  for (const lead of leads) {
    await addDoc(collection(db, 'contacts'), {
      ...lead,
      category: 'Lead',
      urgency: lead.temperature.toLowerCase(),
      createdAt: new Date()
    });
  }
  console.log('Sample leads added.');
  process.exit(0);
})();
