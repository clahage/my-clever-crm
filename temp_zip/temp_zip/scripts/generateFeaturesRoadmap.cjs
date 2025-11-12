// This script generates a PDF listing current and planned features/functions for your CRM.
const { jsPDF } = require('jspdf');
const fs = require('fs');

// Current features/functions (from src/features.js and code analysis)
const currentFeatures = [
  'Dashboard (Stats, Analytics, Calendar)',
  'Leads Management (CRUD, Search, Urgency, Scoring)',
  'Contacts Management',
  'Client Profiles',
  'Revenue Estimator',
  'Client Map',
  'Drip Campaigns & Autoresponders',
  'AI Receptionist (Status, Call Handling)',
  'File Upload',
  'E-Contracts',
  'Change Requests Admin',
  'Activity Log',
  'Widget Permissions Manager',
  'Role Management',
  'Settings (General, Templates, Notifications)',
  'Export Analytics (CSV, PDF)',
  'Multi-method Authentication',
  'Dark Mode',
  'Feature Tutorials/Onboarding',
  'Customizable Dashboard Widgets',
  'Lead Scoring',
  'Calendar Integration',
  'Consultant Booking (basic, future integration planned)',
];

// Planned/future features (from code comments, TODOs, and roadmap)
const plannedFeatures = [
  'Full campaign builder with email templates, scheduling, analytics',
  'Notes & Activities Timeline for Contacts',
  'Documents Management (Contracts, POA, ACH forms)',
  'Deeper Google Calendar/Booking API integration',
  'Advanced AI document parsing',
  'More granular permissions and feature toggles',
  'Mobile app version',
  'Client portal',
  'Automated credit report pulling',
  'More dashboard widgets and customizations',
  'Enhanced reporting and export options',
  'Integrations with more e-signature providers',
  'Bulk import/export improvements',
  'In-app chat/support',
  'White-labeling/branding options',
  'More onboarding/tutorial content',
];

const doc = new jsPDF();

doc.setFontSize(18);
doc.text('My Clever CRM: Features & Roadmap', 14, 18);
doc.setFontSize(12);
doc.text('Generated: ' + new Date().toLocaleString(), 14, 26);

doc.setFontSize(14);
doc.text('Current Features & Functions:', 14, 38);
doc.setFontSize(11);
let y = 44;
currentFeatures.forEach((f, i) => {
  doc.text(`- ${f}`, 16, y);
  y += 7;
  if (y > 270) { doc.addPage(); y = 20; }
});

doc.setFontSize(14);
doc.text('Planned / Upcoming Features:', 14, y + 8);
y += 14;
doc.setFontSize(11);
plannedFeatures.forEach((f, i) => {
  doc.text(`- ${f}`, 16, y);
  y += 7;
  if (y > 270) { doc.addPage(); y = 20; }
});

doc.save('clever-crm-features-roadmap.pdf');
console.log('PDF generated: clever-crm-features-roadmap.pdf');
