/**
 * Add Leads to Database
 *
 * PRODUCTION SCRIPT
 *
 * This script adds real leads to your database.
 * DO NOT use fake/demo data in production.
 *
 * Usage: node scripts/addSampleLeads.js
 *
 * IMPORTANT: Modify this script to import real lead data from:
 * - CSV files
 * - JSON files
 * - External APIs
 * - Database migrations
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const { firebaseConfig } = require('../src/firebaseConfig');

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Lead data structure
 *
 * Replace this array with your actual lead import logic.
 * Consider importing from:
 * - CSV file: Use csv-parser or papaparse
 * - JSON file: Use fs.readFileSync
 * - API: Use fetch or axios
 * - Database: Use your database client
 */
const leadsToImport = [
  // Example structure (replace with real data):
  // {
  //   name: 'Real Lead Name',
  //   temperature: 'Hot',        // Hot, Warm, Cold
  //   score: 85,                 // Lead score (0-100)
  //   intro: 'Description',      // Lead description/notes
  //   email: 'email@domain.com', // Contact email
  //   phone: '123-456-7890',     // Contact phone
  // }
];

/**
 * Import leads into database
 */
(async () => {
  try {
    if (leadsToImport.length === 0) {
      console.warn('⚠️  No leads to import. Please add real lead data to this script.');
      console.info('📋 Instructions:');
      console.info('   1. Prepare your lead data (CSV, JSON, or API)');
      console.info('   2. Update the leadsToImport array in this script');
      console.info('   3. Run: node scripts/addSampleLeads.js');
      process.exit(0);
    }

    console.log(`📥 Importing ${leadsToImport.length} leads...`);

    for (const lead of leadsToImport) {
      // Validate required fields
      if (!lead.name || !lead.email) {
        console.warn(`⚠️  Skipping invalid lead: ${JSON.stringify(lead)}`);
        continue;
      }

      await addDoc(collection(db, 'contacts'), {
        ...lead,
        category: 'Lead',
        urgency: lead.temperature?.toLowerCase() || 'medium',
        createdAt: new Date(),
        status: 'new',
        assignedTo: null,
        notes: []
      });

      console.log(`✅ Added: ${lead.name}`);
    }

    console.log('✅ Lead import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing leads:', error);
    process.exit(1);
  }
})();

// Example: Import from CSV file
// const fs = require('fs');
// const csv = require('csv-parser');
//
// const leadsToImport = [];
// fs.createReadStream('path/to/leads.csv')
//   .pipe(csv())
//   .on('data', (row) => {
//     leadsToImport.push({
//       name: row.name,
//       email: row.email,
//       phone: row.phone,
//       temperature: row.temperature,
//       score: parseInt(row.score),
//       intro: row.intro
//     });
//   })
//   .on('end', async () => {
//     // Run import...
//   });
