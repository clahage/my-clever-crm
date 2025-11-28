#!/usr/bin/env node

/**
 * Setup Test Data Script
 *
 * This script creates comprehensive test data for SpeedyCRM testing
 * Run with: node scripts/setupTestData.js
 *
 * Creates:
 * - Test contacts (various scenarios)
 * - Test email templates
 * - Test pipeline deals
 * - Test invoices
 * - Test tasks
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
// Make sure to set GOOGLE_APPLICATION_CREDENTIALS environment variable
// or provide service account key path
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  console.log('\nPlease set GOOGLE_APPLICATION_CREDENTIALS environment variable');
  console.log('Example: export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"');
  process.exit(1);
}

const db = admin.firestore();

// Test data templates
const testContacts = [
  {
    firstName: 'Test',
    lastName: 'Contact001',
    email: 'test.contact001@example.com',
    phone: '555-001-0001',
    address: '123 Test Street',
    city: 'Test City',
    state: 'CA',
    zip: '90210',
    source: 'manual-test',
    notes: 'Test contact for manual entry testing',
    tags: ['test', 'manual-entry'],
    leadScore: 7
  },
  {
    firstName: 'Full',
    lastName: 'Contact002',
    email: 'full.contact002@example.com',
    phone: '555-001-0002',
    address: '456 Test Avenue',
    city: 'Test City',
    state: 'CA',
    zip: '90210',
    dateOfBirth: '1990-01-15',
    company: 'Test Company Inc',
    title: 'Test Manager',
    website: 'https://testcompany.com',
    source: 'manual-test',
    notes: 'Test contact with all fields populated',
    tags: ['test', 'full-profile'],
    leadScore: 9
  },
  {
    firstName: 'High',
    lastName: 'Quality',
    email: 'high.quality@business-domain.com',
    phone: '555-001-0003',
    address: '789 Premium Street',
    city: 'Elite City',
    state: 'NY',
    zip: '10001',
    company: 'Premium Business LLC',
    title: 'CEO',
    source: 'website',
    notes: 'High-quality lead for AI analysis testing',
    tags: ['test', 'high-quality', 'ai-analysis'],
    leadScore: 10
  },
  {
    firstName: 'Low',
    lastName: 'Quality',
    email: 'lowquality@gmail.com',
    phone: '000-000-0000',
    source: 'form-spam',
    notes: 'Low-quality contact for AI filtering testing',
    tags: ['test', 'low-quality', 'ai-analysis'],
    leadScore: 1
  },
  {
    firstName: 'Email',
    lastName: 'TestContact',
    email: 'email.test@example.com',
    phone: '555-001-0005',
    source: 'email-capture',
    notes: 'Test contact for email workflow testing',
    tags: ['test', 'email-workflows'],
    leadScore: 6
  },
  {
    firstName: 'Pipeline',
    lastName: 'TestDeal',
    email: 'pipeline.test@example.com',
    phone: '555-001-0006',
    company: 'Pipeline Test Corp',
    source: 'sales-team',
    notes: 'Test contact for pipeline workflow testing',
    tags: ['test', 'pipeline'],
    leadScore: 8
  },
  {
    firstName: 'IDIQ',
    lastName: 'Enrollment',
    email: 'idiq.test@example.com',
    phone: '555-001-0007',
    address: '321 Credit Street',
    city: 'Credit City',
    state: 'TX',
    zip: '75001',
    dateOfBirth: '1985-05-20',
    ssn: '000-00-0000', // Test SSN
    source: 'manual-test',
    notes: 'Test contact for IDIQ enrollment testing',
    tags: ['test', 'idiq', 'credit-monitoring'],
    leadScore: 7
  },
  {
    firstName: 'CSV',
    lastName: 'Import001',
    email: 'csv.import001@example.com',
    phone: '555-002-0001',
    source: 'csv-import',
    notes: 'Test contact from CSV import',
    tags: ['test', 'csv-import'],
    leadScore: 5
  },
  {
    firstName: 'API',
    lastName: 'Integration',
    email: 'api.test@example.com',
    phone: '555-003-0001',
    source: 'api-integration',
    notes: 'Test contact from API integration',
    tags: ['test', 'api'],
    leadScore: 6
  },
  {
    firstName: 'Duplicate',
    lastName: 'TestContact',
    email: 'duplicate.test@example.com',
    phone: '555-004-0001',
    source: 'manual-test',
    notes: 'Test contact for duplicate detection',
    tags: ['test', 'duplicate-detection'],
    leadScore: 5
  }
];

const emailTemplates = [
  {
    id: 'welcome-email',
    name: 'Welcome Email',
    subject: 'Welcome to SpeedyCRM!',
    body: `
Hi {{firstName}},

Welcome to SpeedyCRM! We're excited to have you on board.

This is a test email template for testing email workflows.

Best regards,
The SpeedyCRM Team
    `.trim(),
    type: 'transactional',
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'qualification-email',
    name: 'Qualification Email',
    subject: 'Let\'s discuss your needs',
    body: `
Hi {{firstName}},

Thank you for your interest in our services. I'd love to learn more about your needs and how we can help.

Would you be available for a brief call this week?

Best regards,
{{senderName}}
    `.trim(),
    type: 'sales',
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'invoice-email',
    name: 'Invoice Email',
    subject: 'Invoice #{{invoiceNumber}}',
    body: `
Hi {{firstName}},

Your invoice is ready. Please find the details below:

Amount: ${{amount}}
Due Date: {{dueDate}}

View invoice: {{invoiceLink}}

Thank you!
    `.trim(),
    type: 'transactional',
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

const pipelineStages = [
  { id: 'new-contact', name: 'New Contact', order: 0, probability: 10 },
  { id: 'qualification', name: 'Qualification', order: 1, probability: 30 },
  { id: 'presentation', name: 'Presentation', order: 2, probability: 50 },
  { id: 'proposal', name: 'Proposal', order: 3, probability: 70 },
  { id: 'negotiation', name: 'Negotiation', order: 4, probability: 85 },
  { id: 'contract', name: 'Contract', order: 5, probability: 95 },
  { id: 'won', name: 'Won', order: 6, probability: 100 },
  { id: 'lost', name: 'Lost', order: 7, probability: 0 }
];

// Helper functions
const createTimestamp = () => admin.firestore.FieldValue.serverTimestamp();

const generateId = () => {
  return db.collection('_dummy').doc().id;
};

// Create test contacts
async function createTestContacts() {
  console.log('\n📋 Creating test contacts...');

  const batch = db.batch();
  const contactIds = [];

  for (const contact of testContacts) {
    const contactId = generateId();
    contactIds.push(contactId);

    const contactData = {
      ...contact,
      id: contactId,
      roles: ['prospect'],
      status: 'active',
      createdAt: createTimestamp(),
      updatedAt: createTimestamp(),
      createdBy: 'test-script'
    };

    batch.set(db.collection('contacts').doc(contactId), contactData);
    console.log(`  ✅ Contact: ${contact.firstName} ${contact.lastName}`);
  }

  await batch.commit();
  console.log(`✅ Created ${testContacts.length} test contacts`);

  return contactIds;
}

// Create email templates
async function createEmailTemplates() {
  console.log('\n📧 Creating email templates...');

  const batch = db.batch();

  for (const template of emailTemplates) {
    batch.set(db.collection('emailTemplates').doc(template.id), template);
    console.log(`  ✅ Template: ${template.name}`);
  }

  await batch.commit();
  console.log(`✅ Created ${emailTemplates.length} email templates`);
}

// Create pipeline stages
async function createPipelineStages() {
  console.log('\n🎯 Creating pipeline stages...');

  const batch = db.batch();

  for (const stage of pipelineStages) {
    batch.set(db.collection('pipelineStages').doc(stage.id), {
      ...stage,
      createdAt: createTimestamp()
    });
    console.log(`  ✅ Stage: ${stage.name}`);
  }

  await batch.commit();
  console.log(`✅ Created ${pipelineStages.length} pipeline stages`);
}

// Create test pipeline deals
async function createTestDeals(contactIds) {
  console.log('\n💼 Creating test pipeline deals...');

  const deals = [
    {
      contactId: contactIds[5], // Pipeline TestDeal
      contactName: 'Pipeline TestDeal',
      stage: 'new-contact',
      dealValue: 2400,
      probability: 30,
      temperature: 'warm',
      source: 'test-script',
      notes: 'Test deal for pipeline workflow testing'
    },
    {
      contactId: contactIds[2], // High Quality
      contactName: 'High Quality',
      stage: 'qualification',
      dealValue: 5000,
      probability: 50,
      temperature: 'hot',
      source: 'test-script',
      notes: 'High-value test deal'
    },
    {
      contactId: contactIds[1], // Full Contact002
      contactName: 'Full Contact002',
      stage: 'proposal',
      dealValue: 3600,
      probability: 70,
      temperature: 'hot',
      source: 'test-script',
      notes: 'Test deal in proposal stage'
    }
  ];

  const batch = db.batch();

  for (const deal of deals) {
    const dealId = generateId();
    const dealData = {
      ...deal,
      id: dealId,
      status: 'open',
      createdAt: createTimestamp(),
      updatedAt: createTimestamp(),
      createdBy: 'test-script'
    };

    batch.set(db.collection('pipelineDeals').doc(dealId), dealData);
    console.log(`  ✅ Deal: ${deal.contactName} - ${deal.stage}`);
  }

  await batch.commit();
  console.log(`✅ Created ${deals.length} test deals`);
}

// Create test invoices
async function createTestInvoices(contactIds) {
  console.log('\n💰 Creating test invoices...');

  const invoices = [
    {
      contactId: contactIds[1],
      contactName: 'Full Contact002',
      amount: 2400,
      status: 'pending',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      items: [
        { description: 'Credit Repair Services', quantity: 1, price: 2400 }
      ],
      notes: 'Test invoice for email workflow testing'
    },
    {
      contactId: contactIds[2],
      contactName: 'High Quality',
      amount: 5000,
      status: 'paid',
      paidAt: new Date().toISOString(),
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      items: [
        { description: 'Premium Services', quantity: 1, price: 5000 }
      ],
      notes: 'Paid test invoice'
    }
  ];

  const batch = db.batch();

  for (const invoice of invoices) {
    const invoiceId = generateId();
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const invoiceData = {
      ...invoice,
      id: invoiceId,
      invoiceNumber,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp(),
      createdBy: 'test-script'
    };

    batch.set(db.collection('invoices').doc(invoiceId), invoiceData);
    console.log(`  ✅ Invoice: ${invoiceNumber} - ${invoice.contactName}`);
  }

  await batch.commit();
  console.log(`✅ Created ${invoices.length} test invoices`);
}

// Create test tasks
async function createTestTasks(contactIds) {
  console.log('\n✅ Creating test tasks...');

  const tasks = [
    {
      contactId: contactIds[2],
      contactName: 'High Quality',
      title: 'Schedule kickoff call',
      description: 'Schedule initial kickoff call with new client',
      priority: 'high',
      status: 'pending',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      taskType: 'onboarding'
    },
    {
      contactId: contactIds[2],
      contactName: 'High Quality',
      title: 'Collect required documents',
      description: 'Request and collect all required documents from client',
      priority: 'high',
      status: 'pending',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      taskType: 'onboarding'
    },
    {
      contactId: contactIds[5],
      contactName: 'Pipeline TestDeal',
      title: 'Follow up on proposal',
      description: 'Check if prospect has reviewed the proposal',
      priority: 'medium',
      status: 'pending',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      taskType: 'sales'
    }
  ];

  const batch = db.batch();

  for (const task of tasks) {
    const taskId = generateId();
    const taskData = {
      ...task,
      id: taskId,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp(),
      createdBy: 'test-script'
    };

    batch.set(db.collection('tasks').doc(taskId), taskData);
    console.log(`  ✅ Task: ${task.title}`);
  }

  await batch.commit();
  console.log(`✅ Created ${tasks.length} test tasks`);
}

// Clean up existing test data
async function cleanupTestData() {
  console.log('\n🧹 Cleaning up existing test data...');

  const collections = ['contacts', 'emailTemplates', 'pipelineStages', 'pipelineDeals', 'invoices', 'tasks'];

  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName)
      .where('createdBy', '==', 'test-script')
      .get();

    if (!snapshot.empty) {
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`  ✅ Cleaned ${snapshot.size} documents from ${collectionName}`);
    }
  }

  // Also clean email templates by ID
  const templateIds = emailTemplates.map(t => t.id);
  for (const templateId of templateIds) {
    await db.collection('emailTemplates').doc(templateId).delete().catch(() => {});
  }

  // Clean pipeline stages by ID
  const stageIds = pipelineStages.map(s => s.id);
  for (const stageId of stageIds) {
    await db.collection('pipelineStages').doc(stageId).delete().catch(() => {});
  }

  console.log('✅ Cleanup complete');
}

// Main execution
async function main() {
  console.log('🚀 SpeedyCRM Test Data Setup Script');
  console.log('====================================');

  const args = process.argv.slice(2);
  const cleanup = args.includes('--cleanup');
  const skipCleanup = args.includes('--no-cleanup');

  try {
    if (cleanup) {
      await cleanupTestData();
      console.log('\n✅ Cleanup complete!');
      process.exit(0);
    }

    if (!skipCleanup) {
      await cleanupTestData();
    }

    const contactIds = await createTestContacts();
    await createEmailTemplates();
    await createPipelineStages();
    await createTestDeals(contactIds);
    await createTestInvoices(contactIds);
    await createTestTasks(contactIds);

    console.log('\n🎉 Test data setup complete!');
    console.log('\n📊 Summary:');
    console.log(`  - ${testContacts.length} test contacts`);
    console.log(`  - ${emailTemplates.length} email templates`);
    console.log(`  - ${pipelineStages.length} pipeline stages`);
    console.log(`  - 3 test pipeline deals`);
    console.log(`  - 2 test invoices`);
    console.log(`  - 3 test tasks`);
    console.log('\n✅ You can now start testing!');
    console.log('\n💡 To cleanup test data, run: node scripts/setupTestData.js --cleanup');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error setting up test data:', error);
    process.exit(1);
  }
}

// Run main function
main();
