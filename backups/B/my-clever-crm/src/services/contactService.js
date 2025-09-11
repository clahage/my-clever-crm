// src/services/contactService.js
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

// Helper: Validate and normalize contact data
function normalizeContactData(data) {
  // Platform source fields
  const platform = data.platform || '';
  const sourceDetails = {
    platformId: data.platformId || '',
    messageUrl: data.messageUrl || data.reviewUrl || data.profileUrl || '',
    businessName: data.businessName || '',
    pageUrl: data.pageUrl || '',
    companyUrl: data.companyUrl || '',
    affiliateName: data.affiliateName || '',
    referralCode: data.referralCode || '',
  };

  // Conversation intelligence
  const conversation = {
    callSummary: data.callSummary || data.conversationNotes || '',
    transcript: data.callTranscript || data.transcript || '',
    sentiment: data.sentiment || '',
    urgency: data.urgency || '',
  };

  // AI categorization
  const ai = {
    aiCategory: data.aiCategory || '',
    aiConfidence: typeof data.aiConfidence === 'number' ? data.aiConfidence : Number(data.aiConfidence) || 0,
    aiNotes: data.aiNotes || '',
  };

  // Auto-response
  const autoResponse = {
    autoResponseSent: !!data.autoResponseSent,
    responseTime: data.responseTime || '',
    responseTemplate: data.responseTemplate || '',
  };

  // Lead scoring
  const leadScoring = {
    leadScore: typeof data.leadScore === 'number' ? data.leadScore : Number(data.leadScore) || 0,
    scoreFactors: data.scoreFactors || {},
  };

  // Timestamps
  const timestamps = {
    firstContactDate: data.firstContactDate || new Date().toISOString(),
    lastActivityDate: data.lastActivityDate || '',
  };

  // Main contact object
  return {
    ...data,
    platform,
    sourceDetails,
    conversation,
    ai,
    autoResponse,
    leadScoring,
    ...timestamps,
  };
}

// Create contact
export async function createContact(data) {
  const contact = normalizeContactData(data);
  // Basic validation
  if (!contact.firstName || !contact.lastName || !contact.email) {
    throw new Error('Missing required contact fields (name, email)');
  }
  // Platform-specific validation
  if (contact.platform === 'Yelp' && !contact.sourceDetails.messageUrl) {
    throw new Error('Yelp contact requires reviewUrl');
  }
  if (contact.platform === 'Google My Business' && !contact.sourceDetails.messageUrl) {
    throw new Error('Google My Business contact requires reviewUrl');
  }
  if (contact.platform === 'Facebook' && !contact.sourceDetails.pageUrl && !contact.sourceDetails.profileUrl) {
    throw new Error('Facebook contact requires pageUrl or profileUrl');
  }
  if (contact.platform === 'LinkedIn' && !contact.sourceDetails.profileUrl && !contact.sourceDetails.companyUrl) {
    throw new Error('LinkedIn contact requires profileUrl or companyUrl');
  }
  if (contact.platform === 'AI Receptionist' && !contact.conversation.callSummary) {
    throw new Error('AI Receptionist contact requires callSummary');
  }
  if (contact.platform === 'Affiliate' && !contact.sourceDetails.affiliateName) {
    throw new Error('Affiliate contact requires affiliateName');
  }
  // Save to Firestore
  try {
    const docRef = await addDoc(collection(db, 'contacts'), contact);
    return { id: docRef.id, ...contact };
  } catch (err) {
    throw new Error('Failed to save contact: ' + err.message);
  }
}

// Update contact
export async function updateContact(id, data) {
  const contact = normalizeContactData(data);
  if (!id) throw new Error('Missing contact ID');
  try {
    await updateDoc(doc(db, 'contacts', id), contact);
    return { id, ...contact };
  } catch (err) {
    throw new Error('Failed to update contact: ' + err.message);
  }
}

// Sample data for testing
export const sampleContacts = [
  {
    firstName: 'Jane', lastName: 'Smith', email: 'jane@demo.com', platform: 'Yelp', sourceDetails: { businessName: 'Jane Credit', reviewUrl: 'yelp.com/jane' }, conversation: { callSummary: 'Asked about services', sentiment: 'Excited', urgency: 'ASAP' }, ai: { aiCategory: 'Hot Lead', aiConfidence: 95, aiNotes: 'Ready to buy' }, autoResponse: { autoResponseSent: true, responseTime: '2m', responseTemplate: 'Thank you for contacting us' }, leadScoring: { leadScore: 90, scoreFactors: { platform: 20, engagement: 30, sentiment: 20, urgency: 20 } }, firstContactDate: '2025-08-10', lastActivityDate: '2025-08-18'
  },
  // ...more samples
];
