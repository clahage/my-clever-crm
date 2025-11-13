/**
 * PRODUCTION DATA TEMPLATES
 *
 * This file contains empty data structures for your CRM.
 * DO NOT use fake/demo data in production.
 *
 * These are templates showing the expected data structure.
 * Populate with real client data from your database.
 */

// Client data structure
export const clientTemplate = {
  id: null,                    // Unique client ID
  name: "",                    // Client full name
  email: "",                   // Client email address
  phone: "",                   // Client phone number
  status: "Active",            // Active, Inactive, Pending
  creditScore: null,           // Current credit score
  joinDate: "",                // Date client joined (YYYY-MM-DD)
  balance: ""                  // Account balance
};

// Dispute data structure
export const disputeTemplate = {
  id: null,                    // Unique dispute ID
  clientId: null,              // Associated client ID
  clientName: "",              // Client name
  bureau: "",                  // Equifax, Experian, TransUnion
  account: "",                 // Account name/description
  status: "New",               // New, In Progress, Resolved, Rejected
  dateCreated: "",             // Date created (YYYY-MM-DD)
  type: ""                     // Dispute type (Validation, Verification, etc.)
};

// Letter data structure
export const letterTemplate = {
  id: null,                    // Unique letter ID
  clientId: null,              // Associated client ID
  clientName: "",              // Client name
  type: "",                    // Letter type
  status: "Draft",             // Draft, Sent, Delivered, Failed
  dateSent: "",                // Date sent (YYYY-MM-DD)
  bureau: ""                   // Target bureau
};

// Analytics data structure
export const analyticsTemplate = {
  revenue: "$0",               // Total revenue
  activeClients: 0,            // Number of active clients
  resolvedDisputes: 0,         // Number of resolved disputes
  lettersSent: 0               // Number of letters sent
};

// Invoice data structure
export const invoiceTemplate = {
  id: null,                    // Unique invoice ID
  client: "",                  // Client name
  amount: 0,                   // Invoice amount
  dueDate: "",                 // Due date (YYYY-MM-DD)
  status: "Unpaid"             // Paid, Unpaid, Overdue, Cancelled
};

// Export empty arrays - populate these from your database
export const demoClients = [];
export const demoDisputes = [];
export const demoLetters = [];
export const demoInvoices = [];
export const demoAnalytics = [];

// Instructions for developers:
// 1. Fetch real data from Firebase/Firestore
// 2. Use the template structures above as a guide
// 3. Never commit actual client data to version control
// 4. Use environment-specific data loading
