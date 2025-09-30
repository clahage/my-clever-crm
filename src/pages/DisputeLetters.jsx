import React, { useState } from 'react';
import { 
  FileText, 
  Edit3, 
  Save, 
  X, 
  Plus, 
  Copy, 
  Download,
  Send,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Mail,
  Printer,
  Trash2,
  Search,
  Filter,
  ChevronRight,
  Shield,
  BookOpen,
  Target
} from 'lucide-react';

const DisputeLetters = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingLetter, setEditingLetter] = useState(false);
  const [letterContent, setLetterContent] = useState('');
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    ssn: '',
    dob: '',
    phone: '',
    email: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Dispute Letter Templates
  const letterTemplates = [
    {
      id: '609',
      title: '609 Dispute Letter',
      category: 'verification',
      description: 'Request verification of debt under FCRA Section 609',
      law: 'FCRA Section 609',
      purpose: 'Forces credit bureaus to provide proof of verification',
      effectiveness: 'High',
      timeframe: '30 days response required',
      template: `[Your Name]
[Your Address]
[City, State ZIP]
[Your Phone]
[Your Email]

[Date]

[Credit Bureau Name]
[Credit Bureau Address]
[City, State ZIP]

RE: Request for Information Under FCRA Section 609
Account: [Account Number/Name]

Dear [Credit Bureau Name],

I am writing to request information regarding items on my credit report pursuant to my rights under Section 609 of the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681g.

Under Section 609, I have the right to request:
1. All information in my consumer file
2. The sources of information
3. Each person/company that has received my credit report
4. All information regarding inquiries

Specifically, I am requesting verification of the following account(s):
[List specific accounts to dispute]

Please provide:
• Original contracts or agreements bearing my signature
• Proof of original creditor verification
• Method of verification used
• Name and address of any person contacted for verification
• Documentation that establishes the accuracy of this debt

If you cannot provide adequate documentation proving this debt is mine and accurately reported, I request that you immediately remove it from my credit report.

I have enclosed the following as proof of identity:
• Copy of driver's license
• Copy of Social Security card
• Proof of address (utility bill)

Please respond within 30 days as required by law.

Sincerely,

[Your Signature]
[Your Printed Name]

Enclosures: Identity documents`
    },
    {
      id: '611',
      title: '611 Dispute Letter',
      category: 'verification',
      description: 'Method of verification request under FCRA Section 611',
      law: 'FCRA Section 611',
      purpose: 'Requests specific method used to verify disputed items',
      effectiveness: 'High',
      timeframe: '15 days after initial dispute',
      template: `[Your Name]
[Your Address]
[City, State ZIP]
[Your Phone]
[Your Email]

[Date]

[Credit Bureau Name]
[Credit Bureau Address]
[City, State ZIP]

RE: Method of Verification Request - FCRA Section 611
Previous Dispute Date: [Date of Original Dispute]

Dear [Credit Bureau Name],

I am writing regarding my previous dispute dated [previous dispute date]. I received your response stating the account(s) were "verified," however, you failed to provide the method of verification as required under Section 611 of the FCRA.

Under 15 U.S.C. § 1681i(a)(6)(B)(iii), upon request, you must promptly provide me with:
• A description of the procedure used to determine the accuracy and completeness of the information
• The business name, address, and telephone number of any furnisher contacted
• Detailed information about the verification

Disputed Account(s):
[Account Name] - Account #[Number]
[List all disputed accounts]

Your response of "verified" without providing the method of verification is insufficient and violates federal law. I am entitled to know:
1. Whether you contacted the furnisher electronically or by other means
2. What documents were provided to verify the debt
3. How the investigation was conducted
4. Who conducted the investigation

Please provide this information within 15 days. If you cannot provide proper verification, please delete these items immediately.

I reserve my right to pursue legal action for violations of the FCRA, including damages and attorney fees under 15 U.S.C. § 1681n and § 1681o.

Sincerely,

[Your Signature]
[Your Printed Name]

CC: Consumer Financial Protection Bureau
     Federal Trade Commission`
    },
    {
      id: '623',
      title: '623 Dispute Letter',
      category: 'furnisher',
      description: 'Direct dispute to data furnisher under FCRA Section 623',
      law: 'FCRA Section 623',
      purpose: 'Disputes directly with creditor/furnisher',
      effectiveness: 'Very High',
      timeframe: '30 days response required',
      template: `[Your Name]
[Your Address]
[City, State ZIP]
[Your Phone]
[Your Email]

[Date]

[Creditor/Furnisher Name]
[Address]
[City, State ZIP]

RE: Direct Dispute Under FCRA Section 623
Account Number: [Account Number]

Dear [Creditor Name],

I am writing to dispute inaccurate information you are reporting to the credit bureaus under Section 623 of the Fair Credit Reporting Act.

Account Information:
• Account Number: [Number]
• Date Opened: [Date]
• Reported Balance: $[Amount]
• Status: [Current Status]

The above account contains the following errors:
[Describe specific errors, e.g., "This account shows as late when all payments were made on time" or "This is not my account"]

Under FCRA Section 623(a)(1)(A), furnishers have a duty to provide accurate information. I am requesting that you:

1. Conduct a reasonable investigation of this dispute
2. Review all relevant information provided
3. Report the results to all credit reporting agencies
4. If information is inaccurate, report corrections to all CRAs
5. If information cannot be verified, request deletion from all CRAs

Enclosed Evidence:
[List any supporting documents]

You are required to respond within 30 days of receiving this notice. After completing your investigation, please send me written confirmation of:
• The results of your investigation
• Any corrections made to the credit bureaus
• If verified as accurate, the method of verification used

Failure to comply with Section 623 can result in civil liability for willful or negligent noncompliance.

Sincerely,

[Your Signature]
[Your Printed Name]

Enclosures: [List documents]`
    },
    {
      id: 'goodwill',
      title: 'Goodwill Letter',
      category: 'removal',
      description: 'Request removal of accurate negative item as courtesy',
      law: 'N/A - Courtesy Request',
      purpose: 'Appeals to creditor for goodwill deletion',
      effectiveness: 'Medium',
      timeframe: 'Varies by creditor',
      template: `[Your Name]
[Your Address]
[City, State ZIP]
[Your Phone]
[Your Email]

[Date]

[Creditor Name]
Attention: Customer Service Department
[Address]
[City, State ZIP]

RE: Goodwill Request for Account [Account Number]

Dear [Creditor Name] Customer Service,

I am writing to you as a loyal customer regarding my account ending in [last 4 digits]. I have been a customer since [year] and have maintained a positive relationship with your company.

I am reaching out concerning [number] late payment(s) reported on [date(s)]. I take full responsibility for these late payments, which occurred due to [brief explanation - job loss, medical emergency, etc.].

Since that difficult time, I have:
• Made all payments on time for the past [number] months/years
• Paid off the entire balance (if applicable)
• Established automatic payments to ensure timely payment
• Improved my overall financial management

My payment history with your company has otherwise been excellent, and this isolated incident does not reflect my commitment to meeting my obligations.

I am respectfully requesting that you consider removing the late payment(s) from my credit report as a gesture of goodwill. This would greatly help me as I am [trying to buy a home/refinance/etc.].

I value my relationship with [Company Name] and hope to continue as a customer for many years. I would be extremely grateful if you would consider this request.

Thank you for your time and consideration. I can be reached at [phone] or [email] if you need any additional information.

Sincerely,

[Your Signature]
[Your Printed Name]

Account Number: [Full account number]`
    },
    {
      id: 'pay-delete',
      title: 'Pay for Delete Letter',
      category: 'settlement',
      description: 'Offer payment in exchange for deletion',
      law: 'N/A - Negotiation',
      purpose: 'Negotiate removal in exchange for payment',
      effectiveness: 'Medium-High',
      timeframe: 'Varies',
      template: `[Your Name]
[Your Address]
[City, State ZIP]
[Your Phone]
[Your Email]

[Date]

[Collection Agency/Creditor Name]
[Address]
[City, State ZIP]

RE: Settlement Offer for Account [Account Number]
Original Creditor: [Original Creditor Name]
Current Balance: $[Amount]

Dear [Agency/Creditor Name],

I am writing regarding the above-referenced account. I acknowledge this debt and would like to resolve it completely.

Current Situation:
This account is currently showing as [status] on my credit report with a balance of $[amount]. I am prepared to resolve this matter immediately under the following terms:

Settlement Offer:
I am offering to pay [percentage]% of the balance ($[offer amount]) as payment in full if you agree to:

1. Accept $[amount] as payment in full satisfaction of this debt
2. Request complete deletion of this tradeline from all three credit bureaus (Experian, Equifax, TransUnion)
3. Provide written confirmation that the debt is settled in full
4. Cease all collection activities upon receipt of payment

Payment Terms:
• Payment will be made via [certified check/money order] within 5 business days of receiving your written agreement
• Payment contingent upon written agreement to delete

This offer expires [date - typically 15-30 days].

Please note: This is not an acknowledgment of the validity of the debt but rather an attempt to resolve this matter. If you agree to these terms, please send written confirmation on company letterhead including:
• Agreement to accept the offered amount
• Agreement to request deletion from all credit bureaus
• Agreement that debt will be considered satisfied in full

I look forward to resolving this matter promptly.

Sincerely,

[Your Signature]
[Your Printed Name]`
    },
    {
      id: 'validation',
      title: 'Debt Validation Letter',
      category: 'verification',
      description: 'Request validation within 30 days of first contact',
      law: 'FDCPA Section 809',
      purpose: 'Requires collector to validate debt',
      effectiveness: 'Very High',
      timeframe: 'Must send within 30 days',
      template: `[Your Name]
[Your Address]
[City, State ZIP]

[Date]

[Collection Agency Name]
[Address]
[City, State ZIP]

RE: Debt Validation Request Under FDCPA Section 809
Account Number: [Account Number]
Amount: $[Amount]

Dear [Collection Agency],

I received your [letter/call] on [date] regarding the above-referenced account. Under the Fair Debt Collection Practices Act (FDCPA), Section 809 (15 USC 1692g), I am requesting validation of this alleged debt.

Please provide the following:
1. The amount of the debt
2. The name of the original creditor
3. Proof that you are licensed to collect in my state
4. Proof that the Statute of Limitations has not expired
5. Complete payment history from the original creditor
6. Copy of the original signed contract or agreement
7. Proof of your authorization to collect this specific debt
8. Your license numbers and registered agent information

Under 15 USC 1692g Sec. 809(b), all collection activities must cease until you provide proper validation. This includes:
• Reporting or verifying this on my credit report
• Contacting me regarding this debt
• Attempting to collect this debt

If you cannot validate this debt:
• You must cease collection permanently
• Remove any negative credit reporting
• Send confirmation of deletion to me in writing

Please be advised that I am keeping detailed records of all correspondence and will not hesitate to exercise my rights under the FDCPA, including filing complaints with the CFPB and my state's Attorney General, as well as pursuing damages under Section 813 of the FDCPA.

This is not a refusal to pay, but a notice of my rights under federal law.

Sincerely,

[Your Signature]
[Your Printed Name]

Sent via Certified Mail #[Number]`
    },
    {
      id: 'cease-desist',
      title: 'Cease and Desist Letter',
      category: 'protection',
      description: 'Stop all collection communication',
      law: 'FDCPA Section 805(c)',
      purpose: 'Stops collection calls and letters',
      effectiveness: 'High',
      timeframe: 'Immediate upon receipt',
      template: `[Your Name]
[Your Address]
[City, State ZIP]

[Date]

[Collection Agency Name]
[Address]
[City, State ZIP]

RE: Cease and Desist Notice - FDCPA Section 805(c)
Account: [Account Number]

Dear [Collection Agency],

This letter serves as formal notice under Section 805(c) of the Fair Debt Collection Practices Act (15 USC 1692c) to cease and desist all communication with me regarding the above-referenced account.

Under the FDCPA, you must now:
• Stop all phone calls to me, my family, and my employer
• Stop all letters and written communication
• Stop all other forms of contact

The only exceptions under the law are:
• To acknowledge receipt of this notice
• To notify me of specific actions (lawsuit, stopping collection)
• To confirm cessation of collection efforts

Be advised that:
• All calls are being recorded
• All violations are being documented
• I am aware of my rights under federal and state law

Any further contact in violation of Section 805(c) will result in:
• Formal complaints to the CFPB and FTC
• Complaints to my state's Attorney General
• Legal action seeking statutory damages of $1,000 per violation
• Actual damages including emotional distress
• Attorney fees and costs

This notice is effective immediately upon receipt.

Sincerely,

[Your Signature]
[Your Printed Name]

Sent via Certified Mail #[Number]`
    },
    {
      id: 'identity-theft',
      title: 'Identity Theft Dispute',
      category: 'fraud',
      description: 'Dispute fraudulent accounts',
      law: 'FCRA Section 605B',
      purpose: 'Remove fraudulent accounts from credit report',
      effectiveness: 'Very High',
      timeframe: '5 business days',
      template: `[Your Name]
[Your Address]
[City, State ZIP]
[Your Phone]

[Date]

[Credit Bureau Name]
[Address]
[City, State ZIP]

RE: Identity Theft - Fraudulent Account Dispute
Police Report #: [Number]
FTC Identity Theft Report #: [Number]

Dear [Credit Bureau],

I am a victim of identity theft. The following accounts on my credit report are fraudulent and were opened without my knowledge or consent:

Fraudulent Accounts:
1. [Creditor Name] - Account #[Number]
2. [Creditor Name] - Account #[Number]
[List all fraudulent accounts]

Under Section 605B of the FCRA, I am requesting that you:
1. Block these fraudulent accounts within 4 business days
2. Notify the furnishers that these are fraudulent
3. Prevent reappearance of these items
4. Provide confirmation of blocking

Enclosed Documents:
• Identity Theft Report (FTC)
• Police Report
• Identity Theft Affidavit
• Proof of Identity

Additional Information:
• Date fraud discovered: [Date]
• Date reported to police: [Date]
• FTC report filed: [Date]

I did NOT open, authorize, or benefit from these accounts. Under FCRA Section 615(f), creditors may not report information they know resulted from identity theft.

Please expedite this request as required by law and send written confirmation of:
• Receipt of this dispute
• Blocking of fraudulent information
• Notice sent to furnishers
• Completion of investigation

Thank you for your immediate attention to this serious matter.

Sincerely,

[Your Signature]
[Your Printed Name]

Enclosures: Identity theft documentation`
    },
    {
      id: 'medical',
      title: 'Medical Debt Dispute',
      category: 'specialized',
      description: 'Dispute medical collections',
      law: 'FCRA & HIPAA',
      purpose: 'Challenge medical debt reporting',
      effectiveness: 'High',
      timeframe: '45 days',
      template: `[Your Name]
[Your Address]
[City, State ZIP]

[Date]

[Collection Agency/Credit Bureau]
[Address]
[City, State ZIP]

RE: Medical Debt Dispute - HIPAA Privacy Violation
Account: [Account Number]
Provider: [Medical Provider Name]

Dear [Agency/Bureau Name],

I am disputing medical debt currently reported on my credit file. This debt raises serious concerns under both the FCRA and HIPAA privacy regulations.

Account Details:
• Provider: [Name]
• Date of Service: [Date]
• Amount: $[Amount]
• Current Status: [Status]

Dispute Reasons:
1. HIPAA Violation: Reporting reveals protected health information
2. Insurance Processing: Insurance was not properly billed
3. Billing Error: Amount is incorrect/already paid
4. No Notice: Never received initial bill from provider

Under HIPAA regulations:
• Medical information cannot be disclosed without authorization
• Collection agencies cannot report medical details
• Credit bureaus cannot maintain unauthorized medical information

I am requesting:
1. Immediate removal of this medical debt from my credit report
2. Verification of HIPAA compliance authorization
3. Proof of proper insurance processing
4. Original itemized bill from provider
5. Validation of the debt amount and validity

Legal Notice:
Reporting medical debt without proper HIPAA authorization violates federal privacy laws. The FTC and HHS have issued joint guidance on medical debt collection and HIPAA compliance.

Please remove this item immediately or provide:
• Written HIPAA authorization signed by me
• Proof debt information excludes medical details
• Verification from original provider

Failure to comply may result in complaints to:
• Department of Health and Human Services (HHS)
• Consumer Financial Protection Bureau (CFPB)
• State Attorney General
• Legal action for privacy violations

Sincerely,

[Your Signature]
[Your Printed Name]`
    }
  ];

  // Filter templates
  const filteredTemplates = letterTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle template selection
  const selectTemplate = (template) => {
    setSelectedTemplate(template);
    // Replace placeholders with personal info
    let content = template.template;
    content = content.replace(/\[Your Name\]/g, personalInfo.fullName || '[Your Name]');
    content = content.replace(/\[Your Address\]/g, personalInfo.address || '[Your Address]');
    content = content.replace(/\[City, State ZIP\]/g, 
      personalInfo.city && personalInfo.state && personalInfo.zip 
        ? `${personalInfo.city}, ${personalInfo.state} ${personalInfo.zip}`
        : '[City, State ZIP]'
    );
    content = content.replace(/\[Your Phone\]/g, personalInfo.phone || '[Your Phone]');
    content = content.replace(/\[Your Email\]/g, personalInfo.email || '[Your Email]');
    content = content.replace(/\[Date\]/g, new Date().toLocaleDateString());
    
    setLetterContent(content);
    setEditingLetter(false);
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(letterContent);
    alert('Letter copied to clipboard!');
  };

  // Download as text file
  const downloadLetter = () => {
    const blob = new Blob([letterContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate?.title || 'dispute-letter'}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Print letter
  const printLetter = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Print Letter</title>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<pre>' + letterContent + '</pre>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dispute Letter Templates
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Professional credit dispute letters based on federal consumer protection laws
        </p>
      </div>

      {/* Personal Info Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-500" />
          Your Information (Auto-fills in templates)
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={personalInfo.fullName}
            onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            placeholder="Street Address"
            value={personalInfo.address}
            onChange={(e) => setPersonalInfo({...personalInfo, address: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            placeholder="City"
            value={personalInfo.city}
            onChange={(e) => setPersonalInfo({...personalInfo, city: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            placeholder="State"
            value={personalInfo.state}
            onChange={(e) => setPersonalInfo({...personalInfo, state: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            placeholder="ZIP Code"
            value={personalInfo.zip}
            onChange={(e) => setPersonalInfo({...personalInfo, zip: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={personalInfo.phone}
            onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <input
            type="email"
            placeholder="Email"
            value={personalInfo.email}
            onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            placeholder="SSN (Last 4)"
            value={personalInfo.ssn}
            onChange={(e) => setPersonalInfo({...personalInfo, ssn: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <input
            type="date"
            placeholder="Date of Birth"
            value={personalInfo.dob}
            onChange={(e) => setPersonalInfo({...personalInfo, dob: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            {/* Search and Filter */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                />
              </div>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              >
                <option value="all">All Categories</option>
                <option value="verification">Verification</option>
                <option value="furnisher">Furnisher</option>
                <option value="removal">Removal</option>
                <option value="settlement">Settlement</option>
                <option value="protection">Protection</option>
                <option value="fraud">Fraud</option>
                <option value="specialized">Specialized</option>
              </select>
            </div>

            {/* Templates */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  onClick={() => selectTemplate(template)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {template.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {template.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                          {template.law}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          template.effectiveness === 'Very High' ? 'bg-green-100 text-green-700' :
                          template.effectiveness === 'High' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {template.effectiveness}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Letter Editor */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {selectedTemplate ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedTemplate.title}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {selectedTemplate.purpose}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1 text-gray-500">
                          <Shield className="w-3 h-3" />
                          {selectedTemplate.law}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-3 h-3" />
                          {selectedTemplate.timeframe}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {editingLetter ? (
                        <>
                          <button
                            onClick={() => setEditingLetter(false)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded"
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              selectTemplate(selectedTemplate);
                              setEditingLetter(false);
                            }}
                            className="p-2 text-red-600 hover:bg-red-100 rounded"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingLetter(true)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={copyToClipboard}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                            title="Copy"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={downloadLetter}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={printLetter}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                            title="Print"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Letter Content */}
                <div className="p-6">
                  {editingLetter ? (
                    <textarea
                      value={letterContent}
                      onChange={(e) => setLetterContent(e.target.value)}
                      className="w-full h-[600px] p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                      <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 dark:text-gray-300">
                        {letterContent}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      <p className="font-semibold mb-1">Important Instructions:</p>
                      <ul className="space-y-1">
                        <li>• Send via certified mail with return receipt requested</li>
                        <li>• Keep copies of all correspondence</li>
                        <li>• Include required documentation (ID, proof of address)</li>
                        <li>• Track response deadlines carefully</li>
                        <li>• Consider consulting with a credit repair professional</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a Template
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a dispute letter template from the list to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Dispute Letter Best Practices
        </h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-700 dark:text-blue-300">
          <div>
            <h4 className="font-medium mb-2">Before Sending:</h4>
            <ul className="space-y-1">
              <li>• Get your credit reports from all three bureaus</li>
              <li>• Document all errors with highlighting</li>
              <li>• Gather supporting documentation</li>
              <li>• Make copies of everything</li>
              <li>• Check statute of limitations</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">After Sending:</h4>
            <ul className="space-y-1">
              <li>• Track certified mail receipts</li>
              <li>• Mark response deadlines on calendar</li>
              <li>• Document all responses received</li>
              <li>• Follow up if no response within timeframe</li>
              <li>• File CFPB complaints for violations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisputeLetters;