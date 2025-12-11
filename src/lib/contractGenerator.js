// ============================================================================
// CONTRACT GENERATOR UTILITIES
// ============================================================================
// Pure utility functions for contract generation and data merging
// Used by contract components and Cloud Functions
// All functions are side-effect free
//
// Created By: Chris Lahage - Speedy Credit Repair Inc.
// © 1995-2025 Speedy Credit Repair Inc. All Rights Reserved
// ============================================================================

import { formatCurrency } from './pricingCalculator';

// ===== GENERATE CONTRACT NUMBER =====
// Creates a unique contract number with format: SCR-YYYYMMDD-XXXXX
// @param {string} prefix - Contract prefix (default: 'SCR')
// @returns {string} - Unique contract number
export const generateContractNumber = (prefix = 'SCR') => {
  try {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Generate random 5-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomCode = '';
    for (let i = 0; i < 5; i++) {
      randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `${prefix}-${year}${month}${day}-${randomCode}`;
  } catch (error) {
    console.error('Error generating contract number:', error);
    return `${prefix}-ERROR-${Date.now()}`;
  }
};

// ===== MERGE TEMPLATE DATA =====
// Replaces merge fields in HTML template with actual data
// Supports {{FIELD_NAME}} syntax
// @param {string} template - HTML template string
// @param {Object} clientData - Client information
// @param {Object} planData - Service plan information
// @param {Object} additionalData - Any additional merge fields
// @returns {string} - Merged HTML content
export const mergeTemplateData = (template, clientData = {}, planData = {}, additionalData = {}) => {
  try {
    let mergedContent = template;

    // Prepare all merge fields
    const mergeFields = {
      // Client information
      CLIENT_NAME: `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim(),
      CLIENT_FIRST_NAME: clientData.firstName || '',
      CLIENT_LAST_NAME: clientData.lastName || '',
      CLIENT_EMAIL: clientData.email || '',
      CLIENT_PHONE: formatPhoneNumber(clientData.phone) || '',
      CLIENT_ADDRESS: formatAddress(clientData.address) || '',
      CLIENT_CITY: clientData.address?.city || '',
      CLIENT_STATE: clientData.address?.state || '',
      CLIENT_ZIP: clientData.address?.zip || '',
      CLIENT_SSN_LAST4: clientData.ssnLast4 || '',
      CLIENT_DOB: formatDate(clientData.dateOfBirth) || '',

      // Service plan information
      PLAN_NAME: planData.name || '',
      PLAN_DESCRIPTION: planData.description || '',
      MONTHLY_FEE: formatCurrency(planData.pricing?.monthly || 0),
      MONTHLY_FEE_AMOUNT: planData.pricing?.monthly || 0,
      SETUP_FEE: formatCurrency(planData.pricing?.setupFee || 0),
      SETUP_FEE_AMOUNT: planData.pricing?.setupFee || 0,
      PER_DELETION_FEE: formatCurrency(planData.pricing?.perDeletion || 0),
      PER_DELETION_AMOUNT: planData.pricing?.perDeletion || 0,
      CONTRACT_MONTHS: planData.pricing?.contractMonths || 0,
      CONTRACT_LENGTH: formatContractLength(planData.pricing?.contractMonths),

      // Plan features as bulleted list
      PLAN_FEATURES: formatFeatureList(planData.features),

      // Contract metadata
      CONTRACT_NUMBER: additionalData.contractNumber || generateContractNumber(),
      CONTRACT_DATE: formatDate(additionalData.contractDate || new Date()),
      CONTRACT_START_DATE: formatDate(additionalData.startDate || new Date()),
      CONTRACT_END_DATE: formatDate(additionalData.endDate || calculateEndDate(additionalData.startDate, planData.pricing?.contractMonths)),

      // Company information
      COMPANY_NAME: 'Speedy Credit Repair Inc.',
      COMPANY_ADDRESS: '123 Main Street', // Update with actual address
      COMPANY_CITY: 'Your City',
      COMPANY_STATE: 'CA',
      COMPANY_ZIP: '12345',
      COMPANY_PHONE: '(800) 555-0123', // Update with actual phone
      COMPANY_EMAIL: 'chris@speedycreditrepair.com',
      COMPANY_WEBSITE: 'https://myclevercrm.com',
      OWNER_NAME: 'Chris Lahage',

      // State-specific information
      STATE_NAME: clientData.address?.state || '',
      STATE_COMPLIANCE: getStateCompliance(clientData.address?.state),

      // Current date/time
      CURRENT_DATE: formatDate(new Date()),
      CURRENT_YEAR: new Date().getFullYear(),

      // Payment information
      FIRST_PAYMENT_DATE: formatDate(additionalData.firstPaymentDate || new Date()),
      TOTAL_FIRST_PAYMENT: formatCurrency((planData.pricing?.setupFee || 0) + (planData.pricing?.monthly || 0)),

      // Additional merge fields
      ...additionalData
    };

    // Replace all merge fields
    Object.entries(mergeFields).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      mergedContent = mergedContent.replace(regex, value || '');
    });

    // Clean up any remaining unreplaced merge fields
    mergedContent = mergedContent.replace(/{{[^}]+}}/g, '[DATA NOT AVAILABLE]');

    return mergedContent;
  } catch (error) {
    console.error('Error merging template data:', error);
    return template;
  }
};

// ===== FORMAT PHONE NUMBER =====
// Formats phone number as (XXX) XXX-XXXX
const formatPhoneNumber = (phone) => {
  try {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  } catch (error) {
    return phone || '';
  }
};

// ===== FORMAT ADDRESS =====
// Formats complete address as single line
const formatAddress = (address) => {
  try {
    if (!address) return '';
    const parts = [
      address.street1,
      address.street2,
      address.city,
      address.state,
      address.zip
    ].filter(Boolean);
    return parts.join(', ');
  } catch (error) {
    return '';
  }
};

// ===== FORMAT DATE =====
// Formats date as MM/DD/YYYY
export const formatDate = (date) => {
  try {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();

    return `${month}/${day}/${year}`;
  } catch (error) {
    return '';
  }
};

// ===== FORMAT CONTRACT LENGTH =====
// Formats contract length in months as readable text
const formatContractLength = (months) => {
  try {
    if (!months || months === 0) return 'Month-to-month (no contract)';
    if (months === 1) return '1 month';
    if (months === 12) return '1 year';
    if (months === 24) return '2 years';
    return `${months} months`;
  } catch (error) {
    return '';
  }
};

// ===== FORMAT FEATURE LIST =====
// Formats features array as HTML bulleted list
const formatFeatureList = (features) => {
  try {
    if (!Array.isArray(features) || features.length === 0) return '';
    return '<ul>' + features.map(f => `<li>${f}</li>`).join('') + '</ul>';
  } catch (error) {
    return '';
  }
};

// ===== CALCULATE END DATE =====
// Calculates contract end date based on start date and months
export const calculateEndDate = (startDate, months) => {
  try {
    if (!startDate || !months) return null;
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + months);
    return date;
  } catch (error) {
    return null;
  }
};

// ===== GET STATE COMPLIANCE TEXT =====
// Returns state-specific compliance text for contracts
const getStateCompliance = (state) => {
  try {
    // State-specific credit repair regulations
    const stateCompliance = {
      CA: 'This contract complies with California Credit Services Act requirements.',
      TX: 'This contract complies with Texas Credit Services Organization Act.',
      NY: 'This contract complies with New York General Business Law Article 29-H.',
      FL: 'This contract complies with Florida Credit Services Organizations Act.',
      IL: 'This contract complies with Illinois Credit Services Organizations Act.',
      // Add more states as needed
    };

    return stateCompliance[state] || 'This contract complies with all applicable federal and state credit repair laws.';
  } catch (error) {
    return '';
  }
};

// ===== CALCULATE PAYMENT SCHEDULE =====
// Generates payment schedule for contract
// @param {Object} plan - Service plan object
// @param {Date} startDate - Contract start date
// @returns {Array} - Payment schedule
export const calculatePaymentSchedule = (plan, startDate = new Date()) => {
  try {
    if (!plan || !plan.pricing) return [];

    const schedule = [];
    const months = plan.pricing.contractMonths || 12;
    const monthlyFee = plan.pricing.monthly;
    const setupFee = plan.pricing.setupFee;

    // First payment (setup + first month)
    if (setupFee > 0) {
      schedule.push({
        date: new Date(startDate),
        description: 'Setup Fee + First Month',
        amount: setupFee + monthlyFee,
        breakdown: {
          setupFee,
          monthlyFee
        }
      });
    } else {
      schedule.push({
        date: new Date(startDate),
        description: 'First Month Payment',
        amount: monthlyFee,
        breakdown: {
          monthlyFee
        }
      });
    }

    // Subsequent monthly payments
    for (let i = 1; i < months; i++) {
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(paymentDate.getMonth() + i);

      schedule.push({
        date: paymentDate,
        description: `Month ${i + 1} Payment`,
        amount: monthlyFee,
        breakdown: {
          monthlyFee
        }
      });
    }

    return schedule;
  } catch (error) {
    console.error('Error calculating payment schedule:', error);
    return [];
  }
};

// ===== GET STATE REQUIREMENTS =====
// Returns state-specific contract requirements
// @param {string} state - Two-letter state code
// @returns {Object} - State requirements
export const getStateRequirements = (state) => {
  try {
    const requirements = {
      // California requirements
      CA: {
        requiresNotary: false,
        cancellationPeriod: 5, // Days
        cancellationText: 'You may cancel this contract without penalty or obligation within 5 business days from the date the contract is signed.',
        bondRequired: true,
        bondAmount: 100000,
        additionalDisclosures: [
          'You have the right to proceed against the surety bond for any damages you may recover in a civil action.',
          'This contract may be cancelled by you at any time without further obligation or payment of any kind.'
        ]
      },

      // Texas requirements
      TX: {
        requiresNotary: true,
        cancellationPeriod: 3,
        cancellationText: 'You may cancel this contract without penalty or obligation within 3 business days from the date the contract is signed.',
        bondRequired: true,
        bondAmount: 10000,
        additionalDisclosures: [
          'All fees must be disclosed in advance.',
          'No fees may be charged until services have been fully performed.'
        ]
      },

      // New York requirements
      NY: {
        requiresNotary: false,
        cancellationPeriod: 3,
        cancellationText: 'You may cancel this contract without penalty or obligation within 3 business days from the date the contract is signed.',
        bondRequired: false,
        additionalDisclosures: [
          'This contract may not be assigned without your written consent.'
        ]
      },

      // Florida requirements
      FL: {
        requiresNotary: false,
        cancellationPeriod: 5,
        cancellationText: 'You may cancel this contract without penalty or obligation within 5 business days from the date the contract is signed.',
        bondRequired: true,
        bondAmount: 10000,
        additionalDisclosures: []
      },

      // Default for all other states
      DEFAULT: {
        requiresNotary: false,
        cancellationPeriod: 3,
        cancellationText: 'You may cancel this contract without penalty or obligation within 3 business days from the date the contract is signed.',
        bondRequired: false,
        additionalDisclosures: [
          'This contract complies with the Credit Repair Organizations Act (CROA).'
        ]
      }
    };

    return requirements[state] || requirements.DEFAULT;
  } catch (error) {
    console.error('Error getting state requirements:', error);
    return requirements.DEFAULT;
  }
};

// ===== VALIDATE CONTRACT DATA =====
// Validates contract data before generation
// @param {Object} data - Contract data to validate
// @returns {Object} - { valid: boolean, errors: Array }
export const validateContractData = (data) => {
  const errors = [];

  try {
    // Required client fields
    if (!data.clientData) {
      errors.push('Client data is required');
    } else {
      if (!data.clientData.firstName) errors.push('Client first name is required');
      if (!data.clientData.lastName) errors.push('Client last name is required');
      if (!data.clientData.email) errors.push('Client email is required');
      if (!data.clientData.address?.state) errors.push('Client state is required');
    }

    // Required plan fields
    if (!data.planData) {
      errors.push('Plan data is required');
    } else {
      if (!data.planData.id) errors.push('Plan ID is required');
      if (!data.planData.name) errors.push('Plan name is required');
      if (!data.planData.pricing) errors.push('Plan pricing is required');
    }

    // Validate template exists
    if (!data.template || typeof data.template !== 'string') {
      errors.push('Contract template is required');
    }

    // Validate dates
    if (data.startDate && isNaN(new Date(data.startDate).getTime())) {
      errors.push('Invalid start date');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  } catch (error) {
    console.error('Error validating contract data:', error);
    return {
      valid: false,
      errors: ['Validation error: ' + error.message]
    };
  }
};

// ===== GENERATE SIGNATURE BLOCK =====
// Creates HTML for signature blocks
// @param {string} type - 'client' or 'company'
// @returns {string} - HTML signature block
export const generateSignatureBlock = (type = 'client') => {
  try {
    const blocks = {
      client: `
        <div class="signature-block">
          <div class="signature-line">
            <label>Client Signature: ______________________________</label>
            <span class="signature-date">Date: ______________</span>
          </div>
          <div class="signature-print">
            <label>Print Name: ______________________________</label>
          </div>
        </div>
      `,
      company: `
        <div class="signature-block">
          <div class="signature-line">
            <label>Speedy Credit Repair Representative: ______________________________</label>
            <span class="signature-date">Date: ______________</span>
          </div>
          <div class="signature-print">
            <label>Print Name: Chris Lahage, Owner</label>
          </div>
        </div>
      `
    };

    return blocks[type] || blocks.client;
  } catch (error) {
    console.error('Error generating signature block:', error);
    return '';
  }
};

// ===== SANITIZE HTML =====
// Basic HTML sanitization for user input in contracts
// @param {string} html - HTML to sanitize
// @returns {string} - Sanitized HTML
export const sanitizeHTML = (html) => {
  try {
    if (!html) return '';

    // Remove potentially dangerous tags and attributes
    let sanitized = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '');

    return sanitized;
  } catch (error) {
    console.error('Error sanitizing HTML:', error);
    return html;
  }
};

// ===== EXPORT ALL CONTRACT GENERATOR FUNCTIONS =====
export default {
  generateContractNumber,
  mergeTemplateData,
  formatDate,
  calculateEndDate,
  calculatePaymentSchedule,
  getStateRequirements,
  validateContractData,
  generateSignatureBlock,
  sanitizeHTML
};
