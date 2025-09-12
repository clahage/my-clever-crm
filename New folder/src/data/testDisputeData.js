// Comprehensive test data for Advanced Dispute Management System

// 1. Sample Clients Array
export const testClients = [
  {
    clientId: 'C1001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '555-123-4567',
    address: '123 Main St, Springfield, IL',
    dateJoined: '2025-01-10',
    creditScores: {
      initial: { Experian: 580, Equifax: 575, TransUnion: 590 },
      current: { Experian: 670, Equifax: 665, TransUnion: 680 }
    },
    serviceAgreementStatus: 'Active',
    monthlyFee: 99,
    totalDisputes: 5
  },
  {
    clientId: 'C1002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@email.com',
    phone: '555-234-5678',
    address: '456 Oak Ave, Chicago, IL',
    dateJoined: '2025-02-15',
    creditScores: {
      initial: { Experian: 620, Equifax: 615, TransUnion: 630 },
      current: { Experian: 710, Equifax: 705, TransUnion: 720 }
    },
    serviceAgreementStatus: 'Active',
    monthlyFee: 89,
    totalDisputes: 3
  },
  {
    clientId: 'C1003',
    firstName: 'Carlos',
    lastName: 'Martinez',
    email: 'carlos.m@email.com',
    phone: '555-345-6789',
    address: '789 Pine Rd, Aurora, IL',
    dateJoined: '2025-03-05',
    creditScores: {
      initial: { Experian: 540, Equifax: 535, TransUnion: 550 },
      current: { Experian: 600, Equifax: 595, TransUnion: 610 }
    },
    serviceAgreementStatus: 'Paused',
    monthlyFee: 79,
    totalDisputes: 7
  },
  {
    clientId: 'C1004',
    firstName: 'Emily',
    lastName: 'Nguyen',
    email: 'emily.nguyen@email.com',
    phone: '555-456-7890',
    address: '321 Maple St, Joliet, IL',
    dateJoined: '2025-01-22',
    creditScores: {
      initial: { Experian: 690, Equifax: 685, TransUnion: 700 },
      current: { Experian: 740, Equifax: 735, TransUnion: 750 }
    },
    serviceAgreementStatus: 'Active',
    monthlyFee: 109,
    totalDisputes: 2
  },
  {
    clientId: 'C1005',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@email.com',
    phone: '555-567-8901',
    address: '654 Cedar Ave, Peoria, IL',
    dateJoined: '2025-04-10',
    creditScores: {
      initial: { Experian: 610, Equifax: 605, TransUnion: 620 },
      current: { Experian: 660, Equifax: 655, TransUnion: 670 }
    },
    serviceAgreementStatus: 'Active',
    monthlyFee: 95,
    totalDisputes: 4
  },
  {
    clientId: 'C1006',
    firstName: 'Ava',
    lastName: 'Patel',
    email: 'ava.patel@email.com',
    phone: '555-678-9012',
    address: '987 Birch Blvd, Naperville, IL',
    dateJoined: '2025-05-18',
    creditScores: {
      initial: { Experian: 570, Equifax: 565, TransUnion: 580 },
      current: { Experian: 630, Equifax: 625, TransUnion: 640 }
    },
    serviceAgreementStatus: 'Active',
    monthlyFee: 99,
    totalDisputes: 6
  },
  {
    clientId: 'C1007',
    firstName: 'David',
    lastName: 'Lee',
    email: 'david.lee@email.com',
    phone: '555-789-0123',
    address: '246 Spruce St, Elgin, IL',
    dateJoined: '2025-06-01',
    creditScores: {
      initial: { Experian: 650, Equifax: 645, TransUnion: 660 },
      current: { Experian: 700, Equifax: 695, TransUnion: 710 }
    },
    serviceAgreementStatus: 'Active',
    monthlyFee: 105,
    totalDisputes: 3
  },
  {
    clientId: 'C1008',
    firstName: 'Sophia',
    lastName: 'Kim',
    email: 'sophia.kim@email.com',
    phone: '555-890-1234',
    address: '135 Willow Dr, Schaumburg, IL',
    dateJoined: '2025-02-28',
    creditScores: {
      initial: { Experian: 600, Equifax: 595, TransUnion: 610 },
      current: { Experian: 670, Equifax: 665, TransUnion: 680 }
    },
    serviceAgreementStatus: 'Active',
    monthlyFee: 99,
    totalDisputes: 5
  },
  {
    clientId: 'C1009',
    firstName: 'Brian',
    lastName: 'Wilson',
    email: 'brian.wilson@email.com',
    phone: '555-901-2345',
    address: '753 Aspen Ct, Rockford, IL',
    dateJoined: '2025-03-12',
    creditScores: {
      initial: { Experian: 580, Equifax: 575, TransUnion: 590 },
      current: { Experian: 640, Equifax: 635, TransUnion: 650 }
    },
    serviceAgreementStatus: 'Active',
    monthlyFee: 89,
    totalDisputes: 8
  },
  {
    clientId: 'C1010',
    firstName: 'Olivia',
    lastName: 'Garcia',
    email: 'olivia.garcia@email.com',
    phone: '555-012-3456',
    address: '369 Elm St, Bloomington, IL',
    dateJoined: '2025-04-25',
    creditScores: {
      initial: { Experian: 620, Equifax: 615, TransUnion: 630 },
      current: { Experian: 690, Equifax: 685, TransUnion: 700 }
    },
    serviceAgreementStatus: 'Active',
    monthlyFee: 99,
    totalDisputes: 2
  }
];

// 2. Sample Disputes Array
export const testDisputes = [
  {
    disputeId: 'D2001',
    clientId: 'C1001',
    bureau: 'Experian',
    disputeType: 'Late Payment',
    status: 'New',
    priority: 'High',
    account: 'Visa Platinum',
    amount: 1200,
    dateCreated: '2025-02-01',
    timeline: [
      { date: '2025-02-01', status: 'New', note: 'Dispute created.' },
      { date: '2025-02-05', status: 'Letter Sent', note: 'Initial dispute letter sent.' }
    ],
    documents: ['initial_letter.pdf'],
    letters: ['L3001']
  },
  {
    disputeId: 'D2002',
    clientId: 'C1002',
    bureau: 'Equifax',
    disputeType: 'Charge Off',
    status: 'In Progress',
    priority: 'Medium',
    account: 'Auto Loan',
    amount: 8500,
    dateCreated: '2025-03-10',
    timeline: [
      { date: '2025-03-10', status: 'New', note: 'Dispute created.' },
      { date: '2025-03-15', status: 'Letter Sent', note: 'Initial dispute letter sent.' },
      { date: '2025-03-25', status: 'Response Received', note: 'Bureau responded.' }
    ],
    documents: ['response.pdf'],
    letters: ['L3002']
  },
  {
    disputeId: 'D2003',
    clientId: 'C1003',
    bureau: 'TransUnion',
    disputeType: 'Collection Account',
    status: 'Investigating',
    priority: 'High',
    account: 'Medical Collection',
    amount: 450,
    dateCreated: '2025-04-02',
    timeline: [
      { date: '2025-04-02', status: 'New', note: 'Dispute created.' },
      { date: '2025-04-07', status: 'Letter Sent', note: 'Initial dispute letter sent.' },
      { date: '2025-04-15', status: 'Investigating', note: 'Bureau investigating.' }
    ],
    documents: ['medical_bill.pdf'],
    letters: ['L3003']
  },
  // ...more disputes (30-40 total, covering all bureaus, types, statuses, priorities)...
];

// 3. Sample Credit Reports Array
export const testCreditReports = [
  {
    clientId: 'C1001',
    reports: [
      {
        month: '2025-01',
        scores: { Experian: 580, Equifax: 575, TransUnion: 590 },
        accounts: [
          { account: 'Visa Platinum', status: 'Late Payment', balance: 1200 },
          { account: 'Auto Loan', status: 'Current', balance: 8500 }
        ],
        utilization: 0.45
      },
      {
        month: '2025-02',
        scores: { Experian: 600, Equifax: 595, TransUnion: 610 },
        accounts: [
          { account: 'Visa Platinum', status: 'Disputed', balance: 1200 },
          { account: 'Auto Loan', status: 'Current', balance: 8500 }
        ],
        utilization: 0.42
      },
      // ...more months, showing progression...
    ]
  },
  // ...more clients, each with 6-7 months of reports...
];

// 4. Sample Letters Array
export const testLetters = [
  {
    letterId: 'L3001',
    type: 'Initial Dispute',
    template: 'Dear {{bureau}}, I am writing to dispute ...',
    sendDate: '2025-02-05',
    responseDate: '2025-02-15',
    effectiveness: 'Success',
    mergeFields: ['clientName', 'account', 'amount']
  },
  {
    letterId: 'L3002',
    type: 'Follow-up',
    template: 'Dear {{bureau}}, This is a follow-up regarding ...',
    sendDate: '2025-03-15',
    responseDate: '2025-03-25',
    effectiveness: 'Pending',
    mergeFields: ['clientName', 'account', 'amount']
  },
  // ...more letters, various types and templates...
];

// 5. Export functions
export function importTestClients() {
  return [...testClients];
}
export function importTestDisputes() {
  return [...testDisputes];
}
export function importTestReports() {
  return [...testCreditReports];
}
export function importTestLetters() {
  return [...testLetters];
}
export function clearAllTestData() {
  // This would clear all arrays if used in a test environment
  testClients.length = 0;
  testDisputes.length = 0;
  testCreditReports.length = 0;
  testLetters.length = 0;
}
