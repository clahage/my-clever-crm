// Demo data for all CRM functionality
export const demoClients = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "(555) 123-4567",
    status: "Active",
    creditScore: 580,
    joinDate: "2025-01-15",
    balance: "$2,500"
  },
  {
    id: 2,
    name: "Jane Smith", 
    email: "jane.smith@email.com",
    phone: "(555) 234-5678",
    status: "Active",
    creditScore: 620,
    joinDate: "2025-02-01",
    balance: "$1,800"
  },
  // Add 10+ more clients
];

export const demoDisputes = [
  {
    id: 1,
    clientId: 1,
    clientName: "John Doe",
    bureau: "Equifax",
    account: "Chase Credit Card",
    status: "In Progress",
    dateCreated: "2025-08-01",
    type: "Validation"
  },
  // Add more disputes
];

export const demoLetters = [
  {
    id: 1,
    clientId: 1,
    clientName: "John Doe",
    type: "Validation Letter",
    status: "Sent",
    dateSent: "2025-08-10",
    bureau: "Experian"
  },
  // Add more letters
];

export const demoAnalytics = [
  { id: 1, label: "Revenue", value: "$12,500" },
  { id: 2, label: "Active Clients", value: 12 },
  { id: 3, label: "Resolved Disputes", value: 34 },
  { id: 4, label: "Letters Sent", value: 56 },
];

export const demoInvoices = [
  { id: 1, client: "John Doe", amount: 250, dueDate: "2025-08-15", status: "Paid" },
  { id: 2, client: "Jane Smith", amount: 180, dueDate: "2025-08-20", status: "Due" },
];

// Add demo data for calendar, communications, export, bulk, automation, progress portal, etc.
