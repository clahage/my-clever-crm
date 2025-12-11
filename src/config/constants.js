// ============================================================================
// constants.js - Company Information Constants
// ============================================================================
// Path: /src/config/constants.js
//
// PURPOSE:
// Central location for all company information used throughout the application.
// Update here to change everywhere.
//
// COPYRIGHT:
// © 1995-{currentYear} Speedy Credit Repair Inc. | Created by Chris Lahage | All Rights Reserved
// ============================================================================

export const COMPANY_INFO = {
  name: 'Speedy Credit Repair Inc.',
  legalName: 'Speedy Credit Repair Inc.',
  tradeName: 'Speedy Credit Repair',
  shortName: 'SpeedyCRM',

  // Address
  address: {
    street: '117 Main Street Suite 202',
    city: 'Huntington Beach',
    state: 'California',
    stateAbbr: 'CA',
    zip: '92648',
    full: '117 Main Street Suite 202, Huntington Beach, California 92648',
    fullShort: '117 Main Street Suite 202, Huntington Beach, CA 92648'
  },

  // Contact
  phone: '888-724-7344',
  phoneFormatted: '(888) 724-7344',
  phoneDotted: '888.724.7344',
  phoneLink: 'tel:+18887247344',
  email: 'Contact@speedycreditrepair.com',
  emailSupport: 'Contact@speedycreditrepair.com',
  emailInfo: 'Contact@speedycreditrepair.com',
  emailAdmin: 'Contact@speedycreditrepair.com',
  website: 'https://speedycreditrepair.com',
  websiteDisplay: 'speedycreditrepair.com',

  // Branding
  founded: 1995,
  owner: 'Chris Lahage',
  creator: 'Chris Lahage',
  trademark: 'Speedy Credit Repair®',

  // Legal
  licenses: {
    bbb: 'A+ BBB Rating',
    googleRating: '4.9',
    googleReviews: '580+',
    established: 'Est. 1995'
  }
};

export const COPYRIGHT_TEXT = `© ${COMPANY_INFO.founded}-${new Date().getFullYear()} ${COMPANY_INFO.name} | Created by ${COMPANY_INFO.owner} | All Rights Reserved`;

export const TRADEMARK_TEXT = `${COMPANY_INFO.trademark} is a registered trademark (USPTO). Violations prosecuted.`;

export const TRADEMARK_TEXT_FULL = `${COMPANY_INFO.trademark} is a registered trademark of ${COMPANY_INFO.name}, registered with the United States Patent and Trademark Office (USPTO). Unauthorized use of this trademark is a violation of federal law and will be prosecuted to the fullest extent of the law.`;

export const FOOTER_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Contact Us', href: '/contact' }
];

// Export current year helper
export const getCurrentYear = () => new Date().getFullYear();

// Export formatted copyright with dynamic year
export const getFormattedCopyright = () =>
  `© ${COMPANY_INFO.founded}-${getCurrentYear()} ${COMPANY_INFO.name} | Created by ${COMPANY_INFO.owner} | All Rights Reserved`;
