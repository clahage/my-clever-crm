/**
 * AI CALCULATE TIME-TO-VALUE CLOUD FUNCTION
 *
 * Purpose:
 * Calculates comprehensive ROI and financial value for clients to prove
 * the concrete benefits of credit repair services.
 *
 * What It Does:
 * - Calculates total investment (monthly fees paid)
 * - Estimates interest savings (mortgage, auto loans, credit cards)
 * - Calculates insurance savings (auto, home)
 * - Estimates approval value (housing, employment opportunities)
 * - Computes ROI percentage and break-even point
 * - Generates formatted ROI reports for client communication
 * - Tracks value metrics over time
 *
 * Why It's Important:
 * - Proves concrete value to clients
 * - Justifies pricing and service tiers
 * - Provides powerful marketing material
 * - Reduces churn by showing tangible results
 * - Helps clients make informed financial decisions
 *
 * Called by: Tier3Dashboard component
 *
 * Created: 2025-12-05
 * Part of: Speedy Credit Repair Tier 3 AI Features
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

/**
 * Cloud Function: aiCalculateTimeToValue
 *
 * @param {Object} data - Request data
 * @param {string} data.contactId - Contact to calculate ROI for
 * @param {boolean} data.includeBreakdown - Include detailed breakdown (default: true)
 * @param {Object} context - Function context
 * @returns {Object} Time-to-value calculation
 */
exports.aiCalculateTimeToValue = functions.https.onCall(async (data, context) => {
  const { contactId, includeBreakdown = true } = data;

  console.log(`[aiCalculateTimeToValue] Calculating time-to-value for contact: ${contactId}`);

  try {
    if (!contactId) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing contactId');
    }

    // Verify contact exists
    const contactDoc = await admin.firestore().collection('contacts').doc(contactId).get();
    if (!contactDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Contact not found');
    }

    // Import the time-to-value calculator module
    const { calculateTimeToValue } = require('../../src/lib/ai/timeToValueCalculator');

    // Run calculation
    const calculation = await calculateTimeToValue(contactId, { includeBreakdown });

    // Store calculation for tracking
    await admin.firestore().collection('timeToValueCalculations').add({
      contactId,
      calculationDate: admin.firestore.FieldValue.serverTimestamp(),
      totalInvestment: calculation.investment.total,
      totalValue: calculation.value.total,
      netBenefit: calculation.roi.netBenefit,
      roiPercentage: calculation.roi.roiPercentage,
      breakEvenMonth: calculation.roi.breakEvenMonth,
      interestSavingsMonthly: calculation.value.interestSavings.monthly,
      insuranceSavingsMonthly: calculation.value.insuranceSavings.monthly
    });

    // Update contact with latest ROI data
    await admin.firestore().collection('contacts').doc(contactId).update({
      lastROICalculationDate: admin.firestore.FieldValue.serverTimestamp(),
      currentROI: calculation.roi.roiPercentage,
      totalValueGenerated: calculation.value.total,
      netBenefit: calculation.roi.netBenefit,
      breakEvenMonth: calculation.roi.breakEvenMonth
    });

    console.log(`[aiCalculateTimeToValue] Calculation complete. ROI: ${calculation.roi.roiPercentage}%`);

    return {
      success: true,
      calculation,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('[aiCalculateTimeToValue] Error:', error);
    throw new functions.https.HttpsError('internal', `Time-to-value calculation failed: ${error.message}`);
  }
});

/**
 * Cloud Function: aiGenerateROIReport
 *
 * @param {Object} data - Request data
 * @param {string} data.contactId - Contact to generate report for
 * @param {string} data.format - Report format ('html', 'text', 'pdf') (default: 'html')
 * @param {Object} context - Function context
 * @returns {Object} Formatted ROI report
 */
exports.aiGenerateROIReport = functions.https.onCall(async (data, context) => {
  const { contactId, format = 'html' } = data;

  console.log(`[aiGenerateROIReport] Generating ROI report for contact: ${contactId} (format: ${format})`);

  try {
    if (!contactId) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing contactId');
    }

    // Verify contact exists
    const contactDoc = await admin.firestore().collection('contacts').doc(contactId).get();
    if (!contactDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Contact not found');
    }

    // Import the time-to-value calculator module
    const { generateROIReport } = require('../../src/lib/ai/timeToValueCalculator');

    // Generate report
    const report = await generateROIReport(contactId);

    // Format based on requested format
    let formattedReport;
    switch (format) {
      case 'text':
        formattedReport = formatReportAsText(report);
        break;
      case 'html':
        formattedReport = formatReportAsHTML(report);
        break;
      case 'pdf':
        // TODO: Implement PDF generation
        formattedReport = formatReportAsHTML(report);
        break;
      default:
        formattedReport = report;
    }

    // Store report generation
    await admin.firestore().collection('roiReports').add({
      contactId,
      generationDate: admin.firestore.FieldValue.serverTimestamp(),
      format,
      roiPercentage: report.roi.roiPercentage,
      netBenefit: report.roi.netBenefit
    });

    console.log(`[aiGenerateROIReport] Report generated successfully`);

    return {
      success: true,
      report: formattedReport,
      format,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('[aiGenerateROIReport] Error:', error);
    throw new functions.https.HttpsError('internal', `ROI report generation failed: ${error.message}`);
  }
});

/**
 * Cloud Function: aiBatchCalculateROI
 *
 * Calculate ROI for multiple contacts at once
 *
 * @param {Object} data - Request data
 * @param {Array<string>} data.contactIds - Array of contact IDs
 * @param {Object} context - Function context
 * @returns {Object} Batch ROI calculations
 */
exports.aiBatchCalculateROI = functions.https.onCall(async (data, context) => {
  const { contactIds } = data;

  console.log(`[aiBatchCalculateROI] Batch calculating ROI for ${contactIds?.length || 0} contacts`);

  try {
    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid contactIds array');
    }

    if (contactIds.length > 50) {
      throw new functions.https.HttpsError('invalid-argument', 'Maximum 50 contacts per batch');
    }

    // Import the time-to-value calculator module
    const { calculateTimeToValue } = require('../../src/lib/ai/timeToValueCalculator');

    // Run calculations in parallel
    const calculations = await Promise.all(
      contactIds.map(async (contactId) => {
        try {
          const calculation = await calculateTimeToValue(contactId, { includeBreakdown: false });
          return { contactId, success: true, calculation };
        } catch (error) {
          console.error(`[aiBatchCalculateROI] Error calculating ${contactId}:`, error.message);
          return { contactId, success: false, error: error.message };
        }
      })
    );

    const successfulCalculations = calculations.filter(c => c.success);
    const avgROI = successfulCalculations.length > 0
      ? Math.round(
          successfulCalculations.reduce((sum, c) => sum + c.calculation.roi.roiPercentage, 0) /
          successfulCalculations.length
        )
      : 0;

    const totalValue = successfulCalculations.reduce(
      (sum, c) => sum + c.calculation.value.total,
      0
    );

    console.log(`[aiBatchCalculateROI] Batch complete. Average ROI: ${avgROI}%`);

    return {
      success: true,
      calculations,
      summary: {
        total: contactIds.length,
        successful: successfulCalculations.length,
        failed: calculations.filter(c => !c.success).length,
        averageROI: avgROI,
        totalValueGenerated: Math.round(totalValue),
        highestROI: successfulCalculations.length > 0
          ? Math.max(...successfulCalculations.map(c => c.calculation.roi.roiPercentage))
          : 0,
        lowestROI: successfulCalculations.length > 0
          ? Math.min(...successfulCalculations.map(c => c.calculation.roi.roiPercentage))
          : 0
      },
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('[aiBatchCalculateROI] Error:', error);
    throw new functions.https.HttpsError('internal', `Batch ROI calculation failed: ${error.message}`);
  }
});

/**
 * Scheduled Function: monthlyROIReporting
 *
 * Runs monthly to generate ROI reports for all active clients
 */
exports.monthlyROIReporting = functions.pubsub
  .schedule('0 3 1 * *') // Run at 3 AM on the 1st of each month
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('[monthlyROIReporting] Starting monthly ROI reporting');

    try {
      // Get all active clients
      const contactsSnapshot = await admin.firestore()
        .collection('contacts')
        .where('status', '==', 'active')
        .where('serviceTier', 'in', ['standard', 'acceleration', 'premium', 'vip_elite'])
        .get();

      const contactIds = contactsSnapshot.docs.map(doc => doc.id);
      console.log(`[monthlyROIReporting] Calculating ROI for ${contactIds.length} active clients`);

      // Import the time-to-value calculator module
      const { calculateTimeToValue } = require('../../src/lib/ai/timeToValueCalculator');

      // Calculate ROI for all clients
      const results = [];
      for (const contactId of contactIds) {
        try {
          const calculation = await calculateTimeToValue(contactId, { includeBreakdown: false });
          results.push({
            contactId,
            roiPercentage: calculation.roi.roiPercentage,
            netBenefit: calculation.roi.netBenefit,
            totalValue: calculation.value.total
          });
        } catch (error) {
          console.error(`[monthlyROIReporting] Error calculating ${contactId}:`, error.message);
        }
      }

      // Store monthly report
      await admin.firestore().collection('monthlyROIReports').add({
        reportDate: admin.firestore.FieldValue.serverTimestamp(),
        totalClients: contactIds.length,
        successfulCalculations: results.length,
        averageROI: Math.round(results.reduce((sum, r) => sum + r.roiPercentage, 0) / results.length),
        totalValueGenerated: results.reduce((sum, r) => sum + r.totalValue, 0),
        topPerformers: results
          .sort((a, b) => b.roiPercentage - a.roiPercentage)
          .slice(0, 10)
          .map(r => ({ contactId: r.contactId, roiPercentage: r.roiPercentage }))
      });

      console.log(`[monthlyROIReporting] Complete. ${results.length} ROI calculations performed`);

      return null;

    } catch (error) {
      console.error('[monthlyROIReporting] Error:', error);
      return null;
    }
  });

/**
 * Helper: Format report as plain text
 */
function formatReportAsText(report) {
  return `
=== ROI REPORT ===
Contact: ${report.contactId}
Date: ${new Date().toLocaleDateString()}

INVESTMENT:
- Monthly Fee: $${report.investment.monthlyFee}
- Months Enrolled: ${report.investment.monthsEnrolled}
- Total Investment: $${report.investment.total.toLocaleString()}

VALUE GENERATED:
- Interest Savings (Monthly): $${report.value.interestSavings.monthly}
- Interest Savings (Lifetime): $${report.value.interestSavings.lifetime.toLocaleString()}
- Insurance Savings (Monthly): $${report.value.insuranceSavings.monthly}
- Insurance Savings (Annual): $${report.value.insuranceSavings.annual.toLocaleString()}
- Approval Value: $${report.value.approvalValue.toLocaleString()}

RETURN ON INVESTMENT:
- ROI: ${report.roi.roiPercentage}%
- Net Benefit: $${report.roi.netBenefit.toLocaleString()}
- Break-Even: Month ${report.roi.breakEvenMonth || 'N/A'}
- Value Category: ${report.roi.valueCategory}
`.trim();
}

/**
 * Helper: Format report as HTML
 */
function formatReportAsHTML(report) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    .report { background: white; padding: 30px; border-radius: 8px; max-width: 800px; margin: 0 auto; }
    h1 { color: #1976d2; margin-bottom: 10px; }
    .summary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .summary h2 { margin: 0; font-size: 48px; }
    .section { margin: 30px 0; }
    .section h3 { color: #333; border-bottom: 2px solid #1976d2; padding-bottom: 10px; }
    .metric { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .metric:last-child { border-bottom: none; }
    .label { color: #666; }
    .value { font-weight: bold; color: #1976d2; }
    .highlight { background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="report">
    <h1>Credit Repair ROI Report</h1>
    <p>Generated: ${new Date().toLocaleDateString()}</p>

    <div class="summary">
      <h2>${report.roi.roiPercentage}%</h2>
      <p>Return on Investment</p>
      <p style="font-size: 24px; margin-top: 10px;">Net Benefit: $${report.roi.netBenefit.toLocaleString()}</p>
    </div>

    <div class="section">
      <h3>Investment Summary</h3>
      <div class="metric">
        <span class="label">Monthly Fee:</span>
        <span class="value">$${report.investment.monthlyFee}</span>
      </div>
      <div class="metric">
        <span class="label">Months Enrolled:</span>
        <span class="value">${report.investment.monthsEnrolled}</span>
      </div>
      <div class="metric">
        <span class="label">Total Investment:</span>
        <span class="value">$${report.investment.total.toLocaleString()}</span>
      </div>
    </div>

    <div class="section">
      <h3>Value Generated</h3>
      <div class="metric">
        <span class="label">Interest Savings (Monthly):</span>
        <span class="value">$${report.value.interestSavings.monthly}</span>
      </div>
      <div class="metric">
        <span class="label">Interest Savings (Lifetime):</span>
        <span class="value">$${report.value.interestSavings.lifetime.toLocaleString()}</span>
      </div>
      <div class="metric">
        <span class="label">Insurance Savings (Monthly):</span>
        <span class="value">$${report.value.insuranceSavings.monthly}</span>
      </div>
      <div class="metric">
        <span class="label">Insurance Savings (Annual):</span>
        <span class="value">$${report.value.insuranceSavings.annual.toLocaleString()}</span>
      </div>
      <div class="metric">
        <span class="label">Approval Value:</span>
        <span class="value">$${report.value.approvalValue.toLocaleString()}</span>
      </div>
      <div class="metric">
        <span class="label">Total Value:</span>
        <span class="value">$${report.value.total.toLocaleString()}</span>
      </div>
    </div>

    <div class="highlight">
      <strong>Break-Even Point:</strong> ${report.roi.breakEvenMonth ? `Month ${report.roi.breakEvenMonth}` : 'Already achieved'}
      <br>
      <strong>Value Category:</strong> ${report.roi.valueCategory}
    </div>
  </div>
</body>
</html>
`.trim();
}
