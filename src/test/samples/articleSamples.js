export const SAMPLES = [
  {
    id: 'sample-credit-repair-001',
    title: '5 Steps to Improve Your Credit Score Quickly',
    content: `
      <h1>5 Steps to Improve Your Credit Score Quickly</h1>
      <p>Improving your credit score doesn't have to be complicated. In this article we outline five practical steps you can take immediately to boost your credit score and financial standing.</p>
      <h2>1. Check Your Credit Report</h2>
      <p>Obtain your free credit reports from the major bureaus and review them for errors. Dispute incorrect items and follow up with the credit bureau. Services like free credit monitoring can help you spot issues.</p>
      <h2>2. Pay Down High-Interest Debt</h2>
      <p>Focus on paying down credit cards with the highest interest rates first. Reducing utilization can improve your score quickly. Consider balance transfer offers and debt consolidation carefully.</p>
      <h2>3. Set Up Payment Reminders</h2>
      <p>On-time payments are the single biggest factor in your credit score. Set up autopay or reminders to avoid missed payments. Credit builder programs and secured credit cards can also add positive payment history.</p>
      <h2>4. Avoid New Hard Inquiries</h2>
      <p>Limit applications for new credit while you're trying to improve your score—each hard inquiry can lower your score temporarily. Instead, use soft credit checks for prequalification.</p>
      <h2>5. Build Positive Tradelines</h2>
      <p>Consider a secured card or a credit-builder loan to add positive payment history if your file is thin. Identity protection services can also prevent fraud that damages your credit.</p>
      <p>Helpful resources: credit monitoring, identity protection, secured credit card, credit builder loan, debt consolidation.</p>
      <p>Estimated monthly views: 1200</p>
    `,
    excerpt: 'A practical guide with five steps to start improving your credit score today.',
    category: 'Credit Repair Basics',
    tags: ['credit score','credit repair','finance'],
    status: 'draft',
    language: 'en',
    monetization: { affiliateLinks: [] },
    analytics: { views: 1200, likes: 10, shares: 2, comments: 0, revenue: 0 },
    seo: { metaTitle: '5 Steps to Improve Your Credit Score Quickly', metaDescription: 'Practical, fast steps to start improving your credit score today.', keywords: ['credit score','credit repair','finance'] }
  },
  {
    id: 'sample-credit-repair-002',
    title: 'How to Dispute Inaccurate Items on Your Credit Report',
    content: `
      <h1>How to Dispute Inaccurate Items on Your Credit Report</h1>
      <p>Incorrect accounts, duplicate entries, or identity theft can all appear on your credit report. Learn how to dispute and remove them.</p>
      <h2>Step 1: Get Your Reports</h2>
      <p>Request reports from Equifax, Experian, and TransUnion. Use online dispute forms or certified mail for disputes.</p>
      <h2>Step 2: Gather Documentation</h2>
      <p>Collect statements, letters, and proof of payment. If identity theft is suspected, consider identity protection or a credit monitoring plan.</p>
      <h2>Step 3: File the Dispute</h2>
      <p>File a dispute online or by mail. If the bureau finds an error, they must correct it. Keep records of every step.</p>
      <p>Suggested affiliate opportunities: credit monitoring, identity protection, dispute services.</p>
    `,
    excerpt: 'Step-by-step on disputing errors on your credit report.',
    category: 'Dispute Strategies',
    tags: ['dispute','credit report','identity theft'],
    status: 'draft',
    language: 'en',
    monetization: { affiliateLinks: [] },
    analytics: { views: 800, likes: 5, shares: 1, comments: 0, revenue: 0 },
    seo: { metaTitle: 'Dispute Inaccurate Items on Your Credit Report', metaDescription: 'Learn how to dispute errors and protect your credit.', keywords: ['dispute','credit report'] }
  },
  {
    id: 'sample-credit-repair-003',
    title: 'A Beginner\'s Guide to Building Credit From Scratch',
    content: `
      <h1>A Beginner's Guide to Building Credit From Scratch</h1>
      <p>If you have no credit history, start with a secured credit card, authorized user status, or a credit builder loan.</p>
      <h2>Secured Credit Cards</h2>
      <p>Secured cards require a deposit and help establish payment history. Use them responsibly and keep balances low.</p>
      <h2>Authorized Users</h2>
      <p>Becoming an authorized user on a trusted person's account can accelerate history building.</p>
      <h2>Credit Builder Loans</h2>
      <p>These loans deposit funds into a locked account and report payments to bureaus.</p>
      <p>Keywords and anchor phrases: secured credit card, credit builder loan, authorized user, credit monitoring, identity protection.</p>
    `,
    excerpt: 'Practical approaches to build credit when starting from zero.',
    category: 'Business Credit',
    tags: ['credit building','secured card','loans'],
    status: 'draft',
    language: 'en',
    monetization: { affiliateLinks: [] },
    analytics: { views: 500, likes: 2, shares: 0, comments: 0, revenue: 0 },
    seo: { metaTitle: 'Beginner\'s Guide to Building Credit', metaDescription: 'Start building credit with secured cards and credit-builder loans.', keywords: ['secured card','credit builder'] }
  }
];

export const getSampleById = (id) => SAMPLES.find(s => s.id === id) || null;

export default SAMPLES;
