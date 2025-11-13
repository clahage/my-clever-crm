/**
 * PRODUCTION DATA STRUCTURES FOR DISPUTE MANAGEMENT
 *
 * This file contains empty data structures for the dispute management system.
 * DO NOT use fake/demo data in production.
 *
 * These are templates showing the expected data structure.
 * Populate with real client data from your database.
 */

// Client data structure
export const clientDataStructure = {
  clientId: '',                // Unique client ID
  firstName: '',               // Client first name
  lastName: '',                // Client last name
  email: '',                   // Client email
  phone: '',                   // Client phone number
  address: '',                 // Full address
  dateJoined: '',              // Date joined (YYYY-MM-DD)
  creditScores: {
    initial: {
      Experian: null,          // Initial Experian score
      Equifax: null,           // Initial Equifax score
      TransUnion: null         // Initial TransUnion score
    },
    current: {
      Experian: null,          // Current Experian score
      Equifax: null,           // Current Equifax score
      TransUnion: null         // Current TransUnion score
    }
  },
  serviceAgreementStatus: '',  // Active, Paused, Cancelled
  monthlyFee: 0,               // Monthly service fee
  totalDisputes: 0             // Total number of disputes
};

// Dispute data structure
export const disputeDataStructure = {
  disputeId: '',               // Unique dispute ID
  clientId: '',                // Associated client ID
  bureau: '',                  // Experian, Equifax, TransUnion
  disputeType: '',             // Late Payment, Charge Off, Collection Account, etc.
  status: '',                  // New, In Progress, Investigating, Resolved, Rejected
  priority: '',                // High, Medium, Low
  account: '',                 // Account name/description
  amount: 0,                   // Disputed amount
  dateCreated: '',             // Date created (YYYY-MM-DD)
  timeline: [],                // Array of status updates
  documents: [],               // Array of document filenames
  letters: []                  // Array of associated letter IDs
};

// Credit report data structure
export const creditReportDataStructure = {
  clientId: '',                // Associated client ID
  reports: [{
    month: '',                 // Report month (YYYY-MM)
    scores: {
      Experian: null,
      Equifax: null,
      TransUnion: null
    },
    accounts: [{
      account: '',             // Account name
      status: '',              // Current, Late Payment, Charge Off, etc.
      balance: 0               // Account balance
    }],
    utilization: 0             // Credit utilization ratio
  }]
};

// Letter template structure
export const letterTemplateStructure = {
  letterId: '',                // Unique letter ID
  type: '',                    // Initial Dispute, Follow-up, Escalation, etc.
  template: '',                // Letter template with merge fields
  sendDate: '',                // Date sent (YYYY-MM-DD)
  responseDate: '',            // Date response received (YYYY-MM-DD)
  effectiveness: '',           // Success, Pending, Failed
  mergeFields: []              // Array of merge field names
};

// Export empty arrays - populate these from your database
export const testClients = [];
export const testDisputes = [];
export const testCreditReports = [];
export const testLetters = [];

// Helper functions for data operations
export function importTestClients() {
  console.warn('No test data available. Please fetch real data from database.');
  return [];
}

export function importTestDisputes() {
  console.warn('No test data available. Please fetch real data from database.');
  return [];
}

export function importTestReports() {
  console.warn('No test data available. Please fetch real data from database.');
  return [];
}

export function importTestLetters() {
  console.warn('No test data available. Please fetch real data from database.');
  return [];
}

export function clearAllTestData() {
  console.warn('clearAllTestData() called - this function is for development only');
  // In production, use proper database deletion methods
}

// Instructions for developers:
// 1. Fetch real data from Firebase/Firestore
// 2. Use the structure definitions above as a guide
// 3. Never commit actual client data to version control
// 4. Use environment variables for sensitive data
// 5. Implement proper data validation before saving
