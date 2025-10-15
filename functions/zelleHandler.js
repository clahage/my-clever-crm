// functions/payments/zelleHandler.js
// Handles Zelle payment reporting and confirmation workflow

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { notifyZellePayment, sendPaymentReceipt } = require('../automation/notificationService');

const db = admin.firestore();

/**
 * Client reports they sent Zelle payment
 * Called from client portal
 */
exports.reportZellePayment = functions.https.onCall(async (data, context) => {
  // Require authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  try {
    const { amount, invoiceId, clientId } = data;

    // Validate inputs
    if (!amount || !clientId) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    // Get client data
    const clientDoc = await db.collection('contacts').doc(clientId).get();
    if (!clientDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Client not found');
    }
    const clientData = clientDoc.data();

    // Create pending transaction
    const transactionRef = await db.collection('paymentTransactions').add({
      clientId: clientId,
      invoiceId: invoiceId || null,
      amount: parseFloat(amount),
      type: 'zelle',
      status: 'pending-confirmation',
      
      zelle: {
        clientReportedAt: admin.firestore.FieldValue.serverTimestamp(),
        sentToEmail: 'billing@speedycreditrepair.com',
        sentToPhone: '8887247344',
        reference: `Client #${clientData.clientNumber || clientId.slice(0, 8)}`,
        confirmedBy: null,
        confirmedAt: null,
        chaseTransactionId: null,
        notReceivedReason: null
      },
      
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: context.auth.email
    });

    console.log('💜 Zelle payment reported:', transactionRef.id);

    // Notify Laurie immediately
    await notifyZellePayment(clientData, amount);

    // Schedule reminder if not confirmed in 1 hour
    await scheduleConfirmationReminder(transactionRef.id, 60);

    return { 
      success: true, 
      transactionId: transactionRef.id,
      message: 'Payment reported. You will receive confirmation within 1 hour.'
    };

  } catch (error) {
    console.error('Error reporting Zelle payment:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Laurie confirms Zelle payment received
 * Called from Laurie's billing dashboard
 */
exports.confirmZellePayment = functions.https.onCall(async (data, context) => {
  // Require authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  // TODO: Add role check - only Laurie or Chris can confirm
  // if (!context.auth.token.role || !['creditExpert', 'masterAdmin'].includes(context.auth.token.role)) {
  //   throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  // }

  try {
    const { transactionId, chaseTransactionId } = data;

    if (!transactionId) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing transaction ID');
    }

    // Get transaction
    const txnDoc = await db.collection('paymentTransactions').doc(transactionId).get();
    if (!txnDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Transaction not found');
    }
    const txnData = txnDoc.data();

    // Update transaction status
    await db.collection('paymentTransactions').doc(transactionId).update({
      status: 'completed',
      'zelle.confirmedBy': context.auth.email,
      'zelle.confirmedAt': admin.firestore.FieldValue.serverTimestamp(),
      'zelle.chaseTransactionId': chaseTransactionId || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Zelle payment confirmed:', transactionId);

    // Mark invoice as paid (if exists)
    if (txnData.invoiceId) {
      await db.collection('invoices').doc(txnData.invoiceId).update({
        status: 'paid',
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
        paymentMethod: 'zelle',
        paymentTransactionId: transactionId
      });
    }

    // Update client payment history
    await updateClientPaymentHistory(txnData.clientId, txnData.amount, 'zelle');

    // Clear past due status if applicable
    await clearPastDueStatus(txnData.clientId);

    // Get client email
    const clientDoc = await db.collection('contacts').doc(txnData.clientId).get();
    const clientData = clientDoc.data();

    // Send receipt to client
    if (clientData.email) {
      await sendPaymentReceipt(clientData.email, {
        amount: txnData.amount,
        method: 'zelle',
        date: new Date().toLocaleDateString(),
        transactionId: transactionId,
        clientNumber: clientData.clientNumber || txnData.clientId.slice(0, 8)
      });
    }

    return { 
      success: true,
      message: 'Payment confirmed and receipt sent to client'
    };

  } catch (error) {
    console.error('Error confirming Zelle payment:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Mark Zelle payment as not received
 * Called if client reports payment but it never arrives
 */
exports.markZelleNotReceived = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  try {
    const { transactionId, reason } = data;

    await db.collection('paymentTransactions').doc(transactionId).update({
      status: 'not-received',
      'zelle.notReceivedReason': reason || 'Payment not found in Chase',
      'zelle.markedNotReceivedBy': context.auth.email,
      'zelle.markedNotReceivedAt': admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('❌ Zelle payment marked not received:', transactionId);

    // TODO: Create follow-up task for Laurie to contact client

    return { success: true };

  } catch (error) {
    console.error('Error marking Zelle not received:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Get pending Zelle payments for Laurie's dashboard
 */
exports.getPendingZellePayments = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  try {
    const snapshot = await db.collection('paymentTransactions')
      .where('type', '==', 'zelle')
      .where('status', '==', 'pending-confirmation')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const payments = [];
    
    for (const doc of snapshot.docs) {
      const txn = { id: doc.id, ...doc.data() };
      
      // Get client info
      const clientDoc = await db.collection('contacts').doc(txn.clientId).get();
      if (clientDoc.exists) {
        txn.clientData = clientDoc.data();
      }
      
      payments.push(txn);
    }

    return { success: true, payments };

  } catch (error) {
    console.error('Error getting pending Zelle payments:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Schedule reminder if payment not confirmed
 */
async function scheduleConfirmationReminder(transactionId, delayMinutes) {
  // Use Cloud Tasks or simple setTimeout approach
  // For now, creating a reminder document that a scheduled function checks
  
  await db.collection('zelleConfirmationReminders').add({
    transactionId: transactionId,
    scheduledFor: admin.firestore.Timestamp.fromMillis(
      Date.now() + (delayMinutes * 60 * 1000)
    ),
    sent: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

/**
 * Scheduled function to send confirmation reminders
 * Runs every 15 minutes
 */
exports.sendZelleConfirmationReminders = functions.pubsub
  .schedule('*/15 * * * *') // Every 15 minutes
  .onRun(async (context) => {
    try {
      const now = admin.firestore.Timestamp.now();
      
      const remindersSnapshot = await db.collection('zelleConfirmationReminders')
        .where('sent', '==', false)
        .where('scheduledFor', '<=', now)
        .get();

      if (remindersSnapshot.empty) {
        return null;
      }

      for (const reminderDoc of remindersSnapshot.docs) {
        const reminder = reminderDoc.data();
        
        // Check if transaction still pending
        const txnDoc = await db.collection('paymentTransactions').doc(reminder.transactionId).get();
        if (!txnDoc.exists) continue;
        
        const txn = txnDoc.data();
        
        if (txn.status === 'pending-confirmation') {
          // Send reminder email to Laurie
          const { notifyZellePayment } = require('../automation/notificationService');
          
          const clientDoc = await db.collection('contacts').doc(txn.clientId).get();
          const clientData = clientDoc.data();
          
          // Send reminder
          // TODO: Implement reminder email
          console.log('⏰ Reminder: Zelle payment still pending:', reminder.transactionId);
        }
        
        // Mark reminder as sent
        await reminderDoc.ref.update({ sent: true });
      }

    } catch (error) {
      console.error('Error sending Zelle reminders:', error);
    }
  });

/**
 * Update client payment history
 */
async function updateClientPaymentHistory(clientId, amount, method) {
  try {
    await db.collection('contacts').doc(clientId).update({
      'paymentHistory': admin.firestore.FieldValue.arrayUnion({
        amount: amount,
        method: method,
        date: admin.firestore.FieldValue.serverTimestamp(),
        status: 'completed'
      }),
      lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
      lastPaymentAmount: amount,
      totalPaid: admin.firestore.FieldValue.increment(amount)
    });
  } catch (error) {
    console.error('Error updating payment history:', error);
  }
}

/**
 * Clear past due status for client
 */
async function clearPastDueStatus(clientId) {
  try {
    const clientDoc = await db.collection('contacts').doc(clientId).get();
    if (!clientDoc.exists) return;
    
    const clientData = clientDoc.data();
    
    // Only clear if this was their past due amount
    // More complex logic needed here based on your billing system
    if (clientData.status === 'past-due') {
      await db.collection('contacts').doc(clientId).update({
        status: 'active',
        pastDueCleared: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error clearing past due status:', error);
  }
}