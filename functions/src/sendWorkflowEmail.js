/**
 * SEND WORKFLOW EMAIL CLOUD FUNCTION
 *
 * Sends personalized emails via Gmail SMTP with tracking
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().gmail.email,
    pass: functions.config().gmail.password
  }
});

exports.sendWorkflowEmail = functions.https.onCall(async (data, context) => {
  const { contactId, template, testMode = false } = data;

  try {
    // Get contact
    const contactDoc = await admin.firestore().collection('contacts').doc(contactId).get();
    if (!contactDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Contact not found');
    }
    const contact = contactDoc.data();

    // Personalize content
    const personalizedSubject = personalizeContent(template.subject, contact);
    const personalizedBody = personalizeContent(template.body, contact);

    // In test mode, return what would be sent
    if (testMode) {
      return {
        success: true,
        contactView: {
          subject: personalizedSubject,
          body: personalizedBody,
          from: 'Christopher @ Speedy Credit Repair',
          to: contact.email
        },
        sent: false,
        testMode: true
      };
    }

    // Send actual email
    const mailOptions = {
      from: '"Christopher @ Speedy Credit Repair" <christopher@speedycreditrepair.com>',
      to: contact.email,
      subject: personalizedSubject,
      html: formatEmailHTML(personalizedBody, template.cta),
      headers: {
        'X-Contact-ID': contactId,
        'X-Workflow-Email': 'true'
      }
    };

    const info = await transporter.sendMail(mailOptions);

    // Log to Firestore
    await admin.firestore().collection('emailLogs').add({
      contactId,
      subject: personalizedSubject,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      messageId: info.messageId,
      template: template.template,
      opened: false,
      clicked: false
    });

    return {
      success: true,
      messageId: info.messageId,
      contactView: {
        subject: personalizedSubject,
        body: personalizedBody
      }
    };

  } catch (error) {
    console.error('[sendWorkflowEmail] Error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

function personalizeContent(content, contact) {
  if (!content) return '';

  const replacements = {
    '{{firstName}}': contact.firstName || 'there',
    '{{lastName}}': contact.lastName || '',
    '{{email}}': contact.email || '',
    '{{creditScore}}': contact.creditScore || 'N/A',
    '{{negativeItemCount}}': contact.negativeItemCount || '0',
    '{{serviceTier}}': contact.serviceTier || 'Standard',
    '{{companyName}}': 'Speedy Credit Repair',
    '{{companyPhone}}': '(555) 123-4567',
    '{{companyAddress}}': '123 Main Street, Suite 100, City, ST 12345'
  };

  let result = content;
  Object.keys(replacements).forEach(key => {
    result = result.replace(new RegExp(key, 'g'), replacements[key]);
  });

  return result;
}

function formatEmailHTML(body, cta) {
  let html = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        ${body.replace(/\n/g, '<br>')}
  `;

  if (cta) {
    html += `
      <div style="margin: 30px 0; text-align: center;">
        <a href="${cta.url}" style="background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
          ${cta.text}
        </a>
      </div>
    `;
  }

  html += `
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
          <p>Speedy Credit Repair<br>
          123 Main Street, Suite 100<br>
          City, ST 12345</p>
          <p><a href="{{unsubscribeLink}}" style="color: #666;">Unsubscribe</a></p>
        </div>
      </body>
    </html>
  `;

  return html;
}
