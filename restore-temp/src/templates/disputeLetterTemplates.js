export const letterTemplates = {
  initial: {
    name: 'Initial Dispute Letter',
    template: (clientInfo, disputeItems, bureau) => `
${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${clientInfo.fullName}
${clientInfo.address}
${clientInfo.city}, ${clientInfo.state} ${clientInfo.zip}
SSN: XXX-XX-${clientInfo.ssnLast4}
DOB: ${clientInfo.dateOfBirth}

${bureau.name}
${bureau.disputeAddress.street}
${bureau.disputeAddress.city}, ${bureau.disputeAddress.state} ${bureau.disputeAddress.zip}

RE: Request for Investigation of Inaccurate Information

To Whom It May Concern:

I am writing to dispute the following inaccurate information in my credit report. I have circled the items I dispute on the attached copy of my credit report.

The following accounts are inaccurate:

${disputeItems.map((item, index) => `
${index + 1}. Account: ${item.creditor}
   Account Number: ${item.accountNumber}
   Reason: ${item.reason}
   Details: ${item.details || 'This account is not mine and I have never authorized its opening.'}
`).join('')}

Under the Fair Credit Reporting Act (FCRA), Section 611, I am requesting that you investigate these items and provide me with the results of your investigation within 30 days. If you cannot verify the accuracy of this information, please delete it from my credit report immediately.

Please send me written confirmation that these items have been removed or corrected. Additionally, please provide me with an updated copy of my credit report reflecting these changes.

I am enclosing the following supporting documentation:
- Copy of my driver's license
- Copy of recent utility bill as proof of address
- Copy of Social Security card

Thank you for your prompt attention to this matter.

Sincerely,

${clientInfo.fullName}

Enclosures: Supporting documentation
`
  },
  
  reinvestigation: {
    name: 'Reinvestigation Letter',
    template: (clientInfo, disputeItems, bureau, previousDisputeDate) => `
${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${clientInfo.fullName}
${clientInfo.address}
${clientInfo.city}, ${clientInfo.state} ${clientInfo.zip}
SSN: XXX-XX-${clientInfo.ssnLast4}

${bureau.name} - Reinvestigation Request
${bureau.disputeAddress.street}
${bureau.disputeAddress.city}, ${bureau.disputeAddress.state} ${bureau.disputeAddress.zip}

RE: Second Request - Reinvestigation of Disputed Items

To Whom It May Concern:

On ${previousDisputeDate}, I sent you a request to investigate inaccurate items on my credit report. To date, these items have not been corrected or removed.

The following items remain inaccurate and must be removed:

${disputeItems.map((item, index) => `
${index + 1}. ${item.creditor} - Account #${item.accountNumber}
   Status: ${item.currentStatus}
   This item remains inaccurate because: ${item.reason}
`).join('')}

Under FCRA Section 611(a)(1)(A), you are required to conduct a reasonable reinvestigation within 30 days. Your failure to remove these unverified items constitutes a violation of federal law.

I demand immediate removal of these items or provide me with:
1. The method of verification
2. The name and address of any person contacted
3. Copies of all documentation used to verify

Sincerely,

${clientInfo.fullName}
`
  },

  directCreditor: {
    name: 'Direct Creditor Dispute',
    template: (clientInfo, account, creditor) => `
${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${creditor.name}
${creditor.address}

RE: Dispute of Account #${account.accountNumber}

Dear Sir/Madam:

I am writing to dispute the reporting of the above-referenced account to the credit bureaus. This account is being reported inaccurately.

Account Details:
- Account Number: ${account.accountNumber}
- Reported Balance: ${account.balance}
- Reported Status: ${account.status}

${account.disputeReason}

I request that you:
1. Investigate this account immediately
2. Correct the reporting to all credit bureaus
3. Send me written confirmation of the correction

Under FCRA Section 623, you are required to investigate and correct any inaccurate information you have reported.

Sincerely,

${clientInfo.fullName}
`
  }
};

export function generateDisputeLetter(templateType, data) {
  const template = letterTemplates[templateType];
  if (!template) {
    throw new Error(`Unknown template type: ${templateType}`);
  }
  return template.template(data.clientInfo, data.disputeItems, data.bureau, data.previousDisputeDate);
}