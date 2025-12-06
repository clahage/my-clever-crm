/**
 * HANDLE IDIQ WEBHOOK
 * Processes webhooks from IDIQ when credit reports are ready or subscription changes
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.handleIDIQWebhook = functions.https.onRequest(async (req, res) => {
  const { event, data } = req.body;

  try {
    console.log(`[handleIDIQWebhook] Received event: ${event}`);

    switch (event) {
      case 'report.ready':
        await handleReportReady(data);
        break;

      case 'subscription.activated':
        await handleSubscriptionActivated(data);
        break;

      case 'subscription.lapsed':
        await handleSubscriptionLapsed(data);
        break;

      case 'subscription.renewed':
        await handleSubscriptionRenewed(data);
        break;

      default:
        console.log(`[handleIDIQWebhook] Unknown event: ${event}`);
    }

    res.status(200).send({ success: true });

  } catch (error) {
    console.error('[handleIDIQWebhook] Error:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});

async function handleReportReady(data) {
  const { userId, reportUrl, creditScore, negativeItems } = data;

  // Find contact by IDIQ user ID
  const contactsRef = admin.firestore().collection('contacts');
  const query = await contactsRef.where('idiqUserId', '==', userId).get();

  if (query.empty) {
    console.log(`[handleReportReady] No contact found for IDIQ user: ${userId}`);
    return;
  }

  const contactDoc = query.docs[0];

  // Update contact with report data
  await contactDoc.ref.update({
    idiqReportUrl: reportUrl,
    creditScore: creditScore,
    negativeItemCount: negativeItems.length,
    idiqReportReceivedAt: admin.firestore.FieldValue.serverTimestamp(),
    idiqStatus: 'report_ready'
  });

  console.log(`[handleReportReady] Updated contact ${contactDoc.id} with report data`);
}

async function handleSubscriptionActivated(data) {
  const { userId } = data;

  const contactsRef = admin.firestore().collection('contacts');
  const query = await contactsRef.where('idiqUserId', '==', userId).get();

  if (!query.empty) {
    await query.docs[0].ref.update({
      idiqStatus: 'enrolled',
      idiqEnrolledAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`[handleSubscriptionActivated] Contact ${query.docs[0].id} enrolled in IDIQ`);
  }
}

async function handleSubscriptionLapsed(data) {
  const { userId } = data;

  const contactsRef = admin.firestore().collection('contacts');
  const query = await contactsRef.where('idiqUserId', '==', userId).get();

  if (!query.empty) {
    const contactId = query.docs[0].id;

    await query.docs[0].ref.update({
      idiqStatus: 'lapsed',
      idiqLapsedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Trigger IDIQ lapse recovery workflow
    const { handleIDIQLapse } = require('./workflowEngine');
    await handleIDIQLapse(contactId, 0);

    console.log(`[handleSubscriptionLapsed] Contact ${contactId} IDIQ lapsed, recovery workflow triggered`);
  }
}

async function handleSubscriptionRenewed(data) {
  const { userId } = data;

  const contactsRef = admin.firestore().collection('contacts');
  const query = await contactsRef.where('idiqUserId', '==', userId).get();

  if (!query.empty) {
    await query.docs[0].ref.update({
      idiqStatus: 'enrolled',
      idiqRenewedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`[handleSubscriptionRenewed] Contact ${query.docs[0].id} renewed IDIQ`);
  }
}
