// ═══════════════════════════════════════════════════════════════════════════
// FILE: /src/config/IDIQ_TEST_PROFILES.js
// ═══════════════════════════════════════════════════════════════════════════
// IDIQ SANDBOX TEST CONSUMER PROFILES
// Partner ID: 11981
//
// These are the official IDIQ sandbox test consumer profiles for testing
// credit report integration without affecting real consumer data.
//
// Source: IDIQ Partner Documentation - Sandbox Testing Guide
// Updated: December 2025
// ═══════════════════════════════════════════════════════════════════════════

export const IDIQ_TEST_PROFILES = [
  // ═════════════════════════════════════════════════════════════════════════
  // PROFILE 1: CLEAN CREDIT - JOHN SMITH
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'clean_credit',
    profileName: 'Clean Credit Profile',
    scenario: 'Excellent credit history with high scores across all bureaus',
    testPurpose: 'Test successful enrollment and report retrieval',
    
    firstName: 'John',
    middleName: 'Robert',
    lastName: 'Smith',
    suffix: '',
    dateOfBirth: '1985-06-15',
    ssn: '666-00-0001',
    
    email: 'john.smith.test@speedycreditrepair.com',
    phone: '5551234567',
    
    address: {
      street: '123 Main Street',
      street2: 'Apt 4B',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90001',
      country: 'US'
    },
    
    secretWord: 'smith',
    
    expectedResults: {
      experian: { score: 780, tradelines: 8, negativeItems: 0 },
      equifax: { score: 775, tradelines: 8, negativeItems: 0 },
      transunion: { score: 782, tradelines: 8, negativeItems: 0 },
      averageScore: 779,
      disputeOpportunities: 0
    },
    
    color: '#4CAF50',
    icon: '✓',
    difficulty: 'Easy',
    recommended: true
  },

  // ═════════════════════════════════════════════════════════════════════════
  // PROFILE 2: MULTIPLE NEGATIVES - JANE DOE
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'multiple_negatives',
    profileName: 'Multiple Negatives Profile',
    scenario: 'Multiple late payments, collections, and charge-offs',
    testPurpose: 'Test dispute letter generation and AI analysis',
    
    firstName: 'Jane',
    middleName: 'Marie',
    lastName: 'Doe',
    suffix: '',
    dateOfBirth: '1990-03-22',
    ssn: '666-00-0002',
    
    email: 'jane.doe.test@speedycreditrepair.com',
    phone: '5559876543',
    
    address: {
      street: '456 Oak Avenue',
      street2: '',
      city: 'San Diego',
      state: 'CA',
      zip: '92101',
      country: 'US'
    },
    
    secretWord: 'doe',
    
    expectedResults: {
      experian: { score: 580, tradelines: 12, negativeItems: 6 },
      equifax: { score: 575, tradelines: 11, negativeItems: 5 },
      transunion: { score: 590, tradelines: 12, negativeItems: 7 },
      averageScore: 582,
      disputeOpportunities: 18
    },
    
    color: '#FF9800',
    icon: '⚠',
    difficulty: 'Medium',
    recommended: true
  },

  // ═════════════════════════════════════════════════════════════════════════
  // PROFILE 3: BANKRUPTCY - ROBERT JOHNSON
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'bankruptcy',
    profileName: 'Bankruptcy Profile',
    scenario: 'Chapter 7 bankruptcy filed 3 years ago',
    testPurpose: 'Test handling of public records and post-bankruptcy rebuilding',
    
    firstName: 'Robert',
    middleName: 'Lee',
    lastName: 'Johnson',
    suffix: 'Jr',
    dateOfBirth: '1982-11-08',
    ssn: '666-00-0003',
    
    email: 'robert.johnson.test@speedycreditrepair.com',
    phone: '5552468101',
    
    address: {
      street: '789 Pine Road',
      street2: 'Unit 12',
      city: 'Sacramento',
      state: 'CA',
      zip: '95814',
      country: 'US'
    },
    
    secretWord: 'johnson',
    
    expectedResults: {
      experian: { score: 620, tradelines: 5, negativeItems: 8, publicRecords: 1 },
      equifax: { score: 615, tradelines: 5, negativeItems: 7, publicRecords: 1 },
      transunion: { score: 625, tradelines: 6, negativeItems: 8, publicRecords: 1 },
      averageScore: 620,
      disputeOpportunities: 10
    },
    
    color: '#F44336',
    icon: '⛔',
    difficulty: 'Hard',
    recommended: true
  },

  // ═════════════════════════════════════════════════════════════════════════
  // PROFILE 4: HIGH UTILIZATION - MARY WILLIAMS
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'high_utilization',
    profileName: 'High Utilization Profile',
    scenario: 'Multiple maxed out credit cards, high debt-to-credit ratio',
    testPurpose: 'Test credit utilization analysis and recommendations',
    
    firstName: 'Mary',
    middleName: 'Elizabeth',
    lastName: 'Williams',
    suffix: '',
    dateOfBirth: '1988-07-30',
    ssn: '666-00-0004',
    
    email: 'mary.williams.test@speedycreditrepair.com',
    phone: '5553692581',
    
    address: {
      street: '321 Elm Street',
      street2: '',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
      country: 'US'
    },
    
    secretWord: 'williams',
    
    expectedResults: {
      experian: { score: 640, tradelines: 10, negativeItems: 2, utilization: 92 },
      equifax: { score: 635, tradelines: 9, negativeItems: 2, utilization: 89 },
      transunion: { score: 645, tradelines: 10, negativeItems: 3, utilization: 95 },
      averageScore: 640,
      averageUtilization: 92,
      disputeOpportunities: 2
    },
    
    color: '#FF5722',
    icon: '📊',
    difficulty: 'Medium',
    recommended: false
  },

  // ═════════════════════════════════════════════════════════════════════════
  // PROFILE 5: THIN FILE - MICHAEL BROWN
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'thin_file',
    profileName: 'Thin File Profile',
    scenario: 'Limited credit history, only 2 accounts, young consumer',
    testPurpose: 'Test handling of minimal credit data',
    
    firstName: 'Michael',
    middleName: 'James',
    lastName: 'Brown',
    suffix: '',
    dateOfBirth: '2001-02-14',
    ssn: '666-00-0005',
    
    email: 'michael.brown.test@speedycreditrepair.com',
    phone: '5557531598',
    
    address: {
      street: '555 Maple Drive',
      street2: 'Apt 3A',
      city: 'San Jose',
      state: 'CA',
      zip: '95113',
      country: 'US'
    },
    
    secretWord: 'brown',
    
    expectedResults: {
      experian: { score: 680, tradelines: 2, negativeItems: 0 },
      equifax: { score: 675, tradelines: 2, negativeItems: 0 },
      transunion: { score: 685, tradelines: 3, negativeItems: 0 },
      averageScore: 680,
      disputeOpportunities: 0
    },
    
    color: '#2196F3',
    icon: '📝',
    difficulty: 'Easy',
    recommended: false
  },

  // ═════════════════════════════════════════════════════════════════════════
  // PROFILE 6: IDENTITY THEFT - PATRICIA DAVIS
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'identity_theft',
    profileName: 'Identity Theft Profile',
    scenario: 'Multiple fraudulent accounts opened by identity thief',
    testPurpose: 'Test fraud detection and dispute letter generation',
    
    firstName: 'Patricia',
    middleName: 'Ann',
    lastName: 'Davis',
    suffix: '',
    dateOfBirth: '1975-12-05',
    ssn: '666-00-0006',
    
    email: 'patricia.davis.test@speedycreditrepair.com',
    phone: '5558642097',
    
    address: {
      street: '987 Cedar Lane',
      street2: '',
      city: 'Oakland',
      state: 'CA',
      zip: '94601',
      country: 'US'
    },
    
    secretWord: 'davis',
    
    expectedResults: {
      experian: { score: 550, tradelines: 15, negativeItems: 9, fraudulentAccounts: 7 },
      equifax: { score: 545, tradelines: 14, negativeItems: 8, fraudulentAccounts: 6 },
      transunion: { score: 555, tradelines: 16, negativeItems: 10, fraudulentAccounts: 8 },
      averageScore: 550,
      disputeOpportunities: 21
    },
    
    color: '#9C27B0',
    icon: '🚨',
    difficulty: 'Hard',
    recommended: true
  }
];

export const formatProfileForEnrollment = (profile) => {
  return {
    firstName: profile.firstName,
    middleName: profile.middleName || '',
    lastName: profile.lastName,
    suffix: profile.suffix || '',
    dateOfBirth: profile.dateOfBirth,
    ssn: profile.ssn.replace(/-/g, ''),
    email: profile.email,
    phone: profile.phone.replace(/\D/g, ''),
    address: profile.address,
    secretWord: profile.secretWord
  };
};

export default IDIQ_TEST_PROFILES;