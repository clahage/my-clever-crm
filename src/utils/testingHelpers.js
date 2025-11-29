/**
 * Testing Helper Utilities
 *
 * Functions to support the comprehensive testing framework:
 * - Test result validation
 * - Progress tracking
 * - Result storage
 * - Report generation
 * - Memory management
 */

import { db } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';

/**
 * Generate a unique test session ID
 */
export const generateTestSessionId = () => {
  const date = new Date().toISOString().split('T')[0];
  const random = Math.random().toString(36).substring(2, 15);
  return `test-session-${date}-${random}`;
};

/**
 * Initialize a new testing session
 */
export const initializeTestSession = async (testerName, categories = []) => {
  const sessionId = generateTestSessionId();

  const session = {
    sessionId,
    tester: testerName,
    startTime: new Date().toISOString(),
    endTime: null,
    status: 'in-progress', // in-progress, paused, completed
    selectedCategories: categories,
    totalScenarios: 0,
    completedScenarios: 0,
    passedTests: 0,
    failedTests: 0,
    warningTests: 0,
    currentScenario: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    // Save to Firebase
    await setDoc(doc(db, 'testingSessions', sessionId), session);

    // Save to localStorage for quick access
    localStorage.setItem('currentTestSession', sessionId);
    localStorage.setItem(`testSession_${sessionId}`, JSON.stringify(session));

    console.log('✅ Test session initialized:', sessionId);
    return session;
  } catch (error) {
    console.error('❌ Failed to initialize test session:', error);
    throw error;
  }
};

/**
 * Load existing test session
 */
export const loadTestSession = async (sessionId) => {
  try {
    // Try localStorage first (faster)
    const localData = localStorage.getItem(`testSession_${sessionId}`);
    if (localData) {
      return JSON.parse(localData);
    }

    // Fall back to Firebase
    const sessionDoc = await getDoc(doc(db, 'testingSessions', sessionId));
    if (sessionDoc.exists()) {
      const data = sessionDoc.data();
      // Cache in localStorage
      localStorage.setItem(`testSession_${sessionId}`, JSON.stringify(data));
      return data;
    }

    return null;
  } catch (error) {
    console.error('❌ Failed to load test session:', error);
    return null;
  }
};

/**
 * Get current active test session
 */
export const getCurrentTestSession = async () => {
  const sessionId = localStorage.getItem('currentTestSession');
  if (!sessionId) return null;
  return await loadTestSession(sessionId);
};

/**
 * Update test session
 */
export const updateTestSession = async (sessionId, updates) => {
  try {
    const updatedSession = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    // Update Firebase
    await updateDoc(doc(db, 'testingSessions', sessionId), updatedSession);

    // Update localStorage
    const localData = localStorage.getItem(`testSession_${sessionId}`);
    if (localData) {
      const session = JSON.parse(localData);
      const merged = { ...session, ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(`testSession_${sessionId}`, JSON.stringify(merged));
    }

    console.log('✅ Test session updated:', sessionId);
    return updatedSession;
  } catch (error) {
    console.error('❌ Failed to update test session:', error);
    throw error;
  }
};

/**
 * Save test result
 */
export const saveTestResult = async (sessionId, result) => {
  const testResult = {
    ...result,
    sessionId,
    timestamp: result.timestamp || new Date().toISOString(),
    id: `${sessionId}_${result.scenarioId}_${result.stepId || 'scenario'}_${Date.now()}`
  };

  try {
    // Save to Firebase
    await setDoc(doc(db, 'testResults', testResult.id), {
      ...testResult,
      createdAt: serverTimestamp()
    });

    // Update localStorage cache
    const cacheKey = `testResults_${sessionId}`;
    const cachedResults = JSON.parse(localStorage.getItem(cacheKey) || '[]');
    cachedResults.push(testResult);
    localStorage.setItem(cacheKey, JSON.stringify(cachedResults));

    console.log('✅ Test result saved:', testResult.id);
    return testResult;
  } catch (error) {
    console.error('❌ Failed to save test result:', error);
    throw error;
  }
};

/**
 * Validate test result against expected outcome
 */
export const validateTestResult = (actualResult, expectedResult) => {
  if (!expectedResult) {
    return {
      status: 'warning',
      message: 'No expected result defined'
    };
  }

  // Simple string comparison for basic tests
  if (typeof expectedResult === 'string') {
    const match = actualResult.toLowerCase().includes(expectedResult.toLowerCase());
    return {
      status: match ? 'passed' : 'failed',
      message: match
        ? 'Actual result matches expected'
        : `Expected: "${expectedResult}", but got different result`,
      match
    };
  }

  // Object comparison for complex tests
  if (typeof expectedResult === 'object') {
    const mismatches = [];
    for (const [key, expectedValue] of Object.entries(expectedResult)) {
      if (actualResult[key] !== expectedValue) {
        mismatches.push({
          field: key,
          expected: expectedValue,
          actual: actualResult[key]
        });
      }
    }

    return {
      status: mismatches.length === 0 ? 'passed' : 'failed',
      message: mismatches.length === 0
        ? 'All fields match expected values'
        : `${mismatches.length} field(s) don't match`,
      mismatches
    };
  }

  return {
    status: 'warning',
    message: 'Unable to validate result type'
  };
};

/**
 * Compare expected vs actual results
 */
export const compareExpectedActual = (expected, actual) => {
  const comparison = {
    matches: [],
    mismatches: [],
    missing: [],
    extra: []
  };

  // Handle string comparison
  if (typeof expected === 'string' && typeof actual === 'string') {
    if (expected.toLowerCase() === actual.toLowerCase()) {
      comparison.matches.push({ type: 'string', expected, actual });
    } else {
      comparison.mismatches.push({ type: 'string', expected, actual });
    }
    return comparison;
  }

  // Handle array comparison
  if (Array.isArray(expected) && Array.isArray(actual)) {
    expected.forEach(item => {
      if (actual.includes(item)) {
        comparison.matches.push({ type: 'array-item', value: item });
      } else {
        comparison.missing.push({ type: 'array-item', value: item });
      }
    });
    actual.forEach(item => {
      if (!expected.includes(item)) {
        comparison.extra.push({ type: 'array-item', value: item });
      }
    });
    return comparison;
  }

  // Handle object comparison
  if (typeof expected === 'object' && typeof actual === 'object') {
    const allKeys = new Set([...Object.keys(expected), ...Object.keys(actual)]);

    allKeys.forEach(key => {
      if (!(key in expected)) {
        comparison.extra.push({ field: key, value: actual[key] });
      } else if (!(key in actual)) {
        comparison.missing.push({ field: key, expected: expected[key] });
      } else if (expected[key] === actual[key]) {
        comparison.matches.push({ field: key, value: actual[key] });
      } else {
        comparison.mismatches.push({
          field: key,
          expected: expected[key],
          actual: actual[key]
        });
      }
    });
    return comparison;
  }

  // Direct comparison fallback
  if (expected === actual) {
    comparison.matches.push({ expected, actual });
  } else {
    comparison.mismatches.push({ expected, actual });
  }

  return comparison;
};

/**
 * Log test result to activity feed
 */
export const logTestResult = async (sessionId, scenarioId, stepId, status, notes = '') => {
  const logEntry = {
    sessionId,
    scenarioId,
    stepId,
    status,
    notes,
    timestamp: new Date().toISOString(),
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };

  try {
    // Save to Firebase
    await setDoc(doc(db, 'testLogs', logEntry.id), {
      ...logEntry,
      createdAt: serverTimestamp()
    });

    // Update localStorage cache
    const cacheKey = `testLogs_${sessionId}`;
    const cachedLogs = JSON.parse(localStorage.getItem(cacheKey) || '[]');
    cachedLogs.push(logEntry);
    localStorage.setItem(cacheKey, JSON.stringify(cachedLogs));

    console.log(`✅ Test logged: ${status} - ${scenarioId}`);
    return logEntry;
  } catch (error) {
    console.error('❌ Failed to log test result:', error);
    throw error;
  }
};

/**
 * Report an issue found during testing
 */
export const reportIssue = async (sessionId, issue) => {
  const issueReport = {
    ...issue,
    sessionId,
    id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    reportedAt: issue.timestamp || new Date().toISOString(),
    status: issue.status || 'open',
    severity: issue.severity || 'medium'
  };

  try {
    // Save to Firebase
    await setDoc(doc(db, 'testIssues', issueReport.id), {
      ...issueReport,
      createdAt: serverTimestamp()
    });

    // Update localStorage cache
    const cacheKey = `testIssues_${sessionId}`;
    const cachedIssues = JSON.parse(localStorage.getItem(cacheKey) || '[]');
    cachedIssues.push(issueReport);
    localStorage.setItem(cacheKey, JSON.stringify(cachedIssues));

    console.log('✅ Issue reported:', issueReport.id);
    return issueReport;
  } catch (error) {
    console.error('❌ Failed to report issue:', error);
    throw error;
  }
};

/**
 * Generate comprehensive test report
 */
export const generateTestReport = async (sessionId) => {
  try {
    // Fetch all data for session
    const session = await loadTestSession(sessionId);

    // Fetch test results
    const resultsQuery = query(
      collection(db, 'testResults'),
      where('sessionId', '==', sessionId),
      orderBy('timestamp', 'asc')
    );
    const resultsSnapshot = await getDocs(resultsQuery);
    const results = resultsSnapshot.docs.map(doc => doc.data());

    // Fetch issues
    const issuesQuery = query(
      collection(db, 'testIssues'),
      where('sessionId', '==', sessionId),
      orderBy('reportedAt', 'asc')
    );
    const issuesSnapshot = await getDocs(issuesQuery);
    const issues = issuesSnapshot.docs.map(doc => doc.data());

    // Calculate statistics
    const stats = {
      totalTests: results.length,
      passed: results.filter(r => r.status === 'passed').length,
      failed: results.filter(r => r.status === 'failed').length,
      warnings: results.filter(r => r.status === 'warning').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      duration: session.endTime
        ? new Date(session.endTime) - new Date(session.startTime)
        : Date.now() - new Date(session.startTime),
      issuesFound: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'critical').length,
      openIssues: issues.filter(i => i.status === 'open').length
    };

    // Group results by scenario
    const resultsByScenario = results.reduce((acc, result) => {
      if (!acc[result.scenarioId]) {
        acc[result.scenarioId] = [];
      }
      acc[result.scenarioId].push(result);
      return acc;
    }, {});

    // Group issues by category
    const issuesByCategory = issues.reduce((acc, issue) => {
      const category = issue.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(issue);
      return acc;
    }, {});

    const report = {
      sessionId,
      session,
      stats,
      results,
      resultsByScenario,
      issues,
      issuesByCategory,
      generatedAt: new Date().toISOString()
    };

    // Save report to Firebase
    await setDoc(doc(db, 'testReports', sessionId), {
      ...report,
      createdAt: serverTimestamp()
    });

    console.log('✅ Test report generated:', sessionId);
    return report;
  } catch (error) {
    console.error('❌ Failed to generate test report:', error);
    throw error;
  }
};

/**
 * Export test results to CSV
 */
export const exportTestResultsCSV = (results) => {
  const headers = [
    'Scenario ID',
    'Test Name',
    'Status',
    'Expected Result',
    'Actual Result',
    'Timestamp',
    'Notes'
  ];

  const rows = results.map(result => [
    result.scenarioId || '',
    result.testName || '',
    result.status || '',
    result.expectedResult || '',
    result.actualResult || '',
    result.timestamp || '',
    result.notes || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
};

/**
 * Export test results to JSON
 */
export const exportTestResultsJSON = (results) => {
  return JSON.stringify(results, null, 2);
};

/**
 * Download test report as file
 */
export const downloadTestReport = (report, format = 'json') => {
  let content, filename, mimeType;

  if (format === 'csv') {
    content = exportTestResultsCSV(report.results);
    filename = `test-report-${report.sessionId}.csv`;
    mimeType = 'text/csv';
  } else {
    content = exportTestResultsJSON(report);
    filename = `test-report-${report.sessionId}.json`;
    mimeType = 'application/json';
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log(`✅ Test report downloaded: ${filename}`);
};

/**
 * Format test memory for Claude
 */
export const formatTestingMemory = (session, results = [], issues = []) => {
  const progress = session.totalScenarios > 0
    ? Math.round((session.completedScenarios / session.totalScenarios) * 100)
    : 0;

  const criticalIssues = issues
    .filter(i => i.severity === 'critical' && i.status === 'open')
    .map(i => `  - ${i.title}`)
    .join('\n');

  const summary = `
SpeedyCRM Testing Session: ${session.sessionId}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tester: ${session.tester}
Started: ${new Date(session.startTime).toLocaleString()}
Status: ${session.status}

PROGRESS: ${progress}%
Scenarios: ${session.completedScenarios}/${session.totalScenarios} completed

RESULTS:
✅ Passed: ${session.passedTests}
❌ Failed: ${session.failedTests}
⚠️  Warnings: ${session.warningTests}

CURRENT TEST:
${session.currentScenario ? `
Scenario: ${session.currentScenario.name}
Category: ${session.currentScenario.category}
Step: ${session.currentScenario.currentStep}/${session.currentScenario.totalSteps}
Status: ${session.currentScenario.status}
` : 'No test currently active'}

ISSUES FOUND: ${issues.length} total
Critical (Open): ${issues.filter(i => i.severity === 'critical' && i.status === 'open').length}
${criticalIssues ? `\nCritical Issues:\n${criticalIssues}` : ''}

NEXT STEPS:
${session.currentScenario && session.currentScenario.status === 'in-progress'
  ? `- Continue with: ${session.currentScenario.name}`
  : '- Start next test scenario'
}
- Review and address critical issues
- Ensure all tests documented
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();

  return summary;
};

/**
 * Save testing memory for Claude
 */
export const saveTestingMemory = async (session, results = [], issues = []) => {
  const memory = formatTestingMemory(session, results, issues);

  try {
    // Save to Firebase in a dedicated memory collection
    await setDoc(doc(db, 'claudeMemory', session.sessionId), {
      sessionId: session.sessionId,
      memory,
      updatedAt: serverTimestamp()
    });

    // Also save to localStorage
    localStorage.setItem(`claudeMemory_${session.sessionId}`, memory);

    console.log('✅ Testing memory saved for Claude');
    return memory;
  } catch (error) {
    console.error('❌ Failed to save testing memory:', error);
    throw error;
  }
};

/**
 * Calculate test progress percentage
 */
export const calculateProgress = (session) => {
  if (!session.totalScenarios || session.totalScenarios === 0) {
    return 0;
  }
  return Math.round((session.completedScenarios / session.totalScenarios) * 100);
};

/**
 * Get test statistics summary
 */
export const getTestStatistics = (results) => {
  const total = results.length;
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const skipped = results.filter(r => r.status === 'skipped').length;

  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const failRate = total > 0 ? Math.round((failed / total) * 100) : 0;

  return {
    total,
    passed,
    failed,
    warnings,
    skipped,
    passRate,
    failRate
  };
};

/**
 * Format duration in human-readable format
 */
export const formatDuration = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
};

/**
 * Pause test session
 */
export const pauseTestSession = async (sessionId) => {
  return await updateTestSession(sessionId, {
    status: 'paused',
    pausedAt: new Date().toISOString()
  });
};

/**
 * Resume test session
 */
export const resumeTestSession = async (sessionId) => {
  return await updateTestSession(sessionId, {
    status: 'in-progress',
    resumedAt: new Date().toISOString()
  });
};

/**
 * Complete test session
 */
export const completeTestSession = async (sessionId) => {
  return await updateTestSession(sessionId, {
    status: 'completed',
    endTime: new Date().toISOString()
  });
};

/**
 * Get all test sessions for a user
 */
export const getUserTestSessions = async (testerName) => {
  try {
    const sessionsQuery = query(
      collection(db, 'testingSessions'),
      where('tester', '==', testerName),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(sessionsQuery);
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('❌ Failed to fetch user test sessions:', error);
    return [];
  }
};

/**
 * Delete test session and all related data
 */
export const deleteTestSession = async (sessionId) => {
  try {
    // This would need careful implementation to delete all related documents
    // For now, just mark as deleted
    await updateTestSession(sessionId, {
      status: 'deleted',
      deletedAt: new Date().toISOString()
    });

    // Remove from localStorage
    localStorage.removeItem(`testSession_${sessionId}`);
    localStorage.removeItem(`testResults_${sessionId}`);
    localStorage.removeItem(`testIssues_${sessionId}`);
    localStorage.removeItem(`testLogs_${sessionId}`);
    localStorage.removeItem(`claudeMemory_${sessionId}`);

    console.log('✅ Test session deleted:', sessionId);
  } catch (error) {
    console.error('❌ Failed to delete test session:', error);
    throw error;
  }
};

export default {
  generateTestSessionId,
  initializeTestSession,
  loadTestSession,
  getCurrentTestSession,
  updateTestSession,
  saveTestResult,
  validateTestResult,
  compareExpectedActual,
  logTestResult,
  reportIssue,
  generateTestReport,
  exportTestResultsCSV,
  exportTestResultsJSON,
  downloadTestReport,
  formatTestingMemory,
  saveTestingMemory,
  calculateProgress,
  getTestStatistics,
  formatDuration,
  pauseTestSession,
  resumeTestSession,
  completeTestSession,
  getUserTestSessions,
  deleteTestSession
};
