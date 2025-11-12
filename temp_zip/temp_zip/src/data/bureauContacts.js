export const bureauContacts = {
  experian: {
    name: 'Experian',
    faxPrimary: '+19727903901',  // Current as of 2024
    faxBackup: '+14698143570',   // Backup number
    mailingAddress: {
      name: 'Experian',
      street: 'P.O. Box 4500',
      city: 'Allen',
      state: 'TX',
      zip: '75013'
    },
    disputeAddress: {
      name: 'Experian Dispute Department',
      street: 'P.O. Box 4000',
      city: 'Allen', 
      state: 'TX',
      zip: '75013'
    }
  },
  equifax: {
    name: 'Equifax',
    faxPrimary: '+14048851000',  // Current as of 2024
    faxBackup: '+14048851001',
    mailingAddress: {
      name: 'Equifax Information Services LLC',
      street: 'P.O. Box 740256',
      city: 'Atlanta',
      state: 'GA',
      zip: '30374-0256'
    },
    disputeAddress: {
      name: 'Equifax Dispute Department',
      street: 'P.O. Box 740256',
      city: 'Atlanta',
      state: 'GA',
      zip: '30374-0256'
    }
  },
  transunion: {
    name: 'TransUnion',
    faxPrimary: '+16109465698',  // Current as of 2024
    faxBackup: '+16104558789',
    mailingAddress: {
      name: 'TransUnion LLC',
      street: 'Consumer Dispute Center',
      street2: 'P.O. Box 2000',
      city: 'Chester',
      state: 'PA',
      zip: '19016'
    },
    disputeAddress: {
      name: 'TransUnion Dispute Department',
      street: 'P.O. Box 2000',
      city: 'Chester',
      state: 'PA',
      zip: '19016'
    }
  }
};

// Function to get active fax number with fallback
export function getBureauFaxNumber(bureau, useBackup = false) {
  const bureauData = bureauContacts[bureau.toLowerCase()];
  if (!bureauData) {
    throw new Error(`Unknown bureau: ${bureau}`);
  }
  return useBackup ? bureauData.faxBackup : bureauData.faxPrimary;
}

// Function to get mailing address formatted
export function getBureauMailingAddress(bureau, forDispute = true) {
  const bureauData = bureauContacts[bureau.toLowerCase()];
  if (!bureauData) return null;
  
  const address = forDispute ? bureauData.disputeAddress : bureauData.mailingAddress;
  return `${address.name}
${address.street}
${address.street2 ? address.street2 + '\n' : ''}${address.city}, ${address.state} ${address.zip}`;
}