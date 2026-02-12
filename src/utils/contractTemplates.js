// ============================================================================
// Path: /src/utils/contractTemplates.js
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// Trademark registered USPTO, violations prosecuted.
//
// CONTRACT TEMPLATE GENERATOR — VERSION 3.0 MERGED
// ============================================================================
// V2.0 full content PRESERVED + V3.0 fixes applied:
//   ✅ __INITIAL_N__ markers for click-to-initial system
//   ✅ __SIGNATURE__ / __SCR_SIGNATURE__ / __DATE__ markers for click-to-sign
//   ✅ Cancellation clause — positive consumer assurance framing (from real PDF)
//   ✅ Tab 5 renamed from "3-Day Right" to "5-Day Right"
//   ✅ generateAllDocuments returns enhanced metadata (signatureType, initialCount)
//   ✅ Backward compatibility aliases (generateAllContractDocuments, getContractDocuments)
//
// DOCUMENTS GENERATED:
//   Tab 0: Information Statement (CROA Consumer Rights) - MUST BE FIRST
//   Tab 1: Privacy Notice
//   Tab 2: Contract for Credit Repair Service (with interactive initials)
//   Tab 3: ACH Payment Authorization — UNIFIED (monthly + items + setup)
//   Tab 4: Power of Attorney
//   Tab 5: Notice of Cancellation (5-Day Right)
//
// MARKER SYSTEM (used by ContractSigningPortal.jsx):
//   __INITIAL_N__     → Click-to-initial button (N = 0-indexed field number)
//   __SIGNATURE__     → Click-to-sign button (client signature)
//   __SCR_SIGNATURE__ → SCR auto-signature (Christopher Lahage)
//   __DATE__          → Auto-filled current date
// ============================================================================

// ============================================================================
// ===== SERVICE PLAN CONFIGURATIONS =====
// ============================================================================

export const SERVICE_PLAN_CONFIGS = {
  diy: {
    id: 'diy',
    name: 'DIY Credit Assist',
    monthlyFee: 39,
    setupFee: 99,
    perItemFee: 0,
    perItemFeeNote: 'Not applicable — DIY plan is self-service',
    contractMonths: 1, // Month-to-month
    isMonthToMonth: true,
    totalServiceFee: 39, // Per month, no commitment
    maxDisputedItems: 0,
    maxItemCost: 0,
    maxTotalCost: 138, // $99 setup + $39 first month
    cancelAfterPayment: 0, // Can cancel anytime
    hasCancellationPeriod: false, // No 5-day cancel requirement
    requiresIDIQPostCancel: false, // No IDIQ maintenance after cancel
    idiqPostCancelDays: 0,
    billingTiming: 'beginning', // Billed at start of month
    includesDisputes: false,
    serviceDescription: 'Self-service credit repair with tools, templates, and guidance provided by Speedy Credit Repair Inc.',
    servicesIncluded: [
      'Access to AI-generated dispute letter templates',
      'Step-by-step credit repair guidance',
      'Educational resources and credit improvement tips',
      'Basic email support',
      'Client portal access for tracking progress',
      'Credit monitoring guidance'
    ]
  },

  standard: {
    id: 'standard',
    name: 'Standard Credit Repair',
    monthlyFee: 149,
    setupFee: 0,
    perItemFee: 25,
    perItemFeeNote: '$25.00 per successfully disputed and repaired item per credit bureau',
    contractMonths: 6,
    isMonthToMonth: false,
    totalServiceFee: 894, // $149 x 6
    maxDisputedItems: 40,
    maxItemCost: 1000, // 40 items x $25
    maxTotalCost: 1894, // $894 + $1000
    cancelAfterPayment: 3, // After 3rd month end
    hasCancellationPeriod: true,
    requiresIDIQPostCancel: true,
    idiqPostCancelDays: 45,
    billingTiming: 'end', // Billed at end of each service month
    includesDisputes: true,
    serviceDescription: 'Full-service credit repair with expert dispute handling by Speedy Credit Repair Inc.',
    servicesIncluded: [
      'Analysis and review of client file status',
      'Update client file with most recent updates and/or notes',
      'Receiving and processing manual updates',
      'Respond to, receive and/or initiate correspondence via telephone',
      'Respond to, receive and/or initiate correspondence via e-mail',
      'Respond to, receive and/or initiate correspondence via facsimile',
      'Respond to, receive and/or initiate correspondence via physical mail (USPS, FedEx, UPS, etc.)',
      'Review client credit report updates to determine next step',
      'Create a strategic plan to assist client in meeting their goals',
      'Create and send dispute letters written from you to credit bureaus and/or creditors (found in your portal)',
      'Assist with budget and/or credit related questions',
      'SCR may, with your permission, suggest or refer you to affiliates who may offer you secured and/or unsecured credit for the purpose of building or re-building your credit. SCR may be compensated by these affiliates should you obtain a line of credit from them',
      'Provide ongoing credit education',
      'Provide ongoing budget advice and counseling'
    ]
  },

  acceleration: {
    id: 'acceleration',
    name: 'Acceleration Credit Repair',
    monthlyFee: 199,
    setupFee: 0,
    perItemFee: 0,
    perItemFeeNote: 'All deletion fees are included in the monthly service charge',
    contractMonths: 6,
    isMonthToMonth: false,
    totalServiceFee: 1194, // $199 x 6
    maxDisputedItems: 999, // Unlimited
    maxItemCost: 0,
    maxTotalCost: 1194,
    cancelAfterPayment: 3,
    hasCancellationPeriod: true,
    requiresIDIQPostCancel: true,
    idiqPostCancelDays: 45,
    billingTiming: 'end',
    includesDisputes: true,
    serviceDescription: 'Accelerated full-service credit repair with unlimited dispute items included in monthly service.',
    servicesIncluded: [
      'All Standard plan services',
      'Unlimited dispute items (no per-item charges)',
      'Priority processing and faster response times',
      'Advanced dispute strategies and techniques',
      'Quarterly progress consultations',
      'Credit builder recommendations'
    ]
  },

  payForDelete: {
    id: 'payForDelete',
    name: 'Pay-For-Delete',
    monthlyFee: 0,
    setupFee: 99,
    perItemFee: 75,
    perItemFeeNote: '$75.00 per successfully deleted item per credit bureau — pay only for confirmed deletions',
    contractMonths: 6,
    isMonthToMonth: false,
    totalServiceFee: 0, // No monthly fees
    maxDisputedItems: 40,
    maxItemCost: 3000, // 40 items x $75
    maxTotalCost: 3099, // $99 + $3000
    cancelAfterPayment: 3,
    hasCancellationPeriod: true,
    requiresIDIQPostCancel: true,
    idiqPostCancelDays: 45,
    billingTiming: 'end',
    includesDisputes: true,
    serviceDescription: 'Results-based credit repair — you only pay when negative items are successfully deleted.',
    servicesIncluded: [
      'All Standard plan services',
      'Performance-based pricing (pay only for deletions)',
      'Higher per-item fee due to results-only model',
      'Aggressive deletion strategies',
      'Verification of all deletions before billing'
    ]
  },

  hybrid: {
    id: 'hybrid',
    name: 'Hybrid Credit Repair',
    monthlyFee: 99,
    setupFee: 0,
    perItemFee: 25,
    perItemFeeNote: '$25.00 per successfully disputed and repaired item per credit bureau',
    contractMonths: 6,
    isMonthToMonth: false,
    totalServiceFee: 594, // $99 x 6
    maxDisputedItems: 40,
    maxItemCost: 1000,
    maxTotalCost: 1594,
    cancelAfterPayment: 3,
    hasCancellationPeriod: true,
    requiresIDIQPostCancel: true,
    idiqPostCancelDays: 45,
    billingTiming: 'end',
    includesDisputes: true,
    serviceDescription: 'Balanced approach combining moderate monthly fees with per-item success charges.',
    servicesIncluded: [
      'All Standard plan services',
      'Lower monthly fee than Standard',
      'Per-item charges for successful repairs',
      'Flexible approach to credit repair',
      'Good balance of affordability and results-based pricing'
    ]
  },

  premium: {
    id: 'premium',
    name: 'Premium Credit Repair',
    monthlyFee: 349,
    setupFee: 199,
    perItemFee: 0,
    perItemFeeNote: 'All services and fees included in premium monthly charge',
    contractMonths: 6,
    isMonthToMonth: false,
    totalServiceFee: 2094, // $349 x 6
    maxDisputedItems: 999, // Unlimited
    maxItemCost: 0,
    maxTotalCost: 2293, // $199 setup + $2094 monthly total
    cancelAfterPayment: 3,
    hasCancellationPeriod: true,
    requiresIDIQPostCancel: true,
    idiqPostCancelDays: 45,
    billingTiming: 'end',
    includesDisputes: true,
    serviceDescription: 'Our most comprehensive service with white-glove treatment, concierge-level support, and complimentary attorney initial review (valued at $400).',
    servicesIncluded: [
      'All Acceleration plan services',
      'Attorney initial review ($400 value included with $199 setup fee)',
      'Dedicated account manager',
      'Priority 24/7 support',
      'Monthly strategy consultations',
      'Advanced creditor negotiations',
      'Identity theft protection assistance',
      'Credit building coaching',
      'Mortgage readiness preparation',
      'Pre-approval for major purchases guidance'
    ]
  }
};

// ============================================================================
// ===== HELPER FUNCTIONS =====
// ============================================================================

export function getPlanConfig(planId) {
  return SERVICE_PLAN_CONFIGS[planId] || SERVICE_PLAN_CONFIGS.standard;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

export function getContractDates(startDate = null, contractMonths = 6) {
  const today = startDate ? new Date(startDate) : new Date();
  const endDate = new Date(today);
  endDate.setMonth(endDate.getMonth() + contractMonths);

  // Calculate 5-day cancellation deadline (5 WORKING days)
  const cancelDeadline = new Date(today);
  let workingDaysAdded = 0;
  while (workingDaysAdded < 5) {
    cancelDeadline.setDate(cancelDeadline.getDate() + 1);
    const dayOfWeek = cancelDeadline.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      workingDaysAdded++;
    }
  }

  // Get billing day (last day of month)
  const billingDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const billingDayOrdinal = billingDay + getOrdinalSuffix(billingDay);

  return {
    startDate: today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    endDate: endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    cancelDeadline: cancelDeadline.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    billingDay,
    billingDayOrdinal,
    contractMonths
  };
}

function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

// ============================================================================
// ===== DOCUMENT 0: CROA INFORMATION STATEMENT =====
// ============================================================================

export function generateInformationStatement(contact) {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; line-height: 1.8; color: #333; max-width: 800px; margin: 0 auto;">
      <div style="background: #fee; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #d32f2f;">
        <p style="margin: 0; font-weight: bold; color: #d32f2f;">⚠️ IMPORTANT NOTICE</p>
        <p style="margin: 5px 0 0 0;">Federal law requires you to review this Consumer Credit File Rights document FIRST before proceeding with any other contract documents. This protects your rights under the Credit Repair Organizations Act (CROA).</p>
      </div>

      <h1 style="text-align: center; color: #1a365d; font-size: 26px; border-bottom: 2px solid #1a365d; padding-bottom: 10px;">
        Consumer Credit File Rights<br/>
        Under State and Federal Law
      </h1>

      <p style="font-weight: bold; text-align: center; font-size: 18px; margin: 20px 0;">
        INFORMATION STATEMENT ABOUT CONSUMER CREDIT REPAIR SERVICES
      </p>

      <h2 style="color: #1a365d;">You Have a Right to Dispute Inaccurate Information in Your Credit Report</h2>

      <p>You have the right to dispute inaccurate information in your credit file with a consumer reporting agency (CRA). The CRA must reinvestigate any inaccuracies you dispute, and remove or correct inaccurate, incomplete, or unverifiable information, within 30 days (or 45 days in some cases).</p>

      <p>There is no charge for a CRA to process your dispute. If you prefer, you may contact the CRA directly rather than work with a credit repair organization.</p>

      <h2 style="color: #1a365d;">You Can Do It Yourself—For Free</h2>

      <p>You have the right to obtain a free credit report once every 12 months from each of the three nationwide consumer reporting agencies:</p>

      <ul style="margin-left: 20px;">
        <li><strong>Equifax:</strong> 1-800-685-1111 or <a href="https://www.equifax.com" style="color: #2563eb;">www.equifax.com</a></li>
        <li><strong>Experian:</strong> 1-888-397-3742 or <a href="https://www.experian.com" style="color: #2563eb;">www.experian.com</a></li>
        <li><strong>TransUnion:</strong> 1-800-916-8800 or <a href="https://www.transunion.com" style="color: #2563eb;">www.transunion.com</a></li>
      </ul>

      <p>You can request all three reports at once, or request one at a time. You can request your free annual credit reports online at <a href="https://www.annualcreditreport.com" style="color: #2563eb;">www.annualcreditreport.com</a>, by calling toll-free 1-877-322-8228, or by completing an Annual Credit Report Request Form and mailing it to:</p>

      <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
        <p style="margin: 0;">Annual Credit Report Request Service<br/>
        P.O. Box 105281<br/>
        Atlanta, GA 30348-5281</p>
      </div>

      <p>Forms are available at <a href="https://www.annualcreditreport.com" style="color: #2563eb;">www.annualcreditreport.com</a>. You may also contact the FTC at <a href="https://www.ftc.gov/credit" style="color: #2563eb;">www.ftc.gov/credit</a>.</p>

      <h2 style="color: #1a365d;">Your Rights When Dealing with Credit Repair Organizations</h2>

      <p>Credit repair organizations must give you a copy of your "Consumer Credit File Rights Under State and Federal Law" before you sign a contract.</p>

      <p>Credit repair organizations cannot:</p>

      <ul style="margin-left: 20px;">
        <li>Make false claims about their services</li>
        <li>Charge you until they have completed the promised services</li>
        <li>Perform any services until they have your signature on a written contract and have completed a 3-day waiting period (this waiting period begins when you receive a copy of your completed contract)</li>
      </ul>

      <p><strong>You have the right to sue a credit repair organization that violates the Credit Repair Organization Act.</strong> This law prohibits deceptive practices by credit repair organizations.</p>

      <h2 style="color: #1a365d;">How to File a Complaint</h2>

      <p>If you believe a credit repair organization has violated the Credit Repair Organizations Act, file a complaint with:</p>

      <div style="margin: 15px 0; padding: 15px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981;">
        <p style="margin: 0;"><strong>Federal Trade Commission (FTC)</strong><br/>
        Consumer Response Center<br/>
        600 Pennsylvania Avenue NW<br/>
        Washington, DC 20580</p>
        <p style="margin: 10px 0 0 0;">Or online at: <a href="https://www.ftc.gov" style="color: #2563eb;">www.ftc.gov</a><br/>
        By phone: 1-877-FTC-HELP (1-877-382-4357)</p>
      </div>

      <h2 style="color: #1a365d;">California Residents: Additional Rights</h2>

      <p>California residents have additional protections under California Civil Code § 1789.16 and may also contact:</p>

      <div style="margin: 15px 0; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <p style="margin: 0;"><strong>California Department of Consumer Affairs</strong><br/>
        Consumer Information Center<br/>
        1625 North Market Blvd., Suite N-112<br/>
        Sacramento, CA 95834</p>
        <p style="margin: 10px 0 0 0;">By phone: 1-800-952-5210 or 1-916-445-1254</p>
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #333;">
        <p style="font-weight: bold;">ACKNOWLEDGMENT OF RECEIPT</p>
        <p>I, <strong>${contact.firstName || ''} ${contact.lastName || ''}</strong>, acknowledge that I have received and read this Information Statement about my rights under state and federal law.</p>
        <p style="margin-top: 20px;">
          __SIGNATURE__ <br/>
          <span style="font-size: 12px;">Client Signature</span>
        </p>
        <p style="margin-top: 20px;">
          Dated: __DATE__
        </p>
      </div>
    </div>
  `;
}

// ============================================================================
// ===== DOCUMENT 1: PRIVACY NOTICE =====
// ============================================================================

export function generatePrivacyNotice(contact) {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; line-height: 1.8; color: #333; max-width: 800px; margin: 0 auto;">
      <h1 style="text-align: center; color: #1a365d; font-size: 26px; border-bottom: 2px solid #1a365d; padding-bottom: 10px;">
        PRIVACY NOTICE
      </h1>

      <div style="text-align: center; margin-bottom: 20px;">
        <p style="margin: 0; font-weight: bold;">Speedy Credit Repair Inc.</p>
        <p style="margin: 0;">117 Main St. Suite #202</p>
        <p style="margin: 0;">Huntington Beach, CA 92648</p>
        <p style="margin: 0;">(888) 724-7344</p>
      </div>

      <p style="font-weight: bold; font-size: 16px;">FACTS: WHAT DOES SPEEDY CREDIT REPAIR INC. DO WITH YOUR PERSONAL INFORMATION?</p>

      <table style="width: 100%; border-collapse: collapse; border: 2px solid #1a365d; margin: 20px 0;">
        <tr style="background: #1a365d; color: white;">
          <td style="padding: 10px; font-weight: bold;">Why?</td>
          <td style="padding: 10px;">Financial companies choose how they share your personal information. Federal law gives consumers the right to limit some but not all sharing. Federal law also requires us to tell you how we collect, share, and protect your personal information. Please read this notice carefully to understand what we do.</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; vertical-align: top;">What?</td>
          <td style="padding: 10px; border: 1px solid #ddd;">The types of personal information we collect and share depend on the product or service you have with us. This information can include:
            <ul style="margin: 10px 0 0 20px;">
              <li>Social Security number and income</li>
              <li>Account balances and payment history</li>
              <li>Credit history and credit scores</li>
            </ul>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; vertical-align: top;">How?</td>
          <td style="padding: 10px; border: 1px solid #ddd;">All financial companies need to share customers' personal information to run their everyday business. In the section below, we list the reasons financial companies can share their customers' personal information; the reasons Speedy Credit Repair Inc. chooses to share; and whether you can limit this sharing.</td>
        </tr>
      </table>

      <table style="width: 100%; border-collapse: collapse; border: 2px solid #1a365d; margin: 20px 0;">
        <thead>
          <tr style="background: #e8f4fd;">
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Reasons we can share your personal information</th>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Does Speedy Credit Repair share?</th>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Can you limit this sharing?</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>For our everyday business purposes</strong> — such as to process your transactions, maintain your account(s), respond to court orders and legal investigations, or report to credit bureaus</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold;">YES</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">NO</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>For our marketing purposes</strong> — to offer our products and services to you</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold;">YES</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">NO</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>For joint marketing with other financial companies</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold;">NO</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">We don't share</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>For our affiliates' everyday business purposes</strong> — information about your transactions and experiences</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold;">YES</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">NO</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>For our affiliates' everyday business purposes</strong> — information about your creditworthiness</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold;">YES</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">YES</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>For our affiliates to market to you</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold;">YES</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">YES</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>For non-affiliates to market to you</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold;">NO</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">We don't share</td>
          </tr>
        </tbody>
      </table>

      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <p style="margin: 0; font-weight: bold;">To limit our sharing:</p>
        <p style="margin: 10px 0 0 0;">Call <strong>(888) 724-7344</strong> or email us at <a href="mailto:privacy@speedycreditrepair.com" style="color: #2563eb;">privacy@speedycreditrepair.com</a></p>
        <p style="margin: 10px 0 0 0; font-size: 14px;"><em>Please note: If you are a new customer, we can begin sharing your information 30 days from the date we sent this notice. When you are no longer our customer, we continue to share your information as described in this notice. However, you can contact us at any time to limit our sharing.</em></p>
      </div>

      <h2 style="color: #1a365d;">Questions?</h2>
      <p>Call <strong>(888) 724-7344</strong> or go to <a href="https://www.speedycreditrepair.com" style="color: #2563eb;">www.speedycreditrepair.com</a></p>

      <div style="margin-top: 40px; padding: 20px; border: 2px solid #1a365d; border-radius: 8px; background: #f8f9fa;">
        <h3 style="margin-top: 0; color: #1a365d;">What We Do</h3>

        <p><strong>How does Speedy Credit Repair Inc. protect my personal information?</strong></p>
        <p>To protect your personal information from unauthorized access and use, we use security measures that comply with federal law. These measures include computer safeguards and secured files and buildings.</p>

        <p><strong>How does Speedy Credit Repair Inc. collect my personal information?</strong></p>
        <p>We collect your personal information, for example, when you:</p>
        <ul style="margin-left: 20px;">
          <li>Apply for credit repair services</li>
          <li>Provide account information or give us your contact information</li>
          <li>Show your government-issued ID or give us your income information</li>
        </ul>

        <p><strong>Why can't I limit all sharing?</strong></p>
        <p>Federal law gives you the right to limit only:</p>
        <ul style="margin-left: 20px;">
          <li>Sharing for affiliates' everyday business purposes — information about your creditworthiness</li>
          <li>Affiliates from using your information to market to you</li>
          <li>Sharing for non-affiliates to market to you</li>
        </ul>
        <p>State laws and individual companies may give you additional rights to limit sharing.</p>
      </div>

      <div style="margin-top: 20px; padding: 20px; border: 2px solid #1a365d; border-radius: 8px; background: #f8f9fa;">
        <h3 style="margin-top: 0; color: #1a365d;">Definitions</h3>

        <p><strong>Affiliates</strong></p>
        <p>Companies related by common ownership or control. They can be financial and nonfinancial companies.</p>
        <ul style="margin-left: 20px;">
          <li><em>Our affiliates may include companies such as credit monitoring services or financial counseling providers with whom we have partnership agreements.</em></li>
        </ul>

        <p><strong>Non-affiliates</strong></p>
        <p>Companies not related by common ownership or control. They can be financial and nonfinancial companies.</p>
        <ul style="margin-left: 20px;">
          <li><em>Speedy Credit Repair Inc. does not share with non-affiliates so they can market to you.</em></li>
        </ul>

        <p><strong>Joint marketing</strong></p>
        <p>A formal agreement between nonaffiliated financial companies that together market financial products or services to you.</p>
        <ul style="margin-left: 20px;">
          <li><em>Speedy Credit Repair Inc. does not jointly market.</em></li>
        </ul>
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #333;">
        <p style="font-weight: bold;">ACKNOWLEDGMENT OF RECEIPT</p>
        <p>I, <strong>${contact.firstName || ''} ${contact.lastName || ''}</strong>, acknowledge that I have received and read this Privacy Notice.</p>
        <p style="margin-top: 20px;">
          __SIGNATURE__ <br/>
          <span style="font-size: 12px;">Client Signature</span>
        </p>
        <p style="margin-top: 20px;">
          Dated: __DATE__
        </p>
      </div>
    </div>
  `;
}

// ============================================================================
// ===== DOCUMENT 2: SERVICE CONTRACT (WITH INTERACTIVE INITIALS) =====
// ============================================================================

export function generateServiceContract(contact, plan) {
  const config = getPlanConfig(plan?.id);
  const clientName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Client';
  const dates = getContractDates(null, config.contractMonths);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const address = contact.address || {};
  const addressLine = `${address.street || ''}, ${address.city || ''}, ${address.state || ''} ${address.zip || ''}`.replace(/^, /, '').replace(/, $/, '') || 'Address on file';

  // ===== Build services list HTML =====
  const servicesListHtml = config.servicesIncluded.map(service => `${service}`).join('<br/>');

  // ===== Fee schedule HTML =====
  let feeScheduleHtml = `
    <h2 style="color: #1a365d;">FEE SCHEDULE</h2>
    <table style="width: 100%; border-collapse: collapse; border: 2px solid #1a365d; margin: 20px 0;">
      <thead>
        <tr style="background: #1a365d; color: white;">
          <th style="padding: 12px; text-align: left;">Fee Type</th>
          <th style="padding: 12px; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
  `;

  if (config.setupFee > 0) {
    feeScheduleHtml += `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">One-Time Setup Fee</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(config.setupFee)}</td>
      </tr>
    `;
  }

  if (config.monthlyFee > 0) {
    feeScheduleHtml += `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">Monthly Service Fee</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(config.monthlyFee)}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">Total Monthly Fees (${config.contractMonths} months)</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(config.totalServiceFee)}</td>
      </tr>
    `;
  }

  if (config.perItemFee > 0) {
    feeScheduleHtml += `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">Per-Item Success Fee (per bureau)</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(config.perItemFee)}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">Maximum Per-Item Fees</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(config.maxItemCost)}</td>
      </tr>
    `;
  }

  feeScheduleHtml += `
      <tr style="background: #f0fdf4;">
        <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Maximum Total Contract Cost</td>
        <td style="padding: 12px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: #10b981;">${formatCurrency(config.maxTotalCost)}</td>
      </tr>
    </tbody>
    </table>
  `;

  // ===== Cancellation clause =====
  let cancellationClause = '';
  if (config.cancelAfterPayment > 0) {
    cancellationClause = `
      <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
        <p style="font-weight: bold; color: #1a365d;">YOUR RIGHT TO CANCEL:</p>
        <p>Client may cancel SCR's services after ${config.cancelAfterPayment}${getOrdinalSuffix(config.cancelAfterPayment)} installment of ${formatCurrency(config.monthlyFee)} is made if Client believes that the efforts of SCR are not meeting reasonable expectations. Cancellation must be in writing, and Client must maintain the credit monitoring service accessible to SCR for 30 days after written cancellation date so deleted items to date may be billed. If access is not made available to SCR for those 30 days; Client will be charged ${formatCurrency(config.monthlyFee)} (the equivalent of one month's service). No refund in part or in full of monies billed or collected will be made if SCR has completed the agreed upon work.</p>
      </div>
    `;
  } else if (config.isMonthToMonth) {
    cancellationClause = `
      <p style="color: #10b981; font-weight: bold;">CANCELLATION POLICY: This is a month-to-month service and may be cancelled at any time with no penalty. __INITIAL_10__</p>
    `;
  }

  // ===== IDIQ requirement clause =====
  let idiqClause = '';
  if (config.requiresIDIQPostCancel) {
    idiqClause = `
      <p><strong>Credit Monitoring Requirement:</strong> Client acknowledges that IdentityIQ credit monitoring service (currently $21.86 per month) is required to be maintained for ${config.idiqPostCancelDays} days after cancellation or termination of this agreement. This ensures proper tracking of final dispute results and protects both parties. __INITIAL_8__</p>
    `;
  } else if (config.id === 'diy') {
    idiqClause = `
      <p><strong>Credit Monitoring:</strong> DIY plan does not require IDIQ subscription maintenance after cancellation. __INITIAL_8__</p>
    `;
  }

  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; line-height: 1.8; color: #333; max-width: 800px; margin: 0 auto;">
      <h1 style="text-align: center; color: #1a365d; font-size: 26px; border-bottom: 2px solid #1a365d; padding-bottom: 10px;">
        CONTRACT FOR CREDIT REPAIR SERVICE
      </h1>

      <div style="text-align: center; margin-bottom: 20px;">
        <p style="margin: 0; font-weight: bold;">Speedy Credit Repair Inc.</p>
        <p style="margin: 0;">117 Main St. Suite #202</p>
        <p style="margin: 0;">Huntington Beach, CA 92648</p>
        <p style="margin: 0;">(888) 724-7344</p>
      </div>

      <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
        <p style="margin: 0; font-weight: bold;">CLIENT INFORMATION:</p>
        <p style="margin: 5px 0 0 0;"><strong>Name:</strong> ${clientName}</p>
        <p style="margin: 5px 0 0 0;"><strong>Address:</strong> ${addressLine}</p>
        <p style="margin: 5px 0 0 0;"><strong>Phone:</strong> ${contact.phone || 'On file'}</p>
        <p style="margin: 5px 0 0 0;"><strong>Email:</strong> ${contact.email || 'On file'}</p>
      </div>

      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
        <p style="margin: 0; font-weight: bold;">SERVICE PLAN SELECTED:</p>
        <p style="margin: 5px 0 0 0;"><strong>${config.name}</strong></p>
        <p style="margin: 5px 0 0 0;">${config.serviceDescription}</p>
        <p style="margin: 10px 0 0 0;"><strong>Contract Term:</strong> ${config.isMonthToMonth ? 'Month-to-Month' : `${config.contractMonths} Months`}</p>
        <p style="margin: 5px 0 0 0;"><strong>Start Date:</strong> ${dates.startDate}</p>
        ${!config.isMonthToMonth ? `<p style="margin: 5px 0 0 0;"><strong>End Date:</strong> ${dates.endDate}</p>` : ''}
      </div>

      <h2 style="color: #1a365d;">AGREEMENT TERMS</h2>

      <p>This agreement ("Agreement") is entered into between <strong>${clientName}</strong> ("Client") and <strong>Speedy Credit Repair Inc.</strong> ("SCR") on <strong>${today}</strong>.</p>

      <p><strong>Initial to acknowledge:</strong> Client has received and reviewed the Consumer Credit File Rights document and understands the right to dispute credit report inaccuracies independently at no cost. __INITIAL_0__</p>

      <h2 style="color: #1a365d;">SERVICES PROVIDED</h2>

      <p>SCR agrees to provide credit repair services to Client for a period of ${config.contractMonths} ${config.contractMonths === 1 ? 'month' : 'months'} commencing on <strong>${dates.startDate}</strong>. Services include but are not limited to:</p>

      <p style="margin-left: 20px;">${servicesListHtml}</p>

      <p><strong>Initial to acknowledge services:</strong> Client understands the services SCR will provide as listed above. __INITIAL_1__</p>

      <h2 style="color: #1a365d;">MONTHLY SERVICE DEFINITION</h2>

      <p>The actions we take in the initial month will be the result of your requests for the initial review of your information. Ongoing monthly services and actions will be based on the results of the previous month's efforts but are also dependent on information received and shared with us by our client throughout the service period.</p>

      <p>The following items are examples of the actions, and/or products that define our monthly services. Our monthly fees are only collected upon completion of items as indicated below which would define our "Services."</p>

      ${config.perItemFee > 0 ? `
        <p>In addition to the monthly service charge, SCR will charge for successfully repaired, deleted, updated, positively added items, or corrected inaccurate negative items as directed by Client on the agreed "Pay as We Perform" price of <strong>${formatCurrency(config.perItemFee)} per item, per credit bureau</strong>.</p>

        <p>An "Item" is defined as one disputed "Item" repaired, deleted, updated, or corrected from one credit bureau. Items are payable in the billing month in which they are completed.</p>

        <p><em>Examples: Each of the three credit bureaus report the same "Item". The "Item" is repaired, deleted, updated, or corrected on two of the bureaus. You would be billed ${formatCurrency(config.perItemFee * 2)} for two "Items". ${formatCurrency(config.perItemFee)} X 2 = ${formatCurrency(config.perItemFee * 2)}. If the item is only affected on one of the three bureaus, the cost would be only ${formatCurrency(config.perItemFee)}.</em></p>

        <p><strong>Initial to acknowledge per-item fees:</strong> Client understands the per-item fee structure. __INITIAL_2__</p>
      ` : ''}

      <p>After corrected reports are received, SCR will communicate with Client again to discuss accomplishments and/or need for additional action. SCR will continue this process until all inaccurate negative information is repaired, deleted, updated, corrected, resolved, validated, or ${config.contractMonths * 30} days, whichever comes first. If an item comes back as valid, SCR will work with you to best address that item with said creditor.</p>

      <p>If negative credit information remains after ${config.contractMonths * 30} days, SCR and Client will discuss the specific entries and determine the appropriate plan of action if necessary. This may include client (at their option) making payment or settlement of said item to bring a balance to Zero.</p>

      ${cancellationClause}
      ${idiqClause}

      <p>At the termination of contract, if all money due has been paid, Client will be provided with all website addresses, passwords, and/or access codes for active services SCR may have required for the purpose of accessing any of Client's credit reports.</p>

      <p>SCR agrees not to provide any personal and/or confidential information to any person other than those stated in the Privacy Notice or as required by SCR during the normal course of services or as set forth in this agreement.</p>

      <p><strong>Initial to acknowledge privacy:</strong> Client understands SCR's privacy and confidentiality commitments. __INITIAL_3__</p>

      ${feeScheduleHtml}

      <p><strong>Initial to acknowledge fees:</strong> Client understands and agrees to the fee schedule above. __INITIAL_4__</p>

      <h2 style="color: #1a365d;">BILLING TERMS</h2>

      <p>${config.billingTiming === 'end' ? `Monthly service fees are billed at the END of each service month` : `Monthly service fees are billed at the BEGINNING of each service month`} on or after the <strong>${dates.billingDayOrdinal}</strong>.</p>

      ${config.perItemFee > 0 ? `
        <p>Per-item success fees are billed in the month the item is successfully repaired/deleted/updated.</p>
      ` : ''}

      <p><strong>Initial to acknowledge billing:</strong> Client understands when fees will be charged. __INITIAL_5__</p>

      <h2 style="color: #1a365d;">REPRESENTATIONS</h2>

      <p>It is understood and agreed that Speedy Credit Repair has made <strong>no guarantee</strong> that they can remove any or all negative entries from Client's credit reports. Legitimate negative entries cannot be removed from a client's credit report legally. Only time, a conscious effort, and a personal debt repayment plan will improve a credit report. SCR states that they will dispute all inaccurate negative entries as directed by Client in an attempt to repair, correct, or have deleted to the extent permitted by law.</p>

      <p>Client is aware that each of the actions to be performed by SCR can be performed independently by Client. However, Client represents that he or she has hired SCR to perform this service on his or her behalf.</p>

      <p><strong>Initial to acknowledge no guarantee:</strong> Client understands SCR makes no guarantee of specific results. __INITIAL_6__</p>

      ${config.hasCancellationPeriod ? `
        <p style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;"><strong>NOTICE:</strong> You may cancel this contract without penalty or obligation at any time before midnight on the 5th working day after the date on which you signed the contract. See the attached notice of cancellation form for an explanation of this right.</p>

        <p><strong>Initial to acknowledge cancellation rights:</strong> Client understands the 5-day cancellation period. __INITIAL_7__</p>
      ` : ''}

      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #333;">
        <p style="font-weight: bold;">SIGNATURES</p>
        <p>Signed on <strong>${today}</strong></p>
        
        <div style="margin-top: 30px;">
          <p style="margin: 0;"><strong>CLIENT SIGNATURE:</strong></p>
          <p style="margin: 10px 0 5px 0;">__SIGNATURE__ &nbsp;&nbsp;&nbsp; Date: __DATE__</p>
          <p style="margin: 0; font-size: 14px;"><strong>${clientName}</strong></p>
        </div>

        <div style="margin-top: 30px;">
          <p style="margin: 0;"><strong>SPEEDY CREDIT REPAIR SIGNATURE:</strong></p>
          <p style="margin: 10px 0 5px 0;">__SCR_SIGNATURE__ &nbsp;&nbsp;&nbsp; Date: __DATE__</p>
          <p style="margin: 0; font-size: 14px;"><strong>Christopher Lahage, CEO</strong></p>
          <p style="margin: 0; font-size: 12px; color: #666;">Speedy Credit Repair Inc.</p>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// ===== DOCUMENT 3: UNIFIED ACH AUTHORIZATION (MERGED) =====
// ============================================================================
// This REPLACES both ACH Monthly + ACH Items documents with ONE comprehensive form
// ============================================================================

export function generateUnifiedACHAuthorization(contact, plan) {
  const config = getPlanConfig(plan?.id);
  const clientName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Client';
  const fullName = `${contact.firstName || ''} ${contact.middleName || ''} ${contact.lastName || ''}`.trim().replace(/\s+/g, ' ') || 'Client';
  const dates = getContractDates(null, config.contractMonths);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const address = contact.address || {};
  const addressLine = `${address.street || ''}, ${address.city || ''}, ${address.state || ''} ${address.zip || ''}`.replace(/^, /, '').replace(/, $/, '') || 'Address on file';

  // ===== Determine what charges this plan has =====
  const hasMonthlyFee = config.monthlyFee > 0;
  const hasSetupFee = config.setupFee > 0;
  const hasPerItemFee = config.perItemFee > 0;

  // ===== Build authorization descriptions =====
  let authorizationSummary = '';
  let chargeTypes = [];

  if (hasSetupFee) {
    chargeTypes.push(`<strong>one-time setup fee of ${formatCurrency(config.setupFee)}</strong>`);
  }

  if (hasMonthlyFee) {
    chargeTypes.push(`<strong>recurring monthly service fee of ${formatCurrency(config.monthlyFee)}</strong> (billed ${config.billingTiming === 'end' ? 'at the end of' : 'at the beginning of'} each service month)`);
  }

  if (hasPerItemFee) {
    chargeTypes.push(`<strong>per-item success fees of ${formatCurrency(config.perItemFee)} per item, per bureau</strong> for successfully repaired/deleted items`);
  }

  if (chargeTypes.length === 1) {
    authorizationSummary = chargeTypes[0];
  } else if (chargeTypes.length === 2) {
    authorizationSummary = `${chargeTypes[0]} and ${chargeTypes[1]}`;
  } else {
    authorizationSummary = `${chargeTypes.slice(0, -1).join(', ')}, and ${chargeTypes[chargeTypes.length - 1]}`;
  }

  // ===== Build fee breakdown table =====
  let feeTable = `
    <table style="width: 100%; border-collapse: collapse; border: 2px solid #1a365d; margin: 20px 0;">
      <thead>
        <tr style="background: #1a365d; color: white;">
          <th style="padding: 12px; text-align: left;">Charge Type</th>
          <th style="padding: 12px; text-align: center;">Frequency</th>
          <th style="padding: 12px; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
  `;

  if (hasSetupFee) {
    feeTable += `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">Setup Fee</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">One-time (upon signing)</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(config.setupFee)}</td>
      </tr>
    `;
  }

  if (hasMonthlyFee) {
    feeTable += `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">Monthly Service Fee</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">On or after ${dates.billingDayOrdinal} each month</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(config.monthlyFee)}</td>
      </tr>
    `;
  }

  if (hasPerItemFee) {
    feeTable += `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">Per-Item Success Fee (per bureau)</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">As items are completed</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(config.perItemFee)}</td>
      </tr>
    `;
  }

  feeTable += `
      </tbody>
    </table>
  `;

  // ===== Advance notice clause =====
  let advanceNoticeClause = '';
  if (hasPerItemFee) {
    advanceNoticeClause = `<p><strong>Advance Notice:</strong> You will receive notice at least 10 days prior to any charge if your per-item fees for the month exceed <strong>$200.00</strong>. For charges under $200, no prior notification will be provided, and charges will appear on your bank statement as "ACH Debit" from Speedy Credit Repair Inc.</p>`;
  } else {
    advanceNoticeClause = `<p><strong>Payment Notification:</strong> No prior notification will be provided for scheduled charges. Charges will appear on your bank statement as "ACH Debit" from Speedy Credit Repair Inc.</p>`;
  }

  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; line-height: 1.8; color: #333; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 10px;">
        <p style="margin: 0; font-weight: bold;">117 Main St. Suite #202</p>
        <p style="margin: 0; font-weight: bold;">Huntington Beach, CA 92648</p>
        <p style="margin: 0; font-weight: bold;">(888) 724-7344</p>
      </div>

      <h1 style="text-align: center; color: #1a365d; font-size: 22px; border-bottom: 2px solid #1a365d; padding-bottom: 10px;">
        ACH Payment Authorization Form<br/>
        <span style="color: #d32f2f; font-size: 16px;">UNIFIED AUTHORIZATION FOR ALL CHARGES</span>
      </h1>

      <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #2563eb;">
        <p style="margin: 0; font-weight: bold;">✓ This single authorization covers ALL charges for your ${config.name} plan:</p>
        <ul style="margin: 10px 0 0 20px;">
          ${hasSetupFee ? `<li>One-time setup fee</li>` : ''}
          ${hasMonthlyFee ? `<li>Recurring monthly service fees</li>` : ''}
          ${hasPerItemFee ? `<li>Per-item success fees as completed</li>` : ''}
        </ul>
      </div>

      <p>Schedule your payments to be automatically deducted from your checking or savings account. Just complete and sign this form to get started!</p>

      <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p style="margin: 0; font-weight: bold;">Recurring Payments Will Make Your Life Easier:</p>
        <ul style="margin: 5px 0 0 20px;">
          <li>It's convenient (saving you time and postage)</li>
          <li>Your payment is always on time (even if you're out of town), eliminating late charges</li>
          <li>One authorization covers all payment types — no need for multiple forms</li>
        </ul>
      </div>

      <h2 style="color: #1a365d;">What You're Authorizing</h2>

      <p>I, <strong>${clientName}</strong>, authorize Speedy Credit Repair Inc. to charge my bank account indicated below for ${authorizationSummary}.</p>

      <h2 style="color: #1a365d;">Fee Schedule for Your Plan</h2>

      ${feeTable}

      ${advanceNoticeClause}

      <h2 style="color: #1a365d;">How It Works</h2>

      <p>You authorize regularly scheduled charges to your checking or savings account. You will be charged the amounts shown above according to their respective schedules. A receipt of payment will be emailed to you, and charges will appear on your bank statement as "ACH Debit" from Speedy Credit Repair Inc.</p>

      <h2 style="color: #1a365d;">Your Banking Information</h2>

      <p style="color: #666; font-style: italic; margin-bottom: 20px;">Please complete the information below. You may choose to provide this information now during contract signing, or you may defer providing your banking details and submit them later via phone or secure client portal.</p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; width: 30%;"><strong>Billing Address:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${addressLine}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Phone:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${contact.phone || 'On file'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${contact.email || 'On file'}</td>
        </tr>
      </table>

      <div style="border: 2px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; background: #fafafa;">
        <h3 style="margin-top: 0; color: #1a365d;">Bank Account Information</h3>
        
        <div style="margin: 15px 0;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Account Type:</label>
          <div style="display: flex; gap: 20px;">
            <label style="display: flex; align-items: center; gap: 5px;">
              <input type="radio" name="accountType" value="checking" data-field="accountType" />
              <span>Checking</span>
            </label>
            <label style="display: flex; align-items: center; gap: 5px;">
              <input type="radio" name="accountType" value="savings" data-field="accountType" />
              <span>Savings</span>
            </label>
          </div>
        </div>

        <div style="margin: 15px 0;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Name on Account:</label>
          <input 
            type="text" 
            data-field="accountName" 
            placeholder="${fullName}" 
            value="${fullName}"
            style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: inherit; font-size: 14px;"
          />
        </div>

        <div style="margin: 15px 0;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Bank Name:</label>
          <input 
            type="text" 
            data-field="bankName" 
            placeholder="Enter your bank name" 
            style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: inherit; font-size: 14px;"
          />
        </div>

        <div style="margin: 15px 0;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Account Number:</label>
          <input 
            type="text" 
            data-field="accountNumber" 
            placeholder="Enter your account number" 
            style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: inherit; font-size: 14px;"
          />
        </div>

        <div style="margin: 15px 0;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Bank Routing Number:</label>
          <input 
            type="text" 
            data-field="routingNumber" 
            placeholder="9-digit routing number" 
            maxlength="9"
            style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: inherit; font-size: 14px;"
          />
        </div>

        <div style="background: #fff3cd; padding: 12px; border-radius: 6px; margin-top: 15px; border-left: 3px solid #ffc107;">
          <p style="margin: 0; font-size: 13px; color: #856404;">
            <strong>Optional:</strong> You may leave banking information blank and provide it later by calling (888) 724-7344 or through your secure client portal. However, service cannot begin until banking information is on file.
          </p>
        </div>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #333;">
        <p><strong>AUTHORIZATION SIGNATURE:</strong></p>
        <p style="margin: 15px 0;">
          By signing below, I authorize Speedy Credit Repair Inc. to electronically debit my account for all charges associated with my <strong>${config.name}</strong> plan as described in this authorization.
        </p>
        <p style="color: #d32f2f; font-weight: bold; margin-top: 20px;">
          SIGNATURE: __SIGNATURE__ &nbsp;&nbsp;&nbsp; DATE: __DATE__
        </p>
        <p style="margin-top: 5px; font-size: 14px;"><strong>${clientName}</strong></p>
      </div>

      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1a365d; font-size: 16px;">Terms and Conditions</h3>
        <p style="font-size: 12px; color: #666; margin: 5px 0; line-height: 1.6;">
          I understand that this authorization will remain in effect until the designated expiration date or until I cancel it in writing, whichever comes first. I agree to notify Speedy Credit Repair in writing of any changes in my account information or termination of this authorization at least 15 days prior to the next billing date. If the above noted payment dates fall on a weekend or holiday, I understand that the payments may be executed on the closest banking day. I understand that because these are electronic transactions, these funds may be withdrawn from my account as soon as the above noted transaction dates.
        </p>
        <p style="font-size: 12px; color: #666; margin: 5px 0; line-height: 1.6;">
          <strong>NSF Policy:</strong> In the case of an ACH Transaction being rejected for Non-Sufficient Funds (NSF) I understand that Speedy Credit Repair may at its discretion attempt to process the charge again within 30 days and agree to an additional <strong>$25.00 charge for each attempt returned failed or NSF</strong> which will be initiated as a separate transaction from the authorized recurring payment.
        </p>
        <p style="font-size: 12px; color: #666; margin: 5px 0; line-height: 1.6;">
          I acknowledge that the origination of ACH transactions to my account must comply with the provisions of U.S. law. I agree not to dispute these scheduled transactions with my bank provided the transactions correspond to the terms indicated in this authorization form.
        </p>
      </div>

      <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; font-weight: bold; color: #1a365d;">Questions about ACH authorization or payment scheduling?</p>
        <p style="margin: 5px 0 0 0;">Call us at <strong>(888) 724-7344</strong> or email <a href="mailto:billing@speedycreditrepair.com" style="color: #2563eb;">billing@speedycreditrepair.com</a></p>
      </div>
    </div>
  `;
}

// ============================================================================
// ===== DOCUMENT 4: POWER OF ATTORNEY =====
// ============================================================================

export function generatePowerOfAttorney(contact) {
  const clientName = `${contact.firstName || ''} ${contact.middleName || ''} ${contact.lastName || ''}`.trim().replace(/\s+/g, ' ') || 'Client';
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const address = contact.address || {};
  const addressLine = `${address.street || ''} ${address.city || ''}, ${address.state || ''} ${address.zip || ''}`.replace(/^\s+/, '').trim() || 'Address on file';

  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; line-height: 1.8; color: #333; max-width: 800px; margin: 0 auto;">
      <h1 style="text-align: center; color: #1a365d; font-size: 26px; border-bottom: 2px solid #1a365d; padding-bottom: 10px;">
        POWER OF ATTORNEY
      </h1>

      <p>I, <strong>${clientName}</strong> the "Principal," of ${addressLine}, herewith appoint Speedy Credit Repair Inc. and/or Chris Lahage of 117 Main St. Suite #202 Huntington Beach, CA 92648, as my attorney in fact, to act in the place and stead and with the same authority as Principal would have to do the following acts as set forth in the following matters only:</p>

      <p>Signing of correspondence addressed to credit bureaus and creditors, obtaining credit information over the telephone, fax, internet, or through written correspondence from credit bureaus, creditors or collection agencies. I understand that these actions will be completed as executed by me or my name.</p>

      <p>If mediation of any debt is necessary, I give Speedy Credit Repair Inc. and/or its agents or officers the right to discuss information to help resolve the debt.</p>

      <p>I hereby release the bearer of this authorization as well as the recipient, included but not limited to the custodian of such records, Repository of the Court records, Credit Bureaus (TransUnion, Equifax, and Experian) and consumer reporting establishments.</p>

      <p><strong>I have the right to revoke or terminate this power at any time.</strong></p>

      <p>I have been made aware of the fact that I do not need to pay for this service and could attempt to repair my credit on my own.</p>

      <div style="margin-top: 30px; padding: 20px; border: 2px solid #ddd; border-radius: 8px;">
        <h3 style="margin-top: 0; color: #1a365d;">Power Giver Information:</h3>
        <p style="margin: 5px 0;"><strong>${clientName}</strong></p>
        <p style="margin: 5px 0;">${addressLine}</p>
        <p style="margin: 5px 0;">Social Security #: ___-__-____</p>
        <p style="margin: 20px 0 5px 0;">Signature: __SIGNATURE__</p>
        <p style="margin: 5px 0;">Date: __DATE__</p>
        <p style="margin: 5px 0;">Telephone Number: ${contact.phone || '_______________'}</p>
      </div>
    </div>
  `;
}

// ============================================================================
// ===== DOCUMENT 5: NOTICE OF CANCELLATION =====
// ============================================================================

export function generateNoticeOfCancellation(contact, plan) {
  const config = getPlanConfig(plan?.id);
  const dates = getContractDates(null, config.contractMonths);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // DIY plans don't need a cancellation notice
  if (!config.hasCancellationPeriod) {
    return `
      <div style="font-family: Georgia, 'Times New Roman', serif; line-height: 1.8; color: #333; max-width: 800px; margin: 0 auto; text-align: center; padding: 60px 20px;">
        <h2 style="color: #1a365d;">Notice of Cancellation</h2>
        <p style="font-size: 18px; color: #666;">This document is <strong>not applicable</strong> to your selected plan (${config.name}).</p>
        <p>Your plan is month-to-month and can be cancelled at any time with no penalty.</p>
      </div>
    `;
  }

  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; line-height: 1.8; color: #333; max-width: 800px; margin: 0 auto;">
      <h1 style="text-align: center; color: #1a365d; font-size: 26px; border-bottom: 2px solid #1a365d; padding-bottom: 10px;">
        Notice of Cancellation
      </h1>

      <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;">
        <p>You may cancel this contract, without any penalty or obligation, at any time before midnight on the <strong>5th working day</strong> which begins after the date the contract is signed by you.</p>

        <p>If you cancel, any payment made by you under this contract must be returned within 15 days following receipt by the seller of your cancellation notice.</p>
      </div>

      <p>To cancel this contract, mail or deliver a signed, dated copy of this cancellation notice, or any other written notice to:</p>

      <div style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center;">
        <p style="margin: 0; font-weight: bold; font-size: 16px;">SPEEDY CREDIT REPAIR INC.</p>
        <p style="margin: 5px 0;">117 Main St. Suite #202</p>
        <p style="margin: 5px 0;">Huntington Beach, California 92648</p>
        <p style="margin: 5px 0;">Or email: <a href="mailto:cancel@speedycreditrepair.com" style="color: #2563eb;">cancel@speedycreditrepair.com</a></p>
      </div>

      <p style="font-size: 18px; text-align: center;">Before Midnight on:</p>
      <p style="font-size: 22px; text-align: center; font-weight: bold; color: #d32f2f;">${dates.cancelDeadline}</p>

      <div style="margin-top: 40px; padding: 25px; border: 2px solid #ddd; border-radius: 8px;">
        <p style="font-weight: bold; font-size: 16px;">I hereby cancel this transaction.</p>
        <p style="margin-top: 20px;">DATE: _________________________________</p>
        <p style="margin-top: 20px;">_________________________________ <em>(Only sign here to actually cancel)</em></p>
        <p style="font-style: italic;">SIGNATURE</p>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #333;">
        <p><strong>ACKNOWLEDGMENT OF RECEIPT:</strong></p>
        <p>I acknowledge that I have received two (2) blank copies of this Notice of Cancellation form. I understand that I may download additional blank copies from my client portal at any time.</p>
        <p style="margin-top: 20px;">__SIGNATURE__ <em>(Sign to acknowledge receipt)</em></p>
        <p>Client Signature &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; __DATE__</p>
      </div>

      <div style="margin-top: 20px; padding: 15px; background: #e8f4fd; border-radius: 8px; text-align: center;">
        <p style="margin: 0;">📥 <strong>Two blank copies of this Notice of Cancellation are available for download below.</strong></p>
      </div>
    </div>
  `;
}

// ============================================================================
// ===== MASTER DOCUMENT GENERATOR =====
// ============================================================================
// V3.0 ENHANCED: Returns rich metadata for ContractSigningPortal.jsx
//   - signatureType: 'acknowledgment' | 'agreement' | 'authorization'
//   - hasInitials / initialCount: for click-to-initial system
//   - requiresBankingInfo: for ACH tab
//   - shortTitle: for tab labels (V3 FIX: "5-Day Right" not "3-Day Right")
// ============================================================================

export function generateAllDocuments(contact, plan) {
  const config = getPlanConfig(plan?.id);

  // Calculate actual initial count based on plan config
  // Base: 0 (CROA), 1 (services), 3 (privacy), 4 (fees), 5 (billing), 6 (no guarantee)
  let initialCount = 6;
  if (config.perItemFee > 0) initialCount++; // __INITIAL_2__
  if (config.hasCancellationPeriod) initialCount++; // __INITIAL_7__
  if (config.requiresIDIQPostCancel || config.id === 'diy') initialCount++; // __INITIAL_8__
  if (config.isMonthToMonth) initialCount++; // __INITIAL_10__

  return [
    {
      id: 'doc0',
      tabIndex: 0,
      title: 'Information Statement',
      shortTitle: 'Info',
      subtitle: 'Consumer Credit File Rights (CROA)',
      icon: 'Info',
      html: generateInformationStatement(contact),
      mustReadFirst: true,
      requiresSignature: true,
      signatureType: 'acknowledgment',
      isApplicable: true
    },
    {
      id: 'doc1',
      tabIndex: 1,
      title: 'Privacy Notice',
      shortTitle: 'Privacy',
      subtitle: 'How We Protect Your Information',
      icon: 'Shield',
      html: generatePrivacyNotice(contact),
      requiresSignature: true,
      signatureType: 'acknowledgment',
      isApplicable: true
    },
    {
      id: 'doc2',
      tabIndex: 2,
      title: 'Service Contract',
      shortTitle: 'Contract',
      subtitle: `${config.name} Agreement`,
      icon: 'FileText',
      html: generateServiceContract(contact, plan),
      requiresSignature: true,
      signatureType: 'agreement',
      hasInitials: true,
      initialCount: initialCount,
      isApplicable: true
    },
    {
      id: 'doc3',
      tabIndex: 3,
      title: 'ACH Authorization',
      shortTitle: 'ACH',
      subtitle: 'Unified Payment Authorization',
      icon: 'CreditCard',
      html: generateUnifiedACHAuthorization(contact, plan),
      requiresSignature: true,
      signatureType: 'authorization',
      requiresBankingInfo: true,
      isApplicable: true
    },
    {
      id: 'doc4',
      tabIndex: 4,
      title: 'Power of Attorney',
      shortTitle: 'POA',
      subtitle: 'Authorization to Act on Your Behalf',
      icon: 'Scale',
      html: generatePowerOfAttorney(contact),
      requiresSignature: true,
      signatureType: 'authorization',
      isApplicable: true
    },
    {
      id: 'doc5',
      tabIndex: 5,
      title: 'Notice of Cancellation',
      shortTitle: '5-Day Right',
      subtitle: '5-Day Cancellation Rights',
      icon: 'XCircle',
      html: generateNoticeOfCancellation(contact, plan),
      requiresSignature: config.hasCancellationPeriod,
      signatureType: 'acknowledgment',
      isApplicable: true
    }
  ];
}

// ============================================================================
// ===== BACKWARD COMPATIBILITY ALIASES =====
// ============================================================================
// The portal tries multiple function names. These ensure any import works.
export const generateAllContractDocuments = generateAllDocuments;
export const getContractDocuments = generateAllDocuments;

// ============================================================================
// ===== EXPORTS =====
// ============================================================================

export default {
  SERVICE_PLAN_CONFIGS,
  getPlanConfig,
  formatCurrency,
  getContractDates,
  generateInformationStatement,
  generatePrivacyNotice,
  generateServiceContract,
  generateUnifiedACHAuthorization,
  generatePowerOfAttorney,
  generateNoticeOfCancellation,
  generateAllDocuments,
  generateAllContractDocuments,
  getContractDocuments
};