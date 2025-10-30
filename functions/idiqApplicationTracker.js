/**
 * IDIQ Application Tracker for SpeedyCRM
 * 
 * Tracks credit report application status using:
 * 1. Primary: IDIQ API checks via existing functions
 * 2. Backup: Puppeteer dashboard scraping
 * 
 * Integrates with workflow engine to advance contacts based on application status.
 * 
 * @author SpeedyCRM Team
 * @date October 2025
 */

const { db, admin } = require('./firebaseAdmin');
const puppeteer = require('puppeteer');

/**
 * Check application status for a contact
 * 
 * @param {string} contactId - Firestore contact document ID
 * @returns {Promise<Object>} Status result
 */
async function checkApplicationStatus(contactId) {
  try {
    console.log(`Checking IDIQ application status for contact ${contactId}`);

    // Get contact data
    const contactRef = db.collection('contacts').doc(contactId);
    const contactSnap = await contactRef.get();
    
    if (!contactSnap.exists) {
      throw new Error(`Contact ${contactId} not found`);
    }

    const contactData = contactSnap.data();
    const idiqData = contactData.idiqApplication || {};

    // Check if we have an enrollment ID
    if (!idiqData.enrollmentId && !idiqData.applicationId) {
      console.log(`No IDIQ enrollment ID found for contact ${contactId}`);
      return {
        status: 'not_started',
        message: 'No IDIQ application found',
        details: {}
      };
    }

    // Try API method first (faster, more reliable)
    try {
      const apiStatus = await checkViaAPI(contactData, idiqData);
      if (apiStatus) {
        return apiStatus;
      }
    } catch (apiError) {
      console.error('API check failed, trying dashboard scraping:', apiError);
    }

    // Fallback to dashboard scraping
    try {
      const dashboardStatus = await checkViaDashboard(contactData, idiqData);
      return dashboardStatus;
    } catch (dashboardError) {
      console.error('Dashboard check failed:', dashboardError);
      throw new Error('Both API and dashboard checks failed');
    }

  } catch (error) {
    console.error('Error checking IDIQ status:', error);
    return {
      status: 'error',
      message: error.message,
      details: {}
    };
  }
}

/**
 * Check status via IDIQ API
 * Uses Chris's existing IDIQ API functions
 * 
 * @param {Object} contactData - Contact data
 * @param {Object} idiqData - IDIQ application data
 * @returns {Promise<Object|null>} Status or null if unavailable
 */
async function checkViaAPI(contactData, idiqData) {
  try {
    // Import existing IDIQ functions
    const { getIDIQPartnerToken, checkEnrollmentStatus } = require('./index');

    // Get partner token
    const token = await getIDIQPartnerToken();
    
    if (!token) {
      console.log('Could not get IDIQ partner token');
      return null;
    }

    // Check enrollment status
    const enrollmentId = idiqData.enrollmentId || idiqData.applicationId;
    const statusResponse = await checkEnrollmentStatus(enrollmentId, token);

    if (!statusResponse) {
      return null;
    }

    // Parse status
    const status = parseAPIStatus(statusResponse);
    
    return {
      status: status.status,
      message: status.message,
      details: {
        checkedAt: new Date().toISOString(),
        method: 'api',
        enrollmentId,
        rawResponse: statusResponse
      }
    };

  } catch (error) {
    console.error('API check error:', error);
    return null;
  }
}

/**
 * Parse IDIQ API status response
 * 
 * @param {Object} response - API response
 * @returns {Object} Parsed status
 */
function parseAPIStatus(response) {
  // IDIQ API status codes (adjust based on actual API)
  const statusMap = {
    'pending': 'pending',
    'incomplete': 'incomplete',
    'in_progress': 'in_progress',
    'completed': 'completed',
    'verified': 'completed',
    'failed': 'failed',
    'expired': 'expired'
  };

  const rawStatus = response.status || response.enrollmentStatus || 'unknown';
  const normalizedStatus = rawStatus.toLowerCase();
  
  return {
    status: statusMap[normalizedStatus] || 'unknown',
    message: response.message || `Application status: ${normalizedStatus}`,
    rawStatus
  };
}

/**
 * Check status via IDIQ partner dashboard scraping
 * Backup method when API is unavailable
 * 
 * @param {Object} contactData - Contact data
 * @param {Object} idiqData - IDIQ application data
 * @returns {Promise<Object>} Status result
 */
async function checkViaDashboard(contactData, idiqData) {
  let browser = null;

  try {
    console.log('Checking IDIQ status via dashboard scraping...');

    // Get dashboard credentials from environment
    const dashboardEmail = process.env.IDIQ_DASHBOARD_EMAIL;
    const dashboardPassword = process.env.IDIQ_DASHBOARD_PASSWORD;

    if (!dashboardEmail || !dashboardPassword) {
      throw new Error('IDIQ dashboard credentials not configured');
    }

    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });

    // Navigate to IDIQ partner dashboard
    await page.goto('https://partner.identityiq.com/login', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Login
    console.log('Logging into IDIQ partner dashboard...');
    
    await page.type('#email', dashboardEmail);
    await page.type('#password', dashboardPassword);
    
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
    ]);

    // Navigate to enrollments page
    await page.goto('https://partner.identityiq.com/enrollments', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Search for contact by email or name
    const searchQuery = contactData.email || contactData.name;
    
    await page.type('#search-input', searchQuery);
    await page.keyboard.press('Enter');
    
    // Wait for results
    await page.waitForSelector('.enrollment-row', { timeout: 10000 });

    // Extract enrollment data
    const enrollmentData = await page.evaluate(() => {
      const rows = document.querySelectorAll('.enrollment-row');
      
      if (rows.length === 0) {
        return null;
      }

      // Get first matching enrollment
      const row = rows[0];
      
      return {
        status: row.querySelector('.status-badge')?.textContent?.trim() || 'unknown',
        enrollmentId: row.querySelector('.enrollment-id')?.textContent?.trim(),
        date: row.querySelector('.enrollment-date')?.textContent?.trim(),
        name: row.querySelector('.enrollment-name')?.textContent?.trim(),
        reportUrl: row.querySelector('.report-link')?.href || null
      };
    });

    if (!enrollmentData) {
      throw new Error('No enrollment found in dashboard');
    }

    // Normalize status
    const normalizedStatus = normalizeStatus(enrollmentData.status);

    await browser.close();

    return {
      status: normalizedStatus,
      message: `Dashboard status: ${enrollmentData.status}`,
      details: {
        checkedAt: new Date().toISOString(),
        method: 'dashboard',
        enrollmentId: enrollmentData.enrollmentId,
        reportUrl: enrollmentData.reportUrl,
        dashboardData: enrollmentData
      }
    };

  } catch (error) {
    console.error('Dashboard scraping error:', error);
    
    if (browser) {
      await browser.close();
    }

    throw error;
  }
}

/**
 * Normalize status from various sources
 * 
 * @param {string} rawStatus - Raw status string
 * @returns {string} Normalized status
 */
function normalizeStatus(rawStatus) {
  const status = rawStatus.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Map various status strings to standard statuses
  if (status.includes('complet') || status.includes('verif') || status.includes('active')) {
    return 'completed';
  }
  
  if (status.includes('pend') || status.includes('process')) {
    return 'pending';
  }
  
  if (status.includes('incomp') || status.includes('partial')) {
    return 'incomplete';
  }
  
  if (status.includes('fail') || status.includes('error') || status.includes('reject')) {
    return 'failed';
  }
  
  if (status.includes('expir') || status.includes('abandon')) {
    return 'expired';
  }
  
  return 'unknown';
}

/**
 * Batch check application status for multiple contacts
 * Used by daily cron job
 * 
 * @param {number} limit - Max contacts to check (default 50)
 * @returns {Promise<Object>} Batch results
 */
async function batchCheckApplications(limit = 50) {
  try {
    console.log(`Starting batch IDIQ application check (limit: ${limit})`);

    const results = {
      checked: 0,
      completed: 0,
      pending: 0,
      incomplete: 0,
      failed: 0,
      errors: []
    };

    // Query contacts with active workflows and IDIQ applications
    const contactsSnap = await db.collection('contacts')
      .where('workflowState.status', '==', 'active')
      .where('idiqApplication.status', 'in', ['pending', 'incomplete', 'in_progress'])
      .limit(limit)
      .get();

    console.log(`Found ${contactsSnap.size} contacts to check`);

    for (const doc of contactsSnap.docs) {
      results.checked++;
      
      try {
        const contactId = doc.id;
        const status = await checkApplicationStatus(contactId);
        
        // Update contact with latest status
        await db.collection('contacts').doc(contactId).update({
          'idiqApplication.status': status.status,
          'idiqApplication.lastChecked': admin.firestore.FieldValue.serverTimestamp(),
          'idiqApplication.lastCheckDetails': status.details
        });

        // Count by status
        if (status.status === 'completed') {
          results.completed++;
        } else if (status.status === 'pending') {
          results.pending++;
        } else if (status.status === 'incomplete') {
          results.incomplete++;
        } else if (status.status === 'failed' || status.status === 'error') {
          results.failed++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error checking contact ${doc.id}:`, error);
        results.errors.push({
          contactId: doc.id,
          error: error.message
        });
      }
    }

    console.log('Batch check complete:', results);
    return results;

  } catch (error) {
    console.error('Batch check error:', error);
    throw error;
  }
}

/**
 * Check if application is stalled (incomplete for too long)
 * 
 * @param {Object} contactData - Contact data
 * @returns {boolean} True if stalled
 */
function isApplicationStalled(contactData) {
  const idiqData = contactData.idiqApplication || {};
  
  if (!idiqData.status || idiqData.status !== 'incomplete') {
    return false;
  }

  const startedAt = idiqData.startedAt?.toMillis() || idiqData.createdAt?.toMillis();
  
  if (!startedAt) {
    return false;
  }

  // Consider stalled if incomplete for more than 24 hours
  const hoursSinceStart = (Date.now() - startedAt) / (1000 * 60 * 60);
  
  return hoursSinceStart > 24;
}

/**
 * Get application report URL if completed
 * 
 * @param {string} contactId - Contact ID
 * @returns {Promise<string|null>} Report URL or null
 */
async function getReportUrl(contactId) {
  try {
    const contactSnap = await db.collection('contacts').doc(contactId).get();
    
    if (!contactSnap.exists) {
      return null;
    }

    const idiqData = contactSnap.data().idiqApplication || {};
    
    // Return URL from details if available
    if (idiqData.lastCheckDetails?.reportUrl) {
      return idiqData.lastCheckDetails.reportUrl;
    }

    // Check if completed and fetch URL
    if (idiqData.status === 'completed' && idiqData.enrollmentId) {
      // Use API to get report URL
      const { getIDIQPartnerToken, getReportUrl: getApiReportUrl } = require('./index');
      
      const token = await getIDIQPartnerToken();
      if (token) {
        const reportUrl = await getApiReportUrl(idiqData.enrollmentId, token);
        
        // Save URL to contact
        if (reportUrl) {
          await db.collection('contacts').doc(contactId).update({
            'idiqApplication.reportUrl': reportUrl
          });
        }
        
        return reportUrl;
      }
    }

    return null;

  } catch (error) {
    console.error('Error getting report URL:', error);
    return null;
  }
}

/**
 * Send notification when application status changes
 * 
 * @param {string} contactId - Contact ID
 * @param {string} oldStatus - Previous status
 * @param {string} newStatus - New status
 * @returns {Promise<void>}
 */
async function notifyStatusChange(contactId, oldStatus, newStatus) {
  try {
    // Only notify on significant changes
    const significantChanges = [
      ['pending', 'completed'],
      ['incomplete', 'completed'],
      ['pending', 'failed'],
      ['incomplete', 'failed']
    ];

    const isSignificant = significantChanges.some(
      ([old, new_]) => old === oldStatus && new_ === newStatus
    );

    if (!isSignificant) {
      return;
    }

    // Log status change
    await db.collection('statusChangeLogs').add({
      contactId,
      oldStatus,
      newStatus,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      notified: true
    });

    // Trigger workflow progression
    const { workflowEngine } = require('./emailWorkflowEngine');
    
    await workflowEngine.handleEmailEvent(contactId, 'idiq_status_change', {
      oldStatus,
      newStatus
    });

    console.log(`Status change notification sent for contact ${contactId}: ${oldStatus} → ${newStatus}`);

  } catch (error) {
    console.error('Error sending status change notification:', error);
  }
}

/**
 * Get application statistics for admin dashboard
 * 
 * @param {number} days - Days to look back (default 30)
 * @returns {Promise<Object>} Statistics
 */
async function getApplicationStats(days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const contactsSnap = await db.collection('contacts')
      .where('idiqApplication.createdAt', '>=', admin.firestore.Timestamp.fromDate(startDate))
      .get();

    const stats = {
      total: contactsSnap.size,
      completed: 0,
      pending: 0,
      incomplete: 0,
      failed: 0,
      completionRate: 0,
      avgTimeToComplete: 0
    };

    let totalCompletionTime = 0;
    let completedCount = 0;

    contactsSnap.forEach(doc => {
      const idiqData = doc.data().idiqApplication || {};
      const status = idiqData.status;

      if (status === 'completed') {
        stats.completed++;
        
        // Calculate time to complete
        if (idiqData.createdAt && idiqData.completedAt) {
          const timeToComplete = idiqData.completedAt.toMillis() - idiqData.createdAt.toMillis();
          totalCompletionTime += timeToComplete;
          completedCount++;
        }
      } else if (status === 'pending') {
        stats.pending++;
      } else if (status === 'incomplete') {
        stats.incomplete++;
      } else if (status === 'failed') {
        stats.failed++;
      }
    });

    // Calculate completion rate
    stats.completionRate = stats.total > 0 
      ? (stats.completed / stats.total * 100).toFixed(1)
      : 0;

    // Calculate average time to complete (in hours)
    stats.avgTimeToComplete = completedCount > 0
      ? Math.round(totalCompletionTime / completedCount / (1000 * 60 * 60))
      : 0;

    return stats;

  } catch (error) {
    console.error('Error getting application stats:', error);
    throw error;
  }
}

module.exports = {
  checkApplicationStatus,
  batchCheckApplications,
  isApplicationStalled,
  getReportUrl,
  notifyStatusChange,
  getApplicationStats,
  normalizeStatus,
  parseAPIStatus
};