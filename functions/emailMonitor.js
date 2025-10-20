/**
 * emailMonitor.js (Firebase Cloud Function)
 * 
 * Purpose: Monitor Gmail inbox for incoming client emails and process with AI
 * Runs every 2 minutes to check for new unread emails
 * 
 * Features:
 * - Gmail API integration
 * - Auto-process new emails with AI
 * - Create tickets or auto-respond
 * - Mark emails as read after processing
 * - Error handling and retry logic
 * 
 * Deploy with: firebase deploy --only functions:emailMonitor
 * 
 * Author: Claude (SpeedyCRM Team)
 * Last Updated: October 19, 2025
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');
const { OpenAI } = require('openai');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: functions.config().openai.key
});

// Gmail OAuth2 credentials
const GMAIL_CLIENT_ID = functions.config().gmail.client_id;
const GMAIL_CLIENT_SECRET = functions.config().gmail.client_secret;
const GMAIL_REFRESH_TOKEN = functions.config().gmail.refresh_token;

// SendGrid for sending responses
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(functions.config().sendgrid.key);

/**
 * Email Monitor - Runs every 2 minutes
 */
exports.monitorInbox = functions.pubsub
  .schedule('every 2 minutes')
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    try {
      console.log('📧 Starting email monitor...');

      // Initialize Gmail API
      const gmail = await getGmailClient();

      // Get unread emails
      const messages = await getUnreadEmails(gmail);

      if (messages.length === 0) {
        console.log('✅ No new emails to process');
        return null;
      }

      console.log(`📬 Found ${messages.length} unread emails`);

      // Process each email
      for (const message of messages) {
        try {
          await processEmail(gmail, message.id);
        } catch (error) {
          console.error(`Failed to process email ${message.id}:`, error);
          // Continue processing other emails even if one fails
        }
      }

      console.log('✅ Email monitor completed');
      return null;

    } catch (error) {
      console.error('❌ Email monitor failed:', error);
      throw error;
    }
  });

/**
 * Get Gmail API client
 */
async function getGmailClient() {
  const oauth2Client = new google.auth.OAuth2(
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground' // Redirect URI
  );

  oauth2Client.setCredentials({
    refresh_token: GMAIL_REFRESH_TOKEN
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

/**
 * Get unread emails from inbox
 */
async function getUnreadEmails(gmail) {
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread label:inbox',
      maxResults: 10
    });

    return response.data.messages || [];

  } catch (error) {
    console.error('Failed to get unread emails:', error);
    throw error;
  }
}

/**
 * Process a single email
 */
async function processEmail(gmail, messageId) {
  try {
    // Get full email data
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    });

    const email = response.data;
    const headers = email.payload.headers;

    // Extract email details
    const from = headers.find(h => h.name === 'From')?.value || '';
    const to = headers.find(h => h.name === 'To')?.value || '';
    const subject = headers.find(h => h.name === 'Subject')?.value || '(No Subject)';
    const date = headers.find(h => h.name === 'Date')?.value || '';

    // Extract email body
    let body = '';
    if (email.payload.body.data) {
      body = Buffer.from(email.payload.body.data, 'base64').toString('utf-8');
    } else if (email.payload.parts) {
      for (const part of email.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body.data) {
          body += Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      }
    }

    // Clean up body (remove quoted replies)
    body = cleanEmailBody(body);

    console.log(`📧 Processing email: "${subject}" from ${from}`);

    // Extract sender email
    const senderEmail = extractEmail(from);

    // Check if this is from a known client
    const clientData = await findClientByEmail(senderEmail);

    if (!clientData) {
      console.log(`⚠️ Email from unknown sender: ${senderEmail}`);
      // You could optionally create a lead here
      await markAsRead(gmail, messageId);
      return;
    }

    // Determine department based on recipient
    const department = determineDepartment(to);

    // Log to Firestore
    const communicationRef = await db.collection('communications').add({
      type: 'email',
      direction: 'inbound',
      clientId: clientData.id,
      clientEmail: senderEmail,
      clientName: clientData.name,
      from: senderEmail,
      to: to,
      subject: subject,
      message: body,
      department: department,
      priority: 'normal',
      status: 'received',
      aiProcessed: false,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        gmailMessageId: messageId,
        receivedDate: date
      }
    });

    console.log(`✅ Communication logged: ${communicationRef.id}`);

    // Process with AI
    const aiAnalysis = await analyzeEmailWithAI(subject, body, department, clientData.name);

    // Update communication with AI analysis
    await communicationRef.update({
      aiProcessed: true,
      aiAnalysis: aiAnalysis,
      aiConfidence: aiAnalysis.confidence
    });

    // Handle based on AI decision
    if (aiAnalysis.urgencyLevel === 'urgent') {
      // Create urgent ticket and alert staff
      await handleUrgentEmail(communicationRef.id, clientData, subject, body, aiAnalysis);
    } else if (aiAnalysis.canAutoRespond && aiAnalysis.response) {
      // Send auto-response
      await sendAutoResponse(communicationRef.id, senderEmail, clientData.name, subject, aiAnalysis.response);
    } else {
      // Create ticket for human review
      await createTicket(communicationRef.id, clientData, department, subject, body, aiAnalysis);
      await sendAcknowledgment(senderEmail, clientData.name, subject);
    }

    // Mark email as read
    await markAsRead(gmail, messageId);

    console.log(`✅ Email processed successfully`);

  } catch (error) {
    console.error('Failed to process email:', error);
    throw error;
  }
}

/**
 * Analyze email with AI
 */
async function analyzeEmailWithAI(subject, body, department, clientName) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant for Speedy Credit Repair. Analyze client emails and determine:
1. Can you auto-respond? (yes/no)
2. If yes, generate a helpful response
3. If no, explain why human is needed
4. Suggest urgency level (low/normal/high/urgent)
5. Rate confidence (0-100)

Return JSON format:
{
  "canAutoRespond": boolean,
  "response": "string or null",
  "reasoning": "string",
  "urgencyLevel": "low|normal|high|urgent",
  "confidence": number,
  "tags": ["tag1", "tag2"]
}`
        },
        {
          role: 'user',
          content: `Client: ${clientName}\nDepartment: ${department}\nSubject: ${subject}\nMessage: ${body}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return JSON.parse(completion.choices[0].message.content);

  } catch (error) {
    console.error('AI analysis failed:', error);
    return {
      canAutoRespond: false,
      response: null,
      reasoning: 'AI processing failed',
      urgencyLevel: 'normal',
      confidence: 0,
      tags: ['ai_failed']
    };
  }
}

/**
 * Handle urgent email
 */
async function handleUrgentEmail(commId, clientData, subject, body, aiAnalysis) {
  try {
    // Create urgent ticket
    const ticketRef = await db.collection('tickets').add({
      communicationId: commId,
      clientId: clientData.id,
      clientEmail: clientData.email,
      clientName: clientData.name,
      department: 'urgent',
      subject: `🚨 URGENT: ${subject}`,
      description: body,
      priority: 'urgent',
      status: 'open',
      assignedTo: 'urgent',
      aiNotes: aiAnalysis.reasoning,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send urgent alert to staff
    await sgMail.send({
      to: ['chris@speedycreditrepair.com', 'urgent@speedycreditrepair.com'],
      from: 'noreply@speedycreditrepair.com',
      subject: `🚨 URGENT Client Email - ${clientData.name}`,
      html: `
        <div style="border: 3px solid #ff0000; padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #ff0000;">🚨 URGENT CLIENT EMAIL</h1>
          <p><strong>Client:</strong> ${clientData.name}</p>
          <p><strong>Email:</strong> ${clientData.email}</p>
          <p><strong>Ticket:</strong> #${ticketRef.id}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background: #f5f5f5; padding: 15px; margin: 15px 0;">
            <p><strong>Message:</strong></p>
            <p>${body}</p>
          </div>
          <p><strong>AI Analysis:</strong> ${aiAnalysis.reasoning}</p>
        </div>
      `
    });

    console.log('🚨 Urgent email handled, staff alerted');

  } catch (error) {
    console.error('Failed to handle urgent email:', error);
  }
}

/**
 * Send auto-response
 */
async function sendAutoResponse(commId, toEmail, clientName, subject, aiResponse) {
  try {
    await sgMail.send({
      to: toEmail,
      from: 'noreply@speedycreditrepair.com',
      replyTo: 'support@speedycreditrepair.com',
      subject: `Re: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <p>Hi ${clientName},</p>
          ${aiResponse}
          <p style="margin-top: 30px;">If you need further assistance, please don't hesitate to reach out!</p>
          <p>Best regards,<br>Speedy Credit Repair Team</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
          <p style="font-size: 12px; color: #666;">
            <em>This response was generated by our AI assistant.</em>
          </p>
        </div>
      `
    });

    // Update communication status
    await db.collection('communications').doc(commId).update({
      status: 'auto_responded',
      autoResponse: aiResponse,
      respondedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Auto-response sent');

  } catch (error) {
    console.error('Failed to send auto-response:', error);
  }
}

/**
 * Create ticket
 */
async function createTicket(commId, clientData, department, subject, body, aiAnalysis) {
  try {
    await db.collection('tickets').add({
      communicationId: commId,
      clientId: clientData.id,
      clientEmail: clientData.email,
      clientName: clientData.name,
      department: department,
      subject: subject,
      description: body,
      priority: aiAnalysis.urgencyLevel,
      status: 'open',
      assignedTo: aiAnalysis.assignTo || null,
      aiNotes: aiAnalysis.reasoning,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('🎫 Ticket created');

  } catch (error) {
    console.error('Failed to create ticket:', error);
  }
}

/**
 * Send acknowledgment email
 */
async function sendAcknowledgment(toEmail, clientName, subject) {
  try {
    await sgMail.send({
      to: toEmail,
      from: 'noreply@speedycreditrepair.com',
      replyTo: 'support@speedycreditrepair.com',
      subject: `Re: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #009E60;">Message Received ✓</h2>
          <p>Hi ${clientName},</p>
          <p>Thank you for contacting Speedy Credit Repair. We've received your message and a team member will respond within 24 hours.</p>
          <p>Best regards,<br>Speedy Credit Repair Team</p>
        </div>
      `
    });

    console.log('✅ Acknowledgment sent');

  } catch (error) {
    console.error('Failed to send acknowledgment:', error);
  }
}

/**
 * Find client by email
 */
async function findClientByEmail(email) {
  try {
    const snapshot = await db.collection('clients')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      email: email,
      name: doc.data().name || doc.data().firstName + ' ' + doc.data().lastName || 'Valued Client'
    };

  } catch (error) {
    console.error('Failed to find client:', error);
    return null;
  }
}

/**
 * Determine department from recipient email
 */
function determineDepartment(toEmail) {
  const email = toEmail.toLowerCase();
  
  if (email.includes('urgent@')) return 'urgent';
  if (email.includes('billing@')) return 'billing';
  if (email.includes('disputes@')) return 'disputes';
  if (email.includes('support@')) return 'support';
  
  return 'general';
}

/**
 * Extract email address from "Name <email@domain.com>" format
 */
function extractEmail(fromString) {
  const match = fromString.match(/<(.+?)>/);
  if (match) {
    return match[1].toLowerCase();
  }
  return fromString.toLowerCase();
}

/**
 * Clean email body (remove quoted replies, signatures, etc.)
 */
function cleanEmailBody(body) {
  // Remove quoted replies (lines starting with >)
  let cleaned = body.split('\n')
    .filter(line => !line.trim().startsWith('>'))
    .join('\n');
  
  // Remove "On [date], [person] wrote:" patterns
  cleaned = cleaned.replace(/On .+? wrote:/g, '');
  
  // Remove excessive whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
  
  return cleaned;
}

/**
 * Mark email as read in Gmail
 */
async function markAsRead(gmail, messageId) {
  try {
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD']
      }
    });

    console.log(`✅ Email marked as read: ${messageId}`);

  } catch (error) {
    console.error('Failed to mark as read:', error);
  }
}

/**
 * Manual trigger endpoint (for testing)
 */
exports.triggerEmailMonitor = functions.https.onRequest(async (req, res) => {
  try {
    await exports.monitorInbox.run();
    res.status(200).send('Email monitor triggered successfully');
  } catch (error) {
    console.error('Failed to trigger email monitor:', error);
    res.status(500).send('Error: ' + error.message);
  }
});