// ===================================================================
// seedResourceData.js
// Path: /src/utils/seedResourceData.js
// 
// Seed Data for Resource Library Hub
// Populates the system with sample resources, templates, courses, etc.
// 
// Usage: 
// import { seedAllResourceData } from './utils/seedResourceData';
// seedAllResourceData();
// 
// Created: November 10, 2025
// ===================================================================

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// ===================================================================
// SAMPLE RESOURCES
// ===================================================================

const sampleResources = [
  {
    title: 'FCRA Compliance Guide 2025',
    description: 'Comprehensive guide to Fair Credit Reporting Act compliance for credit repair professionals.',
    category: 'Compliance',
    type: 'Document',
    tags: ['fcra', 'compliance', 'regulations', 'guide'],
    fileUrl: 'https://example.com/fcra-guide.pdf',
    fileName: 'FCRA_Compliance_Guide_2025.pdf',
    fileType: 'application/pdf',
    fileSize: 2500000,
    views: 245,
    downloads: 89,
    favorites: 34,
    rating: 4.8,
    ratingCount: 12,
    aiGenerated: false,
  },
  {
    title: 'Effective Dispute Strategy Training Video',
    description: 'Learn proven strategies for crafting effective credit dispute letters that get results.',
    category: 'Training',
    type: 'Video',
    tags: ['disputes', 'strategy', 'training', 'video'],
    fileUrl: 'https://example.com/dispute-training.mp4',
    fileName: 'Dispute_Strategy_Training.mp4',
    fileType: 'video/mp4',
    fileSize: 125000000,
    views: 432,
    downloads: 67,
    favorites: 89,
    rating: 4.9,
    ratingCount: 34,
    aiGenerated: false,
  },
  {
    title: 'Credit Bureau Contact Information Sheet',
    description: 'Up-to-date contact information for all three major credit bureaus including dispute addresses.',
    category: 'Tools',
    type: 'Document',
    tags: ['bureaus', 'contacts', 'reference', 'equifax', 'experian', 'transunion'],
    fileUrl: 'https://example.com/bureau-contacts.pdf',
    fileName: 'Bureau_Contact_Information.pdf',
    fileType: 'application/pdf',
    fileSize: 500000,
    views: 789,
    downloads: 234,
    favorites: 156,
    rating: 5.0,
    ratingCount: 45,
    aiGenerated: false,
  },
  {
    title: 'Client Onboarding Checklist',
    description: 'Complete checklist for onboarding new credit repair clients, ensuring no steps are missed.',
    category: 'Sales',
    type: 'Template',
    tags: ['onboarding', 'checklist', 'clients', 'process'],
    fileUrl: 'https://example.com/onboarding-checklist.docx',
    fileName: 'Client_Onboarding_Checklist.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 350000,
    views: 567,
    downloads: 178,
    favorites: 92,
    rating: 4.7,
    ratingCount: 28,
    aiGenerated: false,
  },
  {
    title: 'Credit Score Calculation Explained',
    description: 'Detailed breakdown of how credit scores are calculated and weighted by different bureaus.',
    category: 'Training',
    type: 'Document',
    tags: ['credit-score', 'calculation', 'education', 'fico'],
    fileUrl: 'https://example.com/score-calculation.pdf',
    fileName: 'Credit_Score_Calculation.pdf',
    fileType: 'application/pdf',
    fileSize: 1800000,
    views: 654,
    downloads: 201,
    favorites: 87,
    rating: 4.6,
    ratingCount: 31,
    aiGenerated: false,
  },
];

// ===================================================================
// SAMPLE TEMPLATES
// ===================================================================

const sampleTemplates = [
  {
    title: 'Basic Credit Bureau Dispute Letter',
    category: 'Dispute Letters',
    description: 'Standard dispute letter template for inaccurate items on credit reports.',
    content: `{{todayDate}}

{{bureauName}}
Dispute Department
[Bureau Address]

Re: Dispute of Inaccurate Information
Account/Reference Number: {{accountNumber}}

Dear {{bureauName}},

I am writing to dispute the following information in my credit file:

{{itemDescription}}

This item is inaccurate because {{disputeReason}}. I am requesting that this item be investigated and removed from my credit report pursuant to the Fair Credit Reporting Act.

Enclosed are copies of supporting documents that validate my claim.

Please conduct a thorough investigation of this matter and remove all inaccurate information from my credit report. Please send me written confirmation of the investigation results and any corrections made.

Sincerely,
{{clientName}}
{{clientAddress}}`,
    variables: [
      '{{todayDate}}',
      '{{bureauName}}',
      '{{accountNumber}}',
      '{{itemDescription}}',
      '{{disputeReason}}',
      '{{clientName}}',
      '{{clientAddress}}'
    ],
    uses: 234,
    favorites: 89,
    rating: 4.8,
    ratingCount: 45,
  },
  {
    title: 'Client Welcome Email',
    category: 'Email Templates',
    description: 'Warm welcome email for new clients starting their credit repair journey.',
    content: `Subject: Welcome to {{companyName}} - Let's Improve Your Credit Together!

Dear {{clientFirstName}},

Welcome to {{companyName}}! We're thrilled to have you as a client and excited to help you achieve your credit goals.

Here's what happens next:

1. We'll analyze your credit reports from all three bureaus
2. Identify items that need attention
3. Create a customized action plan
4. Begin the dispute process on your behalf

Your dedicated account manager will contact you within 24 hours to discuss your specific situation and answer any questions.

In the meantime, please log into your client portal at [portal link] using these credentials:
Username: {{clientEmail}}
Password: [temporary password]

If you have any immediate questions, don't hesitate to reach out at {{companyPhone}} or reply to this email.

We're committed to your success!

Best regards,
{{companyName}} Team`,
    variables: [
      '{{companyName}}',
      '{{clientFirstName}}',
      '{{clientEmail}}',
      '{{companyPhone}}'
    ],
    uses: 456,
    favorites: 123,
    rating: 4.9,
    ratingCount: 67,
  },
  {
    title: 'Monthly Progress Report',
    category: 'Reports',
    description: 'Template for sending monthly progress updates to clients.',
    content: `{{companyName}}
MONTHLY PROGRESS REPORT
Generated: {{todayDate}}

Client: {{clientName}}
Account Started: [Start Date]

CREDIT SCORE SUMMARY
-----------------------
Equifax:     [Previous] → [Current] (Change: [+/-])
Experian:    [Previous] → [Current] (Change: [+/-])
TransUnion:  [Previous] → [Current] (Change: [+/-])

DISPUTES THIS MONTH
-----------------------
• Disputes Submitted: [Number]
• Disputes Verified/Deleted: [Number]
• Disputes Pending: [Number]

NEXT STEPS
-----------------------
1. [Next action item]
2. [Next action item]
3. [Next action item]

Your progress this month: [Summary of achievements]

Questions? Contact us at {{companyPhone}}`,
    variables: [
      '{{companyName}}',
      '{{todayDate}}',
      '{{clientName}}',
      '{{companyPhone}}'
    ],
    uses: 189,
    favorites: 67,
    rating: 4.7,
    ratingCount: 34,
  },
  {
    title: 'Goodwill Letter to Creditor',
    category: 'Dispute Letters',
    description: 'Request for goodwill deletion of negative items from creditors.',
    content: `{{todayDate}}

{{creditorName}}
Customer Service Department
[Creditor Address]

Re: Request for Goodwill Adjustment
Account Number: {{accountNumber}}

Dear {{creditorName}},

I am writing to respectfully request a goodwill adjustment to my account with your company.

I have been a customer of {{creditorName}} for [duration] and value our relationship. However, I have a late payment reported on {{latePaymentDate}} that is negatively impacting my credit score.

The circumstances surrounding this late payment were: {{reasonForLatePayment}}

Since that time, I have maintained a perfect payment history and have taken steps to ensure this never happens again. I am requesting that you consider removing this negative mark as a gesture of goodwill.

I would greatly appreciate your consideration of this request. Thank you for your time and understanding.

Respectfully,
{{clientName}}
{{clientPhone}}`,
    variables: [
      '{{todayDate}}',
      '{{creditorName}}',
      '{{accountNumber}}',
      '{{latePaymentDate}}',
      '{{reasonForLatePayment}}',
      '{{clientName}}',
      '{{clientPhone}}'
    ],
    uses: 145,
    favorites: 78,
    rating: 4.6,
    ratingCount: 29,
  },
];

// ===================================================================
// SAMPLE COURSES
// ===================================================================

const sampleCourses = [
  {
    title: 'Credit Repair Fundamentals',
    level: 'Beginner',
    duration: '4 hours',
    description: 'Learn the basics of credit repair, from understanding credit reports to filing disputes.',
    category: 'Training',
    order: 1,
    published: true,
    lessons: [
      {
        id: 1,
        title: 'Introduction to Credit Repair',
        duration: '30 min',
        type: 'video',
        completed: false,
      },
      {
        id: 2,
        title: 'Understanding Credit Reports',
        duration: '45 min',
        type: 'video',
        completed: false,
      },
      {
        id: 3,
        title: 'Credit Score Factors',
        duration: '30 min',
        type: 'text',
        completed: false,
      },
      {
        id: 4,
        title: 'The Dispute Process',
        duration: '60 min',
        type: 'video',
        completed: false,
      },
      {
        id: 5,
        title: 'Practice Quiz',
        duration: '15 min',
        type: 'quiz',
        completed: false,
      },
    ],
    progress: 0,
    enrollments: 234,
    completions: 178,
    rating: 4.8,
    ratingCount: 89,
  },
  {
    title: 'Advanced Dispute Strategies',
    level: 'Advanced',
    duration: '6 hours',
    description: 'Master advanced techniques for complex disputes and difficult cases.',
    category: 'Training',
    order: 2,
    published: true,
    lessons: [
      {
        id: 1,
        title: 'Complex Account Analysis',
        duration: '45 min',
        type: 'video',
        completed: false,
      },
      {
        id: 2,
        title: 'Legal Strategies',
        duration: '60 min',
        type: 'video',
        completed: false,
      },
      {
        id: 3,
        title: 'Working with Attorneys',
        duration: '30 min',
        type: 'text',
        completed: false,
      },
      {
        id: 4,
        title: 'Advanced Letters & Tactics',
        duration: '90 min',
        type: 'video',
        completed: false,
      },
      {
        id: 5,
        title: 'Case Studies',
        duration: '60 min',
        type: 'video',
        completed: false,
      },
      {
        id: 6,
        title: 'Final Assessment',
        duration: '30 min',
        type: 'quiz',
        completed: false,
      },
    ],
    progress: 0,
    enrollments: 156,
    completions: 89,
    rating: 4.9,
    ratingCount: 67,
  },
  {
    title: 'FCRA Compliance Certification',
    level: 'Intermediate',
    duration: '5 hours',
    description: 'Comprehensive training on FCRA compliance for credit repair professionals.',
    category: 'Compliance',
    order: 3,
    published: true,
    lessons: [
      {
        id: 1,
        title: 'FCRA Overview',
        duration: '45 min',
        type: 'video',
        completed: false,
      },
      {
        id: 2,
        title: 'Consumer Rights',
        duration: '60 min',
        type: 'video',
        completed: false,
      },
      {
        id: 3,
        title: 'Reporting Agency Obligations',
        duration: '45 min',
        type: 'text',
        completed: false,
      },
      {
        id: 4,
        title: 'Compliance Best Practices',
        duration: '75 min',
        type: 'video',
        completed: false,
      },
      {
        id: 5,
        title: 'Certification Exam',
        duration: '45 min',
        type: 'quiz',
        completed: false,
      },
    ],
    progress: 0,
    enrollments: 198,
    completions: 145,
    rating: 4.7,
    ratingCount: 52,
  },
];

// ===================================================================
// SAMPLE KNOWLEDGE BASE ARTICLES
// ===================================================================

const sampleKnowledgeBase = [
  {
    title: 'What is the Fair Credit Reporting Act (FCRA)?',
    category: 'FCRA & Compliance',
    content: `The Fair Credit Reporting Act (FCRA) is a federal law that regulates the collection, dissemination, and use of consumer credit information. Enacted in 1970, the FCRA is designed to promote accuracy, fairness, and privacy of information in credit reports.

Key provisions of the FCRA include:

1. Consumer Rights
   - Right to access credit reports annually for free
   - Right to dispute inaccurate information
   - Right to be notified when information is used against them
   - Right to opt-out of prescreened credit offers

2. Credit Reporting Agency Obligations
   - Must investigate consumer disputes within 30 days
   - Must provide copies of reports to consumers upon request
   - Must maintain reasonable procedures to ensure accuracy
   - Must delete unverified information

3. Information Furnisher Responsibilities
   - Must provide accurate information
   - Must investigate disputes forwarded by credit bureaus
   - Must correct or delete inaccurate information

4. Permissible Purposes
   Credit reports can only be accessed for legitimate purposes such as:
   - Credit applications
   - Employment screening (with consent)
   - Insurance underwriting
   - Court orders

The FCRA is enforced by the Federal Trade Commission (FTC) and violations can result in significant penalties. Credit repair professionals must thoroughly understand FCRA provisions to effectively advocate for their clients.`,
    relatedArticles: ['How to File an FCRA Complaint', 'Understanding Credit Report Errors', 'Consumer Rights Under FCRA'],
    views: 456,
    helpful: 234,
    tags: ['fcra', 'compliance', 'consumer-rights', 'regulations'],
  },
  {
    title: 'How Long Do Negative Items Stay on Credit Reports?',
    category: 'Credit Repair Basics',
    content: `Understanding the timeline for negative items on credit reports is crucial for credit repair. Here's a breakdown of how long different items can remain:

1. Late Payments
   Duration: 7 years from the date of delinquency
   Impact: Decreases over time
   Note: Even if the account is brought current, the late payment history remains

2. Collections
   Duration: 7 years from the date of first delinquency
   Important: The 7-year clock starts from when you first fell behind on the original debt, NOT when it went to collections

3. Charge-Offs
   Duration: 7 years from the date of first delinquency
   Note: Paying a charge-off doesn't remove it, but updates it to "paid charge-off"

4. Bankruptcies
   - Chapter 7: 10 years from filing date
   - Chapter 13: 7 years from filing date
   Impact: Most severe credit event

5. Foreclosures
   Duration: 7 years from the completion date
   Impact: Severe, but improves over time

6. Tax Liens
   - Paid: 7 years from payment date
   - Unpaid: Indefinitely (though less common since 2018)

7. Hard Inquiries
   Duration: 2 years
   Impact: Minimal after 12 months

Important Notes:
- These are maximum timeframes; some items may be removed earlier
- State laws may differ slightly
- The impact of negative items decreases over time
- Recent positive behavior can offset older negative items

For credit repair, it's essential to:
1. Verify the accuracy of reporting dates
2. Ensure items are removed when they expire
3. Focus on rehabilitating credit with positive actions
4. Dispute any inaccuracies in the reporting`,
    relatedArticles: ['Disputing Old Debts', 'Credit Report Timeline', 'Statute of Limitations'],
    views: 789,
    helpful: 456,
    tags: ['credit-reports', 'negative-items', 'timeline', 'basics'],
  },
  {
    title: 'What Information Can Be Disputed on a Credit Report?',
    category: 'Disputes',
    content: `Consumers have the right to dispute any information on their credit report that they believe is inaccurate, incomplete, or unverifiable. Here are the most common types of disputable information:

1. Personal Information Errors
   - Incorrect name or spelling
   - Wrong address (current or previous)
   - Incorrect Social Security number
   - Wrong date of birth
   - Incorrect employment information

2. Account Status Errors
   - Accounts listed as open that are closed
   - Duplicate accounts
   - Accounts that don't belong to you
   - Incorrect account balances
   - Wrong credit limits

3. Payment History Errors
   - Late payments incorrectly reported
   - Payments reported late that were on time
   - Accounts showing the wrong payment status
   - Missed payments that were actually made

4. Public Records Errors
   - Bankruptcies that don't belong to you
   - Bankruptcies older than reporting period
   - Dismissed bankruptcies still showing
   - Tax liens that were paid but show unpaid
   - Judgments that were satisfied

5. Collection Accounts
   - Collections that aren't yours
   - Paid collections showing as unpaid
   - Collections past the 7-year reporting period
   - Same debt reported by multiple collectors

6. Inquiry Errors
   - Inquiries you didn't authorize
   - Multiple inquiries from rate shopping counted separately

What Cannot Be Disputed Successfully:
- Accurate negative information within reporting timeframe
- Legitimate accounts, even if negative
- Information verified by creditors

Best Practices for Disputes:
1. Gather supporting documentation
2. Be specific about what's wrong
3. Provide evidence if available
4. Keep copies of all correspondence
5. Follow up after 30 days
6. Consider escalating if initial dispute is unsuccessful

Remember: You have the right to dispute any item you believe is inaccurate. Credit bureaus must investigate within 30 days and provide written results.`,
    relatedArticles: ['How to File a Dispute', 'Documentation for Disputes', 'What Happens After a Dispute'],
    views: 678,
    helpful: 389,
    tags: ['disputes', 'credit-reports', 'errors', 'consumer-rights'],
  },
  {
    title: 'Understanding Credit Utilization Ratio',
    category: 'Credit Score Factors',
    content: `Credit utilization ratio is one of the most important factors in your credit score, accounting for approximately 30% of your FICO score. Understanding and managing this ratio is crucial for credit improvement.

What is Credit Utilization?
Credit utilization is the amount of credit you're using compared to your total available credit, expressed as a percentage.

Formula: (Total Credit Card Balances / Total Credit Limits) × 100

Example:
- Credit Card 1: $2,000 balance, $5,000 limit
- Credit Card 2: $1,000 balance, $5,000 limit
- Total: $3,000 used / $10,000 available = 30% utilization

Recommended Utilization Rates:
- Excellent: Below 10%
- Good: 10-30%
- Fair: 30-50%
- Poor: Above 50%

Important Considerations:

1. Overall vs. Per-Card Utilization
   - Credit scores look at BOTH your overall utilization and per-card utilization
   - Even if overall utilization is low, maxed-out cards hurt your score
   - Aim to keep all cards below 30% individually

2. When Utilization is Calculated
   - Usually based on your statement balance
   - Paying before statement closes can show lower utilization
   - Some cards report mid-cycle

3. Strategies to Improve Utilization:

   A. Pay Down Balances
      - Most direct method
      - Focus on highest-utilization cards first

   B. Increase Credit Limits
      - Request limit increases on existing cards
      - Opens new account (though hard inquiry impacts score temporarily)
      - Don't increase spending with new credit

   C. Make Multiple Payments Per Month
      - Keep balances low throughout the month
      - Pay before statement closing date

   D. Use Balance Transfer
      - Spread balances across multiple cards
      - Be aware of transfer fees and impact on utilization

   E. Become an Authorized User
      - Benefit from someone else's low utilization
      - Works only if account is in good standing

4. Common Mistakes:
   - Closing old accounts (reduces available credit)
   - Maxing out cards for rewards points
   - Only making minimum payments
   - Not tracking utilization regularly

5. Impact on Credit Score:
   - Immediate: Reducing utilization can improve score within 30 days
   - Significant: A 50% to 10% drop can add 20-50 points
   - Temporary: High utilization during home purchase, etc., recovers quickly

For Credit Repair Clients:
1. Calculate current utilization
2. Set target utilization (ideally <30%, optimally <10%)
3. Create payment plan to reach target
4. Consider strategic credit line increases
5. Monitor and maintain low utilization

Remember: Credit utilization has no memory. Unlike late payments that stay for 7 years, utilization impact is immediate and reversible.`,
    relatedArticles: ['How to Calculate Credit Score', 'Paying Down Credit Card Debt', 'Credit Limit Increase Tips'],
    views: 543,
    helpful: 312,
    tags: ['credit-score', 'utilization', 'credit-cards', 'improvement'],
  },
];

// ===================================================================
// SAMPLE TOOLS
// ===================================================================

const sampleTools = [
  {
    name: 'Credit Score Calculator',
    description: 'Estimate your credit score based on key factors',
    category: 'Analysis',
    icon: 'calculator',
    inputs: [
      { name: 'Payment History', type: 'percentage', weight: 35 },
      { name: 'Credit Utilization', type: 'percentage', weight: 30 },
      { name: 'Length of History', type: 'years', weight: 15 },
      { name: 'New Credit', type: 'number', weight: 10 },
      { name: 'Credit Mix', type: 'number', weight: 10 },
    ],
    outputs: [
      { name: 'Estimated Score', type: 'number', range: '300-850' },
      { name: 'Score Rating', type: 'text' },
    ],
  },
  {
    name: 'Debt-to-Income Calculator',
    description: 'Calculate your debt-to-income ratio for loan applications',
    category: 'Financial',
    icon: 'calculator',
    inputs: [
      { name: 'Monthly Debt Payments', type: 'currency' },
      { name: 'Gross Monthly Income', type: 'currency' },
    ],
    outputs: [
      { name: 'DTI Ratio', type: 'percentage' },
      { name: 'Qualification Status', type: 'text' },
    ],
  },
  {
    name: 'Payment Calculator',
    description: 'Calculate monthly payments for loans and credit cards',
    category: 'Financial',
    icon: 'calculator',
    inputs: [
      { name: 'Principal Amount', type: 'currency' },
      { name: 'Interest Rate', type: 'percentage' },
      { name: 'Loan Term', type: 'months' },
    ],
    outputs: [
      { name: 'Monthly Payment', type: 'currency' },
      { name: 'Total Interest', type: 'currency' },
      { name: 'Total Paid', type: 'currency' },
    ],
  },
  {
    name: 'Budget Planner',
    description: 'Create and track your monthly budget',
    category: 'Financial',
    icon: 'chart',
    inputs: [
      { name: 'Monthly Income', type: 'currency' },
      { name: 'Housing', type: 'currency' },
      { name: 'Transportation', type: 'currency' },
      { name: 'Food', type: 'currency' },
      { name: 'Utilities', type: 'currency' },
      { name: 'Insurance', type: 'currency' },
      { name: 'Debt Payments', type: 'currency' },
      { name: 'Savings', type: 'currency' },
      { name: 'Other', type: 'currency' },
    ],
    outputs: [
      { name: 'Total Expenses', type: 'currency' },
      { name: 'Remaining', type: 'currency' },
      { name: 'Expense Breakdown', type: 'chart' },
    ],
  },
];

// ===================================================================
// SEED FUNCTIONS
// ===================================================================

export const seedResources = async (userId, userName) => {
  try {
    console.log('Seeding resources...');
    const resourcesRef = collection(db, 'resources');
    
    for (const resource of sampleResources) {
      await addDoc(resourcesRef, {
        ...resource,
        uploadedBy: userId,
        uploadedByName: userName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    
    console.log(`✅ Seeded ${sampleResources.length} resources`);
    return true;
  } catch (error) {
    console.error('Error seeding resources:', error);
    return false;
  }
};

export const seedTemplates = async (userId, userName) => {
  try {
    console.log('Seeding templates...');
    const templatesRef = collection(db, 'templates');
    
    for (const template of sampleTemplates) {
      await addDoc(templatesRef, {
        ...template,
        createdBy: userId,
        createdByName: userName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    
    console.log(`✅ Seeded ${sampleTemplates.length} templates`);
    return true;
  } catch (error) {
    console.error('Error seeding templates:', error);
    return false;
  }
};

export const seedCourses = async () => {
  try {
    console.log('Seeding courses...');
    const coursesRef = collection(db, 'courses');
    
    for (const course of sampleCourses) {
      await addDoc(coursesRef, {
        ...course,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    
    console.log(`✅ Seeded ${sampleCourses.length} courses`);
    return true;
  } catch (error) {
    console.error('Error seeding courses:', error);
    return false;
  }
};

export const seedKnowledgeBase = async () => {
  try {
    console.log('Seeding knowledge base...');
    const kbRef = collection(db, 'knowledgeBase');
    
    for (const article of sampleKnowledgeBase) {
      await addDoc(kbRef, {
        ...article,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    
    console.log(`✅ Seeded ${sampleKnowledgeBase.length} knowledge base articles`);
    return true;
  } catch (error) {
    console.error('Error seeding knowledge base:', error);
    return false;
  }
};

export const seedTools = async () => {
  try {
    console.log('Seeding tools...');
    const toolsRef = collection(db, 'tools');
    
    for (const tool of sampleTools) {
      await addDoc(toolsRef, {
        ...tool,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    
    console.log(`✅ Seeded ${sampleTools.length} tools`);
    return true;
  } catch (error) {
    console.error('Error seeding tools:', error);
    return false;
  }
};

// ===================================================================
// SEED ALL DATA
// ===================================================================

export const seedAllResourceData = async (userId, userName) => {
  console.log('🌱 Starting to seed all resource data...');
  console.log('User ID:', userId);
  console.log('User Name:', userName);
  
  try {
    await seedResources(userId, userName);
    await seedTemplates(userId, userName);
    await seedCourses();
    await seedKnowledgeBase();
    await seedTools();
    
    console.log('');
    console.log('🎉 All resource data seeded successfully!');
    console.log('');
    console.log('Summary:');
    console.log(`- ${sampleResources.length} Resources`);
    console.log(`- ${sampleTemplates.length} Templates`);
    console.log(`- ${sampleCourses.length} Courses`);
    console.log(`- ${sampleKnowledgeBase.length} Knowledge Base Articles`);
    console.log(`- ${sampleTools.length} Tools`);
    console.log('');
    console.log('Navigate to /resources to see your new Resource Library Hub!');
    
    return true;
  } catch (error) {
    console.error('❌ Error seeding resource data:', error);
    return false;
  }
};

// ===================================================================
// USAGE EXAMPLE
// ===================================================================

/*
import { seedAllResourceData } from './utils/seedResourceData';
import { useAuth } from './contexts/AuthContext';

// In your component:
const { currentUser, userProfile } = useAuth();

const handleSeedData = async () => {
  const success = await seedAllResourceData(
    currentUser.uid,
    userProfile?.displayName || currentUser.email
  );
  
  if (success) {
    alert('Sample data loaded successfully!');
  } else {
    alert('Failed to load sample data. Check console for details.');
  }
};

// Add a button in your UI:
<Button onClick={handleSeedData}>Load Sample Resource Data</Button>
*/