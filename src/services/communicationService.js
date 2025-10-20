/**
 * communicationService.js
 * 
 * Purpose: Unified communication router for SpeedyCRM
 * Routes messages through email, fax, SMS, or internal messaging
 * Integrates with AI for auto-responses and smart routing
 * 
 * Features:
 * - Multi-channel message routing (email, fax, SMS)
 * - AI-powered auto-responses
 * - Smart staff assignment
 * - Priority-based routing
 * - Ticket creation for complex queries
 * - Real-time status tracking
 * - Analytics and reporting
 * 
 * Dependencies:
 * - emailService.js
 * - faxService.js
 * - OpenAI API
 * - Firebase Firestore
 * 
 * Author: Claude (SpeedyCRM Team)
 * Last Updated: October 19, 2025
 */

import emailService from './emailService';
import faxService from './faxService';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { OpenAI } from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // For client-side usage
});

// Communication types
export const COMMUNICATION_TYPES = {
  EMAIL: 'email',
  FAX: 'fax',
  SMS: 'sms',
  INTERNAL: 'internal',
  CALL: 'call'
};

// Message priorities
export const PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Department routing
export const DEPARTMENTS = {
  SUPPORT: 'support',
  URGENT: 'urgent',
  BILLING: 'billing',
  DISPUTES: 'disputes',
  GENERAL: 'general'
};

/**
 * Send a client message through appropriate channel
 * 
 * @param {Object} options - Message options
 * @param {string} options.clientId - Client ID
 * @param {string} options.clientEmail - Client email
 * @param {string} options.clientName - Client name
 * @param {string} options.department - Department: support, urgent, billing, disputes
 * @param {string} options.subject - Message subject
 * @param {string} options.message - Message body
 * @param {string} [options.priority] - Priority: low, normal, high, urgent
 * @param {string} [options.type] - Communication type (defaults to email)
 * @param {boolean} [options.aiProcess] - Should AI process this? (default: true)
 * @param {Object} [options.metadata] - Additional metadata
 * @returns {Promise<Object>} - Communication result
 */
export const sendClientMessage = async ({
  clientId,
  clientEmail,
  clientName = 'Valued Client',
  department = DEPARTMENTS.SUPPORT,
  subject,
  message,
  priority = PRIORITIES.NORMAL,
  type = COMMUNICATION_TYPES.EMAIL,
  aiProcess = true,
  metadata = {}
}) => {
  try {
    console.log(`📨 Processing client message: ${department} - ${priority}`);

    // Create communication record
    const communicationData = {
      clientId,
      clientEmail,
      clientName,
      department,
      subject,
      message,
      priority,
      type,
      direction: 'inbound',
      status: 'received',
      aiProcessed: false,
      timestamp: serverTimestamp(),
      metadata
    };

    // Save to Firestore
    const commRef = await addDoc(collection(db, 'communications'), communicationData);
    const communicationId = commRef.id;

    // Process with AI if enabled
    let aiResponse = null;
    let shouldAutoRespond = false;
    let staffAssignment = null;

    if (aiProcess && import.meta.env.VITE_OPENAI_API_KEY) {
      const aiAnalysis = await analyzeMessageWithAI({
        subject,
        message,
        department,
        priority,
        clientName
      });

      aiResponse = aiAnalysis;
      shouldAutoRespond = aiAnalysis.canAutoRespond;
      staffAssignment = aiAnalysis.assignTo;

      // Update communication with AI analysis
      await updateDoc(doc(db, 'communications', communicationId), {
        aiProcessed: true,
        aiAnalysis: aiAnalysis,
        aiConfidence: aiAnalysis.confidence
      });
    }

    // Handle based on priority and AI decision
    if (priority === PRIORITIES.URGENT) {
      // Always create ticket and alert staff for urgent
      await handleUrgentMessage({
        communicationId,
        clientId,
        clientEmail,
        clientName,
        subject,
        message,
        aiResponse
      });

      return {
        success: true,
        communicationId,
        action: 'urgent_ticket_created',
        message: 'Urgent message received. Our team has been alerted and will respond immediately.'
      };

    } else if (shouldAutoRespond && aiResponse?.response) {
      // AI can handle this - send auto-response
      await sendAutoResponse({
        communicationId,
        clientEmail,
        clientName,
        subject,
        aiResponse: aiResponse.response,
        type
      });

      return {
        success: true,
        communicationId,
        action: 'auto_responded',
        message: 'Your message has been processed and a response has been sent.',
        autoResponse: true
      };

    } else {
      // Create ticket for human review
      const ticketId = await createTicket({
        communicationId,
        clientId,
        clientEmail,
        clientName,
        department,
        subject,
        message,
        priority,
        assignTo: staffAssignment,
        aiNotes: aiResponse?.reasoning
      });

      // Send acknowledgment
      await sendAcknowledgment({
        communicationId,
        clientEmail,
        clientName,
        subject,
        ticketId,
        type
      });

      return {
        success: true,
        communicationId,
        ticketId,
        action: 'ticket_created',
        message: 'Your message has been received. A team member will respond within 24 hours.',
        estimatedResponseTime: '24 hours'
      };
    }

  } catch (error) {
    console.error('❌ Failed to process client message:', error);
    
    // Fallback: create ticket even if AI fails
    try {
      const fallbackTicket = await createTicket({
        clientId,
        clientEmail,
        clientName,
        department,
        subject,
        message,
        priority,
        aiNotes: 'AI processing failed - needs immediate attention'
      });

      return {
        success: true,
        ticketId: fallbackTicket,
        action: 'ticket_created',
        message: 'Your message has been received and will be reviewed by our team.',
        fallback: true
      };
    } catch (fallbackError) {
      console.error('❌ Fallback ticket creation failed:', fallbackError);
      throw new Error('Failed to process message. Please try again or contact support directly.');
    }
  }
};

/**
 * Analyze message with AI to determine appropriate response
 */
const analyzeMessageWithAI = async ({ subject, message, department, priority, clientName }) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant for Speedy Credit Repair, a credit restoration company.
          
Analyze client messages and determine:
1. Can you auto-respond? (yes/no)
2. If yes, generate a helpful, professional response
3. If no, explain why human intervention is needed
4. Suggest which staff member should handle it (support, billing, disputes, urgent)
5. Rate your confidence (0-100)

Guidelines:
- Auto-respond to: Status checks, general info, billing questions with clear answers, FAQs
- Human required for: Complaints, complex disputes, legal questions, account changes, emotional/angry messages
- Be empathetic, professional, and helpful
- Never make promises about credit score improvements
- Don't provide legal advice

Return JSON format:
{
  "canAutoRespond": boolean,
  "response": "string (if can auto-respond)" or null,
  "reasoning": "why human is needed (if cannot auto-respond)",
  "assignTo": "support" | "billing" | "disputes" | "urgent",
  "urgencyLevel": "low" | "normal" | "high" | "urgent",
  "confidence": number (0-100),
  "tags": ["tag1", "tag2"]
}`
        },
        {
          role: 'user',
          content: `Client: ${clientName}
Department: ${department}
Priority: ${priority}
Subject: ${subject}
Message: ${message}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const aiDecision = JSON.parse(completion.choices[0].message.content);
    
    console.log('🤖 AI Analysis:', {
      canAutoRespond: aiDecision.canAutoRespond,
      assignTo: aiDecision.assignTo,
      confidence: aiDecision.confidence
    });

    return aiDecision;

  } catch (error) {
    console.error('AI analysis failed:', error);
    
    // Fallback decision
    return {
      canAutoRespond: false,
      response: null,
      reasoning: 'AI processing unavailable - human review required',
      assignTo: department,
      urgencyLevel: priority,
      confidence: 0,
      tags: ['ai_failed']
    };
  }
};

/**
 * Handle urgent messages with immediate alerts
 */
const handleUrgentMessage = async ({ communicationId, clientId, clientEmail, clientName, subject, message, aiResponse }) => {
  try {
    // Create high-priority ticket
    const ticketId = await createTicket({
      communicationId,
      clientId,
      clientEmail,
      clientName,
      department: DEPARTMENTS.URGENT,
      subject: `🚨 URGENT: ${subject}`,
      message,
      priority: PRIORITIES.URGENT,
      assignTo: 'urgent',
      aiNotes: aiResponse?.reasoning || 'Urgent client message'
    });

    // Send urgent alert emails to staff
    const urgentEmails = [
      'chris@speedycreditrepair.com',
      'urgent@speedycreditrepair.com'
    ];

    for (const email of urgentEmails) {
      await emailService.sendEmail({
        to: email,
        subject: `🚨 URGENT Client Message - ${clientName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 3px solid #ff0000; padding: 20px;">
            <h1 style="color: #ff0000;">🚨 URGENT CLIENT MESSAGE</h1>
            <div style="background: #fff5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p><strong>Client:</strong> ${clientName}</p>
              <p><strong>Email:</strong> ${clientEmail}</p>
              <p><strong>Ticket:</strong> #${ticketId}</p>
              <p><strong>Subject:</strong> ${subject}</p>
            </div>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
              <p><strong>Message:</strong></p>
              <p>${message}</p>
            </div>
            ${aiResponse?.reasoning ? `
              <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 15px;">
                <p><strong>🤖 AI Analysis:</strong></p>
                <p>${aiResponse.reasoning}</p>
              </div>
            ` : ''}
            <a href="${window.location.origin}/admin/tickets/${ticketId}" 
               style="display: inline-block; background: #ff0000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; margin-top: 20px; font-weight: bold;">
              VIEW TICKET NOW
            </a>
          </div>
        `,
        priority: 'high'
      });
    }

    // Send SMS alert (if configured)
    // TODO: Add SMS notification when we add SMS provider

    console.log('🚨 Urgent message handled, staff alerted');

  } catch (error) {
    console.error('Failed to handle urgent message:', error);
    throw error;
  }
};

/**
 * Send AI-generated auto-response
 */
const sendAutoResponse = async ({ communicationId, clientEmail, clientName, subject, aiResponse, type }) => {
  try {
    if (type === COMMUNICATION_TYPES.EMAIL) {
      await emailService.sendEmail({
        to: clientEmail,
        subject: `Re: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <p>Hi ${clientName},</p>
            ${aiResponse}
            <p style="margin-top: 30px;">If you need further assistance, please don't hesitate to reach out!</p>
            <p>Best regards,<br>Speedy Credit Repair Team</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 12px; color: #666;">
              <em>This response was generated by our AI assistant. If you need to speak with a human team member, just reply to this email.</em>
            </p>
          </div>
        `,
        replyTo: 'support@speedycreditrepair.com',
        metadata: {
          communicationId,
          autoGenerated: true
        }
      });
    }

    // Update communication status
    await updateDoc(doc(db, 'communications', communicationId), {
      status: 'auto_responded',
      autoResponse: aiResponse,
      respondedAt: serverTimestamp()
    });

    console.log('✅ Auto-response sent');

  } catch (error) {
    console.error('Failed to send auto-response:', error);
    throw error;
  }
};

/**
 * Send acknowledgment that message was received
 */
const sendAcknowledgment = async ({ communicationId, clientEmail, clientName, subject, ticketId, type }) => {
  try {
    if (type === COMMUNICATION_TYPES.EMAIL) {
      await emailService.sendEmail({
        to: clientEmail,
        subject: `Re: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #009E60;">Message Received ✓</h2>
            <p>Hi ${clientName},</p>
            <p>Thank you for contacting Speedy Credit Repair. We've received your message and a team member will respond within 24 hours.</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Your Ticket Number:</strong> #${ticketId}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Status:</strong> Open</p>
            </div>
            <p>You can track the status of your inquiry by logging into your client portal.</p>
            <a href="${window.location.origin}/client-portal" 
               style="display: inline-block; background: #009E60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
              View Portal
            </a>
            <p style="margin-top: 30px;">Best regards,<br>Speedy Credit Repair Team</p>
          </div>
        `,
        replyTo: 'support@speedycreditrepair.com',
        metadata: {
          communicationId,
          ticketId
        }
      });
    }

    // Update communication
    await updateDoc(doc(db, 'communications', communicationId), {
      status: 'acknowledged',
      acknowledgedAt: serverTimestamp()
    });

    console.log('✅ Acknowledgment sent');

  } catch (error) {
    console.error('Failed to send acknowledgment:', error);
    // Don't throw - acknowledgment failure shouldn't block ticket creation
  }
};

/**
 * Create support ticket
 */
const createTicket = async ({
  communicationId,
  clientId,
  clientEmail,
  clientName,
  department,
  subject,
  message,
  priority,
  assignTo = null,
  aiNotes = null
}) => {
  try {
    const ticketRef = await addDoc(collection(db, 'tickets'), {
      communicationId,
      clientId,
      clientEmail,
      clientName,
      department,
      subject,
      description: message,
      priority,
      status: 'open',
      assignedTo: assignTo,
      aiNotes,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      resolvedAt: null,
      tags: []
    });

    console.log('🎫 Ticket created:', ticketRef.id);

    return ticketRef.id;

  } catch (error) {
    console.error('Failed to create ticket:', error);
    throw error;
  }
};

/**
 * Send fax (wrapper for faxService)
 */
export const sendFaxMessage = async ({ to, documentUrl, clientInfo, metadata }) => {
  return faxService.sendFax({
    to,
    documentUrl,
    metadata: {
      ...metadata,
      ...clientInfo
    }
  });
};

/**
 * Send fax to credit bureau
 */
export const sendDisputeFax = async ({ bureau, documentUrl, clientInfo, autoSend = false }) => {
  if (!autoSend) {
    // Manual send - just return the function reference
    return () => faxService.sendFaxToBureau(bureau, documentUrl, clientInfo);
  } else {
    // Auto-send immediately
    return faxService.sendFaxToBureau(bureau, documentUrl, clientInfo);
  }
};

/**
 * Get all communications for a client
 */
export const getClientCommunications = async (clientId, filters = {}) => {
  try {
    let q = query(
      collection(db, 'communications'),
      where('clientId', '==', clientId)
    );

    if (filters.type) {
      q = query(q, where('type', '==', filters.type));
    }

    if (filters.department) {
      q = query(q, where('department', '==', filters.department));
    }

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error('Failed to get client communications:', error);
    return [];
  }
};

/**
 * Get communication statistics
 */
export const getCommunicationStats = async (dateRange = {}) => {
  try {
    const snapshot = await getDocs(collection(db, 'communications'));
    
    const stats = {
      total: snapshot.size,
      byType: {},
      byDepartment: {},
      byPriority: {},
      autoResponded: 0,
      ticketsCreated: 0,
      averageResponseTime: null
    };

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      
      // Count by type
      stats.byType[data.type] = (stats.byType[data.type] || 0) + 1;
      
      // Count by department
      stats.byDepartment[data.department] = (stats.byDepartment[data.department] || 0) + 1;
      
      // Count by priority
      stats.byPriority[data.priority] = (stats.byPriority[data.priority] || 0) + 1;
      
      // Count auto-responses
      if (data.status === 'auto_responded') {
        stats.autoResponded++;
      }
    });

    return stats;

  } catch (error) {
    console.error('Failed to get communication stats:', error);
    return null;
  }
};

export default {
  sendClientMessage,
  sendFaxMessage,
  sendDisputeFax,
  getClientCommunications,
  getCommunicationStats,
  COMMUNICATION_TYPES,
  PRIORITIES,
  DEPARTMENTS
};