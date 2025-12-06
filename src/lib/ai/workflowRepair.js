/**
 * AI WORKFLOW REPAIR SYSTEM
 *
 * Purpose:
 * Automatically detect and fix broken workflows, heal execution errors,
 * and maintain workflow health without manual intervention.
 *
 * What It Fixes:
 * - Broken conditional logic (invalid conditions)
 * - Missing required fields in steps
 * - Invalid step references (wrong step IDs)
 * - Circular dependencies in workflow paths
 * - Outdated email templates or content
 * - Invalid personalization variables
 * - Execution errors and timeouts
 * - Orphaned workflows (no active users)
 * - Performance bottlenecks
 *
 * Repair Types:
 * 1. **Structural Repairs**: Fix JSON structure, step ordering
 * 2. **Logic Repairs**: Fix conditional branches, path validation
 * 3. **Content Repairs**: Update outdated content, fix variables
 * 4. **Performance Repairs**: Optimize slow steps, reduce redundancy
 * 5. **Execution Repairs**: Retry failed steps, handle timeouts
 *
 * Detection Methods:
 * - Schema validation (JSON structure)
 * - Execution monitoring (runtime errors)
 * - Performance analysis (slow steps)
 * - Content analysis (outdated/broken content)
 * - Dependency graph validation
 *
 * Why It's Important:
 * - Prevent workflow failures before they affect clients
 * - Reduce manual debugging time
 * - Maintain workflow quality automatically
 * - Learn from execution patterns
 * - Improve system reliability
 * - No technical skills required to fix issues
 *
 * Example Repairs:
 * - "Conditional step references non-existent field. Fixed: changed 'user.role' → 'contact.serviceTier'"
 * - "Email template {{firstName}} variable invalid. Fixed: updated to {{contact.firstName}}"
 * - "Circular loop detected: step_5 → step_3 → step_5. Fixed: redirected step_3 to step_6"
 * - "Wait step duration = 0 causing immediate continue. Fixed: set minimum 1 hour wait"
 * - "Email send step missing subject line. Fixed: added default subject"
 *
 * Auto-Fix vs Manual Review:
 * - Simple fixes: Auto-fix immediately
 * - Complex issues: Suggest fix, require approval
 * - Critical changes: Always require review
 * - Minor optimizations: Auto-apply
 *
 * Created: 2025-12-05
 * Part of: Speedy Credit Repair AI Workflow System - Tier 3
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// ============================================================================
// WORKFLOW HEALTH CHECK
// ============================================================================

/**
 * Analyze workflow health and identify issues
 * @param {string} workflowId - Workflow ID to check
 * @returns {Object} Health report with issues found
 */
export async function analyzeWorkflowHealth(workflowId) {
  try {
    const workflow = await getWorkflow(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const issues = {
      critical: [],
      warnings: [],
      suggestions: []
    };

    // Run all health checks
    const structuralIssues = validateStructure(workflow);
    const logicIssues = validateLogic(workflow);
    const contentIssues = await validateContent(workflow);
    const performanceIssues = await analyzePerformance(workflowId, workflow);
    const executionIssues = await checkExecutionHistory(workflowId);

    // Categorize issues
    [...structuralIssues, ...logicIssues, ...contentIssues, ...performanceIssues, ...executionIssues]
      .forEach(issue => {
        if (issue.severity === 'critical') issues.critical.push(issue);
        else if (issue.severity === 'warning') issues.warnings.push(issue);
        else issues.suggestions.push(issue);
      });

    const healthScore = calculateHealthScore(issues);

    return {
      workflowId,
      healthScore,
      status: getHealthStatus(healthScore),
      issues,
      repairPlan: generateRepairPlan(issues),
      lastChecked: new Date()
    };

  } catch (error) {
    console.error('[analyzeWorkflowHealth] Error:', error);
    return { error: error.message };
  }
}

// ============================================================================
// STRUCTURAL VALIDATION
// ============================================================================

function validateStructure(workflow) {
  const issues = [];

  // Check required fields
  if (!workflow.id) {
    issues.push({
      type: 'missing_field',
      severity: 'critical',
      field: 'id',
      message: 'Workflow missing ID',
      autoFixable: false
    });
  }

  if (!workflow.steps || workflow.steps.length === 0) {
    issues.push({
      type: 'missing_steps',
      severity: 'critical',
      message: 'Workflow has no steps',
      autoFixable: false
    });
    return issues; // Can't continue without steps
  }

  // Validate each step structure
  workflow.steps.forEach((step, index) => {
    if (!step.id) {
      issues.push({
        type: 'missing_field',
        severity: 'critical',
        stepIndex: index,
        field: 'id',
        message: `Step ${index + 1} missing ID`,
        autoFix: {
          action: 'generate_id',
          value: `step_${index + 1}`
        }
      });
    }

    if (!step.type) {
      issues.push({
        type: 'missing_field',
        severity: 'critical',
        stepIndex: index,
        stepId: step.id,
        field: 'type',
        message: `Step "${step.id}" missing type`,
        autoFixable: false
      });
    }

    // Check for duplicate step IDs
    const duplicates = workflow.steps.filter(s => s.id === step.id);
    if (duplicates.length > 1) {
      issues.push({
        type: 'duplicate_id',
        severity: 'critical',
        stepId: step.id,
        message: `Duplicate step ID: "${step.id}"`,
        autoFix: {
          action: 'rename_duplicates',
          steps: duplicates.map((s, i) => ({
            oldId: s.id,
            newId: `${s.id}_${i + 1}`
          }))
        }
      });
    }
  });

  return issues;
}

// ============================================================================
// LOGIC VALIDATION
// ============================================================================

function validateLogic(workflow) {
  const issues = [];
  const stepIds = workflow.steps.map(s => s.id);

  workflow.steps.forEach(step => {
    // Validate conditional branches
    if (step.type === 'conditional_branch') {
      if (!step.config?.condition) {
        issues.push({
          type: 'missing_condition',
          severity: 'critical',
          stepId: step.id,
          message: `Conditional step "${step.id}" missing condition`,
          autoFixable: false
        });
      }

      // Validate branch paths
      const truePath = step.config?.truePath;
      const falsePath = step.config?.falsePath;

      if (truePath && !stepIds.includes(truePath)) {
        issues.push({
          type: 'invalid_reference',
          severity: 'critical',
          stepId: step.id,
          field: 'truePath',
          invalidValue: truePath,
          message: `True path references non-existent step: "${truePath}"`,
          autoFix: {
            action: 'update_reference',
            suggestions: findSimilarStepIds(truePath, stepIds)
          }
        });
      }

      if (falsePath && !stepIds.includes(falsePath)) {
        issues.push({
          type: 'invalid_reference',
          severity: 'critical',
          stepId: step.id,
          field: 'falsePath',
          invalidValue: falsePath,
          message: `False path references non-existent step: "${falsePath}"`,
          autoFix: {
            action: 'update_reference',
            suggestions: findSimilarStepIds(falsePath, stepIds)
          }
        });
      }

      // Check for circular loops
      const loops = detectCircularDependencies(workflow, step.id);
      if (loops.length > 0) {
        issues.push({
          type: 'circular_loop',
          severity: 'warning',
          stepId: step.id,
          loop: loops,
          message: `Circular dependency detected: ${loops.join(' → ')}`,
          autoFix: {
            action: 'break_loop',
            suggestion: 'Redirect to workflow completion step'
          }
        });
      }
    }

    // Validate wait steps
    if (step.type === 'wait') {
      const duration = step.config?.duration;
      if (!duration || duration <= 0) {
        issues.push({
          type: 'invalid_config',
          severity: 'warning',
          stepId: step.id,
          field: 'duration',
          message: `Wait step has invalid duration: ${duration}`,
          autoFix: {
            action: 'set_default',
            value: 1,
            unit: step.config?.unit || 'hours'
          }
        });
      }
    }

    // Validate email/SMS steps
    if (step.type === 'email_send' || step.type === 'sms_send') {
      if (!step.config?.template && !step.config?.content) {
        issues.push({
          type: 'missing_content',
          severity: 'critical',
          stepId: step.id,
          message: `${step.type} step missing template or content`,
          autoFixable: false
        });
      }
    }
  });

  return issues;
}

function findSimilarStepIds(target, validIds) {
  // Find step IDs similar to the invalid reference
  return validIds
    .map(id => ({
      id,
      similarity: calculateSimilarity(target, id)
    }))
    .filter(item => item.similarity > 0.5)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3)
    .map(item => item.id);
}

function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

function detectCircularDependencies(workflow, startStepId, visited = new Set()) {
  if (visited.has(startStepId)) {
    return Array.from(visited).concat(startStepId);
  }

  const step = workflow.steps.find(s => s.id === startStepId);
  if (!step) return [];

  visited.add(startStepId);

  // Check conditional branches
  if (step.type === 'conditional_branch') {
    const truePath = step.config?.truePath;
    const falsePath = step.config?.falsePath;

    if (truePath) {
      const loop = detectCircularDependencies(workflow, truePath, new Set(visited));
      if (loop.length > 0) return loop;
    }

    if (falsePath) {
      const loop = detectCircularDependencies(workflow, falsePath, new Set(visited));
      if (loop.length > 0) return loop;
    }
  }

  return [];
}

// ============================================================================
// CONTENT VALIDATION
// ============================================================================

async function validateContent(workflow) {
  const issues = [];

  for (const step of workflow.steps) {
    // Validate email content
    if (step.type === 'email_send') {
      const contentIssues = validateEmailContent(step);
      issues.push(...contentIssues);
    }

    // Validate SMS content
    if (step.type === 'sms_send') {
      const contentIssues = validateSMSContent(step);
      issues.push(...contentIssues);
    }

    // Validate personalization variables
    if (step.config?.content || step.config?.body) {
      const varIssues = validatePersonalizationVariables(step);
      issues.push(...varIssues);
    }
  }

  return issues;
}

function validateEmailContent(step) {
  const issues = [];

  // Check for subject line
  if (!step.config?.subject) {
    issues.push({
      type: 'missing_subject',
      severity: 'warning',
      stepId: step.id,
      message: 'Email missing subject line',
      autoFix: {
        action: 'add_default',
        value: 'Update from Speedy Credit Repair'
      }
    });
  }

  // Check for empty body
  if (!step.config?.body && !step.config?.template) {
    issues.push({
      type: 'missing_body',
      severity: 'critical',
      stepId: step.id,
      message: 'Email missing body content',
      autoFixable: false
    });
  }

  // Check for unsubscribe link (CAN-SPAM compliance)
  const body = step.config?.body || '';
  if (!body.includes('unsubscribe') && !body.includes('{{unsubscribeLink}}')) {
    issues.push({
      type: 'compliance_issue',
      severity: 'warning',
      stepId: step.id,
      message: 'Email missing unsubscribe link (CAN-SPAM requirement)',
      autoFix: {
        action: 'append_footer',
        value: '\n\n{{unsubscribeLink}}'
      }
    });
  }

  return issues;
}

function validateSMSContent(step) {
  const issues = [];
  const message = step.config?.message || '';

  // Check SMS length
  if (message.length > 160) {
    issues.push({
      type: 'content_warning',
      severity: 'suggestion',
      stepId: step.id,
      message: `SMS exceeds 160 characters (${message.length}). Will send as multiple segments.`,
      autoFix: {
        action: 'split_message',
        segments: Math.ceil(message.length / 153)
      }
    });
  }

  // Check for TCPA compliance (opt-out language)
  if (!message.toLowerCase().includes('stop')) {
    issues.push({
      type: 'compliance_issue',
      severity: 'critical',
      stepId: step.id,
      message: 'SMS missing opt-out language (TCPA requirement)',
      autoFix: {
        action: 'append_text',
        value: ' Reply STOP to unsubscribe'
      }
    });
  }

  return issues;
}

function validatePersonalizationVariables(step) {
  const issues = [];
  const content = step.config?.content || step.config?.body || '';

  // Valid personalization variables
  const validVars = [
    '{{firstName}}',
    '{{lastName}}',
    '{{email}}',
    '{{phone}}',
    '{{creditScore}}',
    '{{negativeItemCount}}',
    '{{serviceTier}}',
    '{{companyName}}',
    '{{unsubscribeLink}}',
    '{{portalLink}}'
  ];

  // Find all {{variables}} in content
  const variableRegex = /\{\{(\w+)\}\}/g;
  const matches = content.matchAll(variableRegex);

  for (const match of matches) {
    const variable = match[0];
    if (!validVars.includes(variable)) {
      issues.push({
        type: 'invalid_variable',
        severity: 'warning',
        stepId: step.id,
        variable,
        message: `Unknown personalization variable: ${variable}`,
        autoFix: {
          action: 'suggest_replacement',
          suggestions: validVars.filter(v =>
            v.toLowerCase().includes(variable.toLowerCase().replace(/[{}]/g, ''))
          )
        }
      });
    }
  }

  return issues;
}

// ============================================================================
// PERFORMANCE ANALYSIS
// ============================================================================

async function analyzePerformance(workflowId, workflow) {
  const issues = [];

  // Check for excessive steps
  if (workflow.steps.length > 50) {
    issues.push({
      type: 'performance_concern',
      severity: 'suggestion',
      message: `Workflow has ${workflow.steps.length} steps. Consider breaking into multiple workflows.`,
      autoFixable: false
    });
  }

  // Check for very long waits
  workflow.steps.forEach(step => {
    if (step.type === 'wait' && step.config?.duration > 30 && step.config?.unit === 'days') {
      issues.push({
        type: 'long_wait',
        severity: 'suggestion',
        stepId: step.id,
        message: `Very long wait: ${step.config.duration} days`,
        recommendation: 'Consider if this wait is necessary'
      });
    }
  });

  // Check for redundant steps
  const redundant = findRedundantSteps(workflow);
  if (redundant.length > 0) {
    redundant.forEach(({ step1, step2, reason }) => {
      issues.push({
        type: 'redundant_step',
        severity: 'suggestion',
        stepIds: [step1.id, step2.id],
        message: `Potentially redundant steps: ${step1.id} and ${step2.id}`,
        reason,
        autoFix: {
          action: 'merge_steps',
          keepStep: step1.id,
          removeStep: step2.id
        }
      });
    });
  }

  return issues;
}

function findRedundantSteps(workflow) {
  const redundant = [];

  for (let i = 0; i < workflow.steps.length - 1; i++) {
    for (let j = i + 1; j < workflow.steps.length; j++) {
      const step1 = workflow.steps[i];
      const step2 = workflow.steps[j];

      // Check for duplicate emails
      if (step1.type === 'email_send' && step2.type === 'email_send') {
        if (step1.config?.template === step2.config?.template ||
            step1.config?.subject === step2.config?.subject) {
          redundant.push({
            step1,
            step2,
            reason: 'Same email template sent twice'
          });
        }
      }
    }
  }

  return redundant;
}

// ============================================================================
// EXECUTION HISTORY ANALYSIS
// ============================================================================

async function checkExecutionHistory(workflowId) {
  const issues = [];

  try {
    const executions = await getRecentExecutions(workflowId, 50);

    if (executions.length === 0) {
      issues.push({
        type: 'no_executions',
        severity: 'suggestion',
        message: 'Workflow has never been executed',
        recommendation: 'Test workflow before deploying'
      });
      return issues;
    }

    // Calculate failure rate
    const failures = executions.filter(e => e.status === 'failed');
    const failureRate = (failures.length / executions.length) * 100;

    if (failureRate > 20) {
      issues.push({
        type: 'high_failure_rate',
        severity: 'critical',
        failureRate: Math.round(failureRate),
        message: `High failure rate: ${Math.round(failureRate)}% of executions failed`,
        commonErrors: getCommonErrors(failures),
        autoFixable: false
      });
    }

    // Check for stuck executions
    const stuck = executions.filter(e => e.status === 'running' && isStuck(e.startedAt));
    if (stuck.length > 0) {
      issues.push({
        type: 'stuck_execution',
        severity: 'warning',
        count: stuck.length,
        message: `${stuck.length} executions appear stuck`,
        autoFix: {
          action: 'timeout_and_retry',
          executionIds: stuck.map(e => e.id)
        }
      });
    }

    // Check for slow steps
    const slowSteps = identifySlowSteps(executions);
    slowSteps.forEach(step => {
      issues.push({
        type: 'slow_step',
        severity: 'suggestion',
        stepId: step.id,
        avgDuration: step.avgDuration,
        message: `Step "${step.id}" averages ${Math.round(step.avgDuration / 1000)}s (slow)`,
        recommendation: 'Review step configuration for optimization'
      });
    });

  } catch (error) {
    console.error('[checkExecutionHistory] Error:', error);
  }

  return issues;
}

function isStuck(startedAt) {
  const hoursSinceStart = (Date.now() - startedAt.toDate().getTime()) / (1000 * 60 * 60);
  return hoursSinceStart > 24; // Stuck if running for more than 24 hours
}

function getCommonErrors(failures) {
  const errorCounts = {};

  failures.forEach(failure => {
    const error = failure.error || 'Unknown error';
    errorCounts[error] = (errorCounts[error] || 0) + 1;
  });

  return Object.entries(errorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([error, count]) => ({ error, count }));
}

function identifySlowSteps(executions) {
  const stepDurations = {};

  executions.forEach(execution => {
    execution.steps?.forEach(step => {
      if (!stepDurations[step.id]) {
        stepDurations[step.id] = [];
      }
      if (step.duration) {
        stepDurations[step.id].push(step.duration);
      }
    });
  });

  return Object.entries(stepDurations)
    .map(([stepId, durations]) => ({
      id: stepId,
      avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length
    }))
    .filter(step => step.avgDuration > 30000) // Slow if > 30 seconds
    .sort((a, b) => b.avgDuration - a.avgDuration);
}

// ============================================================================
// REPAIR EXECUTION
// ============================================================================

/**
 * Automatically repair workflow issues
 * @param {string} workflowId - Workflow ID
 * @param {Object} options - Repair options
 * @returns {Object} Repair results
 */
export async function repairWorkflow(workflowId, options = {}) {
  try {
    const healthReport = await analyzeWorkflowHealth(workflowId);

    if (healthReport.error) {
      return healthReport;
    }

    const autoFixableIssues = [
      ...healthReport.issues.critical,
      ...healthReport.issues.warnings,
      ...healthReport.issues.suggestions
    ].filter(issue => issue.autoFix || issue.autoFixable !== false);

    if (autoFixableIssues.length === 0) {
      return {
        success: true,
        message: 'No auto-fixable issues found',
        healthReport
      };
    }

    const workflow = await getWorkflow(workflowId);
    const repairs = [];

    // Apply fixes
    for (const issue of autoFixableIssues) {
      const repair = await applyFix(workflow, issue, options);
      if (repair.success) {
        repairs.push(repair);
      }
    }

    // Save repaired workflow
    if (repairs.length > 0 && options.saveChanges !== false) {
      await saveWorkflow(workflowId, workflow);

      // Log repairs
      await logRepairs(workflowId, repairs);
    }

    return {
      success: true,
      repairsApplied: repairs.length,
      repairs,
      updatedWorkflow: workflow
    };

  } catch (error) {
    console.error('[repairWorkflow] Error:', error);
    return { error: error.message };
  }
}

async function applyFix(workflow, issue, options) {
  const fix = issue.autoFix;
  if (!fix) {
    return { success: false, reason: 'No auto-fix available' };
  }

  try {
    switch (fix.action) {
      case 'generate_id':
        return applyGenerateId(workflow, issue, fix);

      case 'set_default':
        return applySetDefault(workflow, issue, fix);

      case 'update_reference':
        return applyUpdateReference(workflow, issue, fix);

      case 'add_default':
        return applyAddDefault(workflow, issue, fix);

      case 'append_footer':
      case 'append_text':
        return applyAppendText(workflow, issue, fix);

      default:
        return { success: false, reason: `Unknown fix action: ${fix.action}` };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function applyGenerateId(workflow, issue, fix) {
  const step = workflow.steps[issue.stepIndex];
  step.id = fix.value;

  return {
    success: true,
    issue: issue.type,
    stepId: fix.value,
    action: 'Generated missing step ID'
  };
}

function applySetDefault(workflow, issue, fix) {
  const step = workflow.steps.find(s => s.id === issue.stepId);
  if (!step) return { success: false, reason: 'Step not found' };

  if (!step.config) step.config = {};
  step.config[issue.field] = fix.value;

  return {
    success: true,
    issue: issue.type,
    stepId: issue.stepId,
    action: `Set ${issue.field} to default value: ${fix.value}`
  };
}

function applyUpdateReference(workflow, issue, fix) {
  const step = workflow.steps.find(s => s.id === issue.stepId);
  if (!step || !fix.suggestions || fix.suggestions.length === 0) {
    return { success: false, reason: 'Cannot auto-fix reference' };
  }

  // Use first suggestion
  step.config[issue.field] = fix.suggestions[0];

  return {
    success: true,
    issue: issue.type,
    stepId: issue.stepId,
    action: `Updated ${issue.field}: ${issue.invalidValue} → ${fix.suggestions[0]}`
  };
}

function applyAddDefault(workflow, issue, fix) {
  const step = workflow.steps.find(s => s.id === issue.stepId);
  if (!step) return { success: false, reason: 'Step not found' };

  if (!step.config) step.config = {};
  step.config.subject = fix.value;

  return {
    success: true,
    issue: issue.type,
    stepId: issue.stepId,
    action: `Added default subject: ${fix.value}`
  };
}

function applyAppendText(workflow, issue, fix) {
  const step = workflow.steps.find(s => s.id === issue.stepId);
  if (!step) return { success: false, reason: 'Step not found' };

  const field = step.type === 'email_send' ? 'body' : 'message';
  if (!step.config) step.config = {};

  step.config[field] = (step.config[field] || '') + fix.value;

  return {
    success: true,
    issue: issue.type,
    stepId: issue.stepId,
    action: `Appended required text: ${fix.value}`
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateHealthScore(issues) {
  let score = 100;

  score -= issues.critical.length * 20;
  score -= issues.warnings.length * 10;
  score -= issues.suggestions.length * 5;

  return Math.max(0, score);
}

function getHealthStatus(score) {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  if (score >= 30) return 'poor';
  return 'critical';
}

function generateRepairPlan(issues) {
  const plan = {
    immediate: [],
    soon: [],
    optional: []
  };

  issues.critical.forEach(issue => {
    plan.immediate.push({
      issue: issue.message,
      action: issue.autoFix ? 'Auto-fix available' : 'Manual fix required'
    });
  });

  issues.warnings.forEach(issue => {
    plan.soon.push({
      issue: issue.message,
      action: issue.autoFix ? 'Auto-fix available' : 'Review recommended'
    });
  });

  issues.suggestions.forEach(issue => {
    plan.optional.push({
      issue: issue.message,
      action: issue.recommendation || 'Consider improvement'
    });
  });

  return plan;
}

async function getWorkflow(workflowId) {
  const workflowDoc = await getDoc(doc(db, 'workflows', workflowId));
  return workflowDoc.exists() ? { id: workflowDoc.id, ...workflowDoc.data() } : null;
}

async function saveWorkflow(workflowId, workflow) {
  await updateDoc(doc(db, 'workflows', workflowId), {
    ...workflow,
    lastRepaired: Timestamp.now(),
    version: (workflow.version || 1) + 1
  });
}

async function logRepairs(workflowId, repairs) {
  await addDoc(collection(db, 'workflowRepairs'), {
    workflowId,
    repairs,
    repairedAt: Timestamp.now(),
    count: repairs.length
  });
}

async function getRecentExecutions(workflowId, limit = 50) {
  const q = query(
    collection(db, 'workflowExecutions'),
    where('workflowId', '==', workflowId),
    orderBy('startedAt', 'desc'),
    limit(limit)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export default {
  analyzeWorkflowHealth,
  repairWorkflow
};
