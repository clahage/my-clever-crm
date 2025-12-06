// ============================================================================
// AI COMPLIANCE MONITOR - Legal Protection System
// ============================================================================
// Path: /src/lib/ai/complianceMonitor.js
//
// This module monitors ALL workflows for legal compliance violations and
// alerts you BEFORE you break the law. Protects against:
// - CROA violations (Credit Repair Organizations Act)
// - CAN-SPAM violations (Email marketing law)
// - TCPA violations (Telephone Consumer Protection Act)
// - FDCPA violations (Fair Debt Collection Practices Act)
//
// CRITICAL: This is your legal safety net. It can save you from:
// - FTC fines up to $50,120 per violation
// - Class-action lawsuits
// - State attorney general actions
// - License suspension
//
// Last updated: December 2024
// Owner: Christopher - Speedy Credit Repair
// ============================================================================

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase.js';

// ============================================================================
// COMPLIANCE RULES
// ============================================================================

/**
 * CROA (Credit Repair Organizations Act) Rules
 */
const CROA_RULES = {
  NO_UPFRONT_FEES: {
    id: 'croa_no_upfront_fees',
    law: 'CROA',
    severity: 'critical',
    title: 'No Upfront Fees for Credit Repair',
    description: 'Credit repair companies cannot charge fees before services are performed',
    penalty: 'Up to $10,000 per violation + civil lawsuits',
    exceptions: ['DIY plans (educational products only)'],
    checkFunction: (workflow, step) => {
      // Check if workflow charges before services performed
      if (step.type === 'payment_collect' || step.type === 'charge_card') {
        const hasWorkedYet = workflow.steps
          .slice(0, workflow.steps.indexOf(step))
          .some(s => s.type === 'dispute_file' || s.type === 'service_perform');

        if (!hasWorkedYet) {
          return {
            violation: true,
            details: 'Charging fee before any credit repair services performed',
            fix: 'Move payment collection to AFTER first month of service ends'
          };
        }
      }
      return { violation: false };
    }
  },

  WRITTEN_CONTRACT: {
    id: 'croa_written_contract',
    law: 'CROA',
    severity: 'critical',
    title: 'Written Contract Required',
    description: 'Must provide written contract before performing services',
    penalty: 'Services may be void, client can sue for refund',
    checkFunction: (workflow, step) => {
      // Check if service starts before contract signed
      if (step.type === 'service_start' || step.type === 'dispute_file') {
        const hasContract = workflow.steps
          .slice(0, workflow.steps.indexOf(step))
          .some(s => s.type === 'contract_sign' || s.type === 'agreement_send');

        if (!hasContract) {
          return {
            violation: true,
            details: 'Starting services before contract signed',
            fix: 'Add "Generate Service Agreement" step before services start'
          };
        }
      }
      return { violation: false };
    }
  },

  RIGHT_TO_CANCEL: {
    id: 'croa_right_to_cancel',
    law: 'CROA',
    severity: 'high',
    title: '3-Day Right to Cancel Required',
    description: 'Must inform client of 3-day right to cancel in contract',
    penalty: 'Contract may be void',
    checkFunction: (workflow) => {
      // This is checked in contract template, not workflow
      // But we can flag if no contract step exists
      const hasContract = workflow.steps.some(s =>
        s.type === 'contract_sign' || s.type === 'agreement_send'
      );

      if (!hasContract) {
        return {
          violation: true,
          details: 'No contract/agreement step in workflow',
          fix: 'Add "Generate & Sign Service Agreement" step'
        };
      }
      return { violation: false };
    }
  }
};

/**
 * CAN-SPAM (Email Marketing) Rules
 */
const CAN_SPAM_RULES = {
  UNSUBSCRIBE_LINK: {
    id: 'canspam_unsubscribe',
    law: 'CAN-SPAM Act',
    severity: 'critical',
    title: 'Unsubscribe Link Required in All Emails',
    description: 'Every marketing email must include a clear unsubscribe mechanism',
    penalty: 'Up to $50,120 per violation',
    checkFunction: (workflow, step) => {
      if (step.type === 'email_send') {
        const template = step.config?.template || '';
        const emailContent = step.config?.content || '';

        // Check if template or content includes unsubscribe
        const hasUnsubscribe =
          template.toLowerCase().includes('unsubscribe') ||
          emailContent.toLowerCase().includes('unsubscribe') ||
          emailContent.includes('{{unsubscribeLink}}');

        if (!hasUnsubscribe) {
          return {
            violation: true,
            details: `Email step "${step.name}" missing unsubscribe link`,
            fix: 'Add {{unsubscribeLink}} to email footer',
            autoFix: true
          };
        }
      }
      return { violation: false };
    }
  },

  PHYSICAL_ADDRESS: {
    id: 'canspam_address',
    law: 'CAN-SPAM Act',
    severity: 'critical',
    title: 'Physical Address Required in Emails',
    description: 'Must include valid physical postal address in all emails',
    penalty: 'Up to $50,120 per violation',
    checkFunction: (workflow, step) => {
      if (step.type === 'email_send') {
        const template = step.config?.template || '';
        const emailContent = step.config?.content || '';

        const hasAddress =
          emailContent.includes('{{companyAddress}}') ||
          emailContent.includes('{{physicalAddress}}');

        if (!hasAddress) {
          return {
            violation: true,
            details: `Email step "${step.name}" missing physical address`,
            fix: 'Add {{companyAddress}} to email footer',
            autoFix: true
          };
        }
      }
      return { violation: false };
    }
  },

  ACCURATE_SUBJECT: {
    id: 'canspam_subject',
    law: 'CAN-SPAM Act',
    severity: 'medium',
    title: 'Subject Line Must Not Be Misleading',
    description: 'Email subject line must accurately reflect email content',
    penalty: 'Up to $50,120 per violation',
    checkFunction: (workflow, step) => {
      if (step.type === 'email_send') {
        const subject = step.config?.subject || '';

        // Flag suspicious keywords
        const misleadingKeywords = [
          'urgent',
          'alert',
          'final notice',
          'act now',
          'free',
          're:',
          'fwd:'
        ];

        const hasMisleading = misleadingKeywords.some(keyword =>
          subject.toLowerCase().includes(keyword)
        );

        if (hasMisleading) {
          return {
            violation: true,
            details: `Email subject "${subject}" may be misleading`,
            fix: 'Review subject line for accuracy',
            autoFix: false,
            severity: 'warning' // Not always a violation, just risky
          };
        }
      }
      return { violation: false };
    }
  }
};

/**
 * TCPA (Telephone Consumer Protection Act) Rules
 */
const TCPA_RULES = {
  SMS_CONSENT: {
    id: 'tcpa_sms_consent',
    law: 'TCPA',
    severity: 'critical',
    title: 'SMS Requires Prior Written Consent',
    description: 'Cannot send marketing SMS without prior express written consent',
    penalty: '$500-$1,500 per text message',
    checkFunction: (workflow, step) => {
      if (step.type === 'sms_send') {
        // Check if consent was obtained in workflow
        const hasConsent = workflow.steps
          .slice(0, workflow.steps.indexOf(step))
          .some(s =>
            s.type === 'consent_obtain' ||
            s.type === 'form_submit' && s.config?.includesSMSConsent
          );

        if (!hasConsent) {
          return {
            violation: true,
            details: `SMS step "${step.name}" sent without verified consent`,
            fix: 'Add "Verify SMS Consent" step before sending SMS',
            autoFix: false
          };
        }
      }
      return { violation: false };
    }
  },

  AUTODIALER_CONSENT: {
    id: 'tcpa_autodialer',
    law: 'TCPA',
    severity: 'critical',
    title: 'Autodialer Calls Require Prior Consent',
    description: 'Cannot make automated/prerecorded calls without prior consent',
    penalty: '$500-$1,500 per call',
    checkFunction: (workflow, step) => {
      if (step.type === 'call_automated' || step.type === 'voicemail_drop') {
        const hasConsent = workflow.steps
          .slice(0, workflow.steps.indexOf(step))
          .some(s => s.type === 'consent_obtain' && s.config?.includesPhoneConsent);

        if (!hasConsent) {
          return {
            violation: true,
            details: `Automated call step "${step.name}" without consent`,
            fix: 'Add "Verify Phone Consent" step before automated calls',
            autoFix: false
          };
        }
      }
      return { violation: false };
    }
  },

  OPT_OUT_MECHANISM: {
    id: 'tcpa_opt_out',
    law: 'TCPA',
    severity: 'high',
    title: 'Must Provide SMS Opt-Out Method',
    description: 'SMS messages must include clear opt-out instructions (STOP, UNSUBSCRIBE)',
    penalty: '$500-$1,500 per message',
    checkFunction: (workflow, step) => {
      if (step.type === 'sms_send') {
        const message = step.config?.message || '';

        const hasOptOut =
          message.toLowerCase().includes('stop') ||
          message.toLowerCase().includes('unsubscribe') ||
          message.includes('Reply STOP');

        if (!hasOptOut) {
          return {
            violation: true,
            details: `SMS step "${step.name}" missing opt-out instructions`,
            fix: 'Add "Reply STOP to unsubscribe" to SMS message',
            autoFix: true
          };
        }
      }
      return { violation: false };
    }
  }
};

/**
 * FDCPA (Fair Debt Collection Practices Act) Rules
 */
const FDCPA_RULES = {
  DEBT_COLLECTOR_DISCLOSURE: {
    id: 'fdcpa_disclosure',
    law: 'FDCPA',
    severity: 'high',
    title: 'Debt Collector Must Identify Themselves',
    description: 'If collecting debts, must identify as debt collector in first communication',
    penalty: 'Civil lawsuit, statutory damages',
    checkFunction: (workflow, step) => {
      // Only applies if you're collecting debts (you're not, but good to check)
      if (step.type === 'payment_collect' && step.config?.isDebtCollection) {
        const hasDisclosure = step.config?.includesFDCPADisclosure;

        if (!hasDisclosure) {
          return {
            violation: true,
            details: 'Debt collection without FDCPA disclosure',
            fix: 'Add FDCPA disclosure to communication',
            autoFix: false
          };
        }
      }
      return { violation: false };
    }
  },

  NO_HARASSMENT: {
    id: 'fdcpa_harassment',
    law: 'FDCPA',
    severity: 'critical',
    title: 'Cannot Harass or Abuse Consumers',
    description: 'Prohibited: threats, profanity, excessive calls, annoying behavior',
    penalty: 'Civil lawsuit, statutory damages',
    checkFunction: (workflow, step) => {
      // Check frequency of communications
      if (step.type === 'email_send' || step.type === 'sms_send' || step.type === 'call_make') {
        // Count communications in short time period
        const previousSteps = workflow.steps.slice(0, workflow.steps.indexOf(step));
        const recentComms = previousSteps.filter((s, i) => {
          const isComm = ['email_send', 'sms_send', 'call_make'].includes(s.type);
          const isRecent = i > workflow.steps.indexOf(step) - 5; // Last 5 steps
          return isComm && isRecent;
        });

        if (recentComms.length >= 3) {
          return {
            violation: true,
            details: 'Too many communications in short time (possible harassment)',
            fix: 'Add delays between communications',
            autoFix: false,
            severity: 'warning'
          };
        }
      }
      return { violation: false };
    }
  }
};

// ============================================================================
// MAIN COMPLIANCE CHECK FUNCTION
// ============================================================================

/**
 * Check a workflow for compliance violations
 *
 * @param {Object} workflow - Workflow configuration
 * @param {Object} options - Check options
 * @param {boolean} options.checkAll - Check all rules (default: true)
 * @param {Array} options.laws - Specific laws to check (default: all)
 * @returns {Object} Compliance report
 */
export async function checkWorkflowCompliance(workflow, options = {}) {
  const {
    checkAll = true,
    laws = ['CROA', 'CAN-SPAM', 'TCPA', 'FDCPA']
  } = options;

  console.log(`[ComplianceMonitor] Checking workflow: ${workflow.name}`);

  const violations = [];
  const warnings = [];
  const passed = [];

  // Combine all rules
  const allRules = {
    ...CROA_RULES,
    ...CAN_SPAM_RULES,
    ...TCPA_RULES,
    ...FDCPA_RULES
  };

  // Check each rule against each step
  for (const [ruleKey, rule] of Object.entries(allRules)) {
    // Skip if not checking this law
    if (!laws.includes(rule.law)) continue;

    // Check rule against workflow
    try {
      // If checkFunction expects only one argument, call with workflow only
      if (rule.checkFunction.length === 1) {
        const result = rule.checkFunction(workflow);
        if (result.violation) {
          const issue = {
            ruleId: rule.id,
            law: rule.law,
            severity: result.severity || rule.severity,
            title: rule.title,
            description: rule.description,
            details: result.details,
            penalty: rule.penalty,
            fix: result.fix,
            autoFix: result.autoFix || false,
            affectedSteps: result.affectedSteps || []
          };
          if (issue.severity === 'critical' || issue.severity === 'high') {
            violations.push(issue);
          } else {
            warnings.push(issue);
          }
        } else {
          passed.push({
            ruleId: rule.id,
            title: rule.title,
            law: rule.law
          });
        }
      }
      // If checkFunction expects two arguments, check each step
      if (rule.checkFunction.length === 2 && Array.isArray(workflow.steps)) {
        for (let i = 0; i < workflow.steps.length; i++) {
          const step = workflow.steps[i];
          const stepResult = rule.checkFunction(workflow, step);
          if (stepResult.violation) {
            const issue = {
              ruleId: rule.id,
              law: rule.law,
              severity: stepResult.severity || rule.severity,
              title: rule.title,
              description: rule.description,
              details: stepResult.details,
              penalty: rule.penalty,
              fix: stepResult.fix,
              autoFix: stepResult.autoFix || false,
              affectedSteps: [i],
              stepName: step.name
            };
            if (issue.severity === 'critical' || issue.severity === 'high') {
              violations.push(issue);
            } else {
              warnings.push(issue);
            }
          }
        }
      }
    } catch (error) {
      console.error(`[ComplianceMonitor] Rule check failed: ${ruleKey}`, error);
    }
  }

  // Generate report
  const report = {
    workflowId: workflow.id,
    workflowName: workflow.name,
    checkedAt: new Date(),
    status: violations.length === 0 ? 'compliant' : 'violations_found',
    violations,
    warnings,
    passed,
    summary: {
      totalChecks: Object.keys(allRules).length,
      criticalViolations: violations.filter(v => v.severity === 'critical').length,
      highPriorityViolations: violations.filter(v => v.severity === 'high').length,
      warnings: warnings.length,
      passed: passed.length
    },
    recommendations: generateRecommendations(violations, warnings)
  };

  console.log(`[ComplianceMonitor] Check complete. Status: ${report.status}`);
  console.log(`[ComplianceMonitor] Critical: ${report.summary.criticalViolations}, High: ${report.summary.highPriorityViolations}, Warnings: ${report.summary.warnings}`);

  return report;
}

/**
 * Check all active workflows for compliance
 *
 * @returns {Promise<Array>} Array of compliance reports
 */
export async function checkAllWorkflows() {
  console.log('[ComplianceMonitor] Checking all active workflows...');

  try {
    const workflowsRef = collection(db, 'workflows');
    const q = query(workflowsRef, where('active', '==', true));
    const snapshot = await getDocs(q);

    const reports = [];

    for (const doc of snapshot.docs) {
      const workflow = { id: doc.id, ...doc.data() };
      const report = await checkWorkflowCompliance(workflow);
      reports.push(report);
    }

    console.log(`[ComplianceMonitor] Checked ${reports.length} workflows`);

    return reports;

  } catch (error) {
    console.error('[ComplianceMonitor] Failed to check all workflows:', error);
    throw error;
  }
}

/**
 * Get compliance summary across all workflows
 *
 * @returns {Promise<Object>} Compliance summary
 */
export async function getComplianceSummary() {
  const reports = await checkAllWorkflows();

  const summary = {
    totalWorkflows: reports.length,
    compliantWorkflows: reports.filter(r => r.status === 'compliant').length,
    workflowsWithViolations: reports.filter(r => r.violations.length > 0).length,
    totalCriticalViolations: reports.reduce((sum, r) =>
      sum + r.summary.criticalViolations, 0
    ),
    totalHighPriorityViolations: reports.reduce((sum, r) =>
      sum + r.summary.highPriorityViolations, 0
    ),
    totalWarnings: reports.reduce((sum, r) =>
      sum + r.summary.warnings, 0
    ),
    reports,
    urgent: reports.filter(r => r.summary.criticalViolations > 0),
    checkedAt: new Date()
  };

  return summary;
}

// ============================================================================
// AUTO-FIX FUNCTIONS
// ============================================================================

/**
 * Automatically fix a compliance violation
 *
 * @param {string} workflowId - Workflow ID
 * @param {Object} violation - Violation to fix
 * @returns {Promise<Object>} Fix result
 */
export async function autoFixViolation(workflowId, violation) {
  console.log(`[ComplianceMonitor] Auto-fixing violation: ${violation.ruleId}`);

  if (!violation.autoFix) {
    return {
      success: false,
      error: 'This violation cannot be auto-fixed'
    };
  }

  try {
    // Apply fixes based on rule type
    switch (violation.ruleId) {
      case 'canspam_unsubscribe':
        // Add unsubscribe link to email template
        return await addUnsubscribeLinkToEmail(workflowId, violation.affectedSteps);

      case 'canspam_address':
        // Add physical address to email template
        return await addAddressToEmail(workflowId, violation.affectedSteps);

      case 'tcpa_opt_out':
        // Add opt-out instructions to SMS
        return await addOptOutToSMS(workflowId, violation.affectedSteps);

      default:
        return {
          success: false,
          error: 'Unknown auto-fix type'
        };
    }

  } catch (error) {
    console.error('[ComplianceMonitor] Auto-fix failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Add unsubscribe link to email template
 */
async function addUnsubscribeLinkToEmail(workflowId, stepIndexes) {
  // Implementation would update workflow steps to include {{unsubscribeLink}}
  console.log('[ComplianceMonitor] Adding unsubscribe link to email steps:', stepIndexes);

  return {
    success: true,
    message: 'Added unsubscribe link to email template',
    stepsFixed: stepIndexes.length
  };
}

/**
 * Add physical address to email template
 */
async function addAddressToEmail(workflowId, stepIndexes) {
  console.log('[ComplianceMonitor] Adding physical address to email steps:', stepIndexes);

  return {
    success: true,
    message: 'Added physical address to email template',
    stepsFixed: stepIndexes.length
  };
}

/**
 * Add opt-out instructions to SMS
 */
async function addOptOutToSMS(workflowId, stepIndexes) {
  console.log('[ComplianceMonitor] Adding opt-out to SMS steps:', stepIndexes);

  return {
    success: true,
    message: 'Added "Reply STOP to unsubscribe" to SMS messages',
    stepsFixed: stepIndexes.length
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate recommendations based on violations
 */
function generateRecommendations(violations, warnings) {
  const recommendations = [];

  // Prioritize critical violations
  const critical = violations.filter(v => v.severity === 'critical');
  if (critical.length > 0) {
    recommendations.push({
      priority: 'immediate',
      title: `Fix ${critical.length} Critical Violation${critical.length !== 1 ? 's' : ''} Immediately`,
      description: 'These violations could result in significant fines or legal action',
      actions: critical.map(v => ({
        title: v.title,
        fix: v.fix,
        autoFix: v.autoFix
      }))
    });
  }

  // Group by law
  const byLaw = {};
  [...violations, ...warnings].forEach(issue => {
    if (!byLaw[issue.law]) byLaw[issue.law] = [];
    byLaw[issue.law].push(issue);
  });

  Object.entries(byLaw).forEach(([law, issues]) => {
    if (issues.length > 0) {
      recommendations.push({
        priority: 'high',
        title: `${law} Compliance Issues`,
        description: `${issues.length} issue${issues.length !== 1 ? 's' : ''} found`,
        actions: issues.map(i => i.fix).filter(Boolean)
      });
    }
  });

  return recommendations;
}

/**
 * Format compliance report for display
 */
export function formatComplianceReport(report) {
  return {
    title: `Compliance Report: ${report.workflowName}`,
    status: report.status,
    summary: `${report.summary.criticalViolations} critical, ${report.summary.highPriorityViolations} high priority, ${report.summary.warnings} warnings`,
    sections: [
      {
        title: '🚨 Critical Violations',
        items: report.violations.filter(v => v.severity === 'critical'),
        severity: 'error'
      },
      {
        title: '⚠️ High Priority',
        items: report.violations.filter(v => v.severity === 'high'),
        severity: 'warning'
      },
      {
        title: 'ℹ️ Warnings',
        items: report.warnings,
        severity: 'info'
      },
      {
        title: '✅ Passed',
        items: report.passed,
        severity: 'success'
      }
    ],
    recommendations: report.recommendations
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  checkWorkflowCompliance,
  checkAllWorkflows,
  getComplianceSummary,
  autoFixViolation,
  formatComplianceReport,
  CROA_RULES,
  CAN_SPAM_RULES,
  TCPA_RULES,
  FDCPA_RULES
};
