// ===================================================================
// IDIQ Credit Monitoring System - Barrel Exports
// Organized structure for all IDIQ-related components
// ===================================================================

// Dashboard Components
export { default as IDIQDashboard } from './dashboard/IDIQDashboard';
export { default as IDIQControlCenter } from './dashboard/IDIQControlCenter';

// Enrollment Components
export { default as IDIQEnrollment } from './enrollment/IDIQEnrollment';
export { default as IDIQEnrollmentWizard } from './enrollment/IDIQEnrollmentWizard';
export { default as IDIQEnrollmentAssistant } from './enrollment/IDIQEnrollmentAssistant';

// Client Management Components
export { default as AddClientForm } from './client/AddClientForm';
export { default as EditClientForm } from './client/EditClientForm';
export { default as ClientDetailView } from './client/ClientDetailView';
export { default as ClientCreditCard } from './client/ClientCreditCard';
export { default as ClientCreditPortal } from './client/ClientCreditPortal';

// Analytics Components
export { default as CreditAnalytics } from './analytics/CreditAnalytics';

// Configuration
export { default as IDIQConfig } from './config/IDIQConfig';
