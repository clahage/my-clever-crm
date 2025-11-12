import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const testMessages = [
  {
    platform: 'facebook',
    type: 'message',
    customer: { name: 'John Smith', id: 'fb_123' },
    content: 'Hi, I need help with my credit report. There are some errors I need to dispute.',
    timestamp: new Date()
  },
  {
    platform: 'instagram',
    type: 'comment',
    customer: { name: 'Sarah Johnson', id: 'ig_456' },
    content: 'How long does the credit repair process usually take?',
    timestamp: new Date()
  },
  {
    platform: 'google',
    type: 'review',
    customer: { name: 'Mike Williams', id: 'goog_789' },
    content: 'Great service! They helped me improve my score by 120 points.',
    rating: 5,
    timestamp: new Date()
  },
  {
    platform: 'facebook',
    type: 'review',
    customer: { name: 'Lisa Brown', id: 'fb_234' },
    content: 'The team was very professional but the process took longer than expected.',
    rating: 3,
    timestamp: new Date()
  },
  {
    platform: 'instagram',
    type: 'dm',
    customer: { name: 'David Lee', id: 'ig_567' },
    content: 'What documents do I need to start the credit repair process?',
    timestamp: new Date()
  }
];

export async function generateTestSocialData() {
  const results = { requests: [], responses: [], errors: [] };
  console.log('🚀 Starting test data generation...');

  try {
    for (const message of testMessages) {
      try {
        const requestDoc = await addDoc(collection(db, 'social_requests'), {
          ...message,
          status: 'pending',
          createdAt: serverTimestamp(),
          metadata: { test: true, generatedAt: new Date().toISOString() }
        });

        results.requests.push({ id: requestDoc.id, ...message });
        console.log(`✅ Created ${message.platform} ${message.type} from ${message.customer.name}`);

        // Create AI responses for some requests
        if (Math.random() > 0.5) {
          const responseDoc = await addDoc(collection(db, 'social_responses'), {
            requestId: requestDoc.id,
            platform: message.platform,
            customerId: message.customer.id,
            customerName: message.customer.name,
            originalMessage: message.content,
            suggestedResponse: generateAutoResponse(message),
            status: 'pending_approval',
            confidence: Math.random() * 0.3 + 0.7,
            createdAt: serverTimestamp(),
            metadata: { test: true, aiModel: 'gpt-4' }
          });
          results.responses.push({ id: responseDoc.id, requestId: requestDoc.id });
          console.log(`  📝 Generated AI response for approval`);
        }
      } catch (error) {
        console.error(`❌ Error:`, error);
        results.errors.push({ message: message.customer.name, error: error.message });
      }
    }

    console.log('\n📊 Test Data Generation Complete:');
    console.log(`  ✅ Requests: ${results.requests.length}`);
    console.log(`  📝 AI Responses: ${results.responses.length}`);
    console.log(`  ❌ Errors: ${results.errors.length}`);
    return results;
  } catch (error) {
    console.error('Fatal error:', error);
    throw error;
  }
}

function generateAutoResponse(message) {
  const responses = {
    'credit report': 'Thank you for reaching out! I can help you review and dispute errors on your credit report. To get started, please provide your full name and the specific errors you\'ve identified.',
    'how long': 'Great question! The credit repair process typically takes 3-6 months, depending on the complexity of your case. Most clients see initial improvements within 30-45 days.',
    'documents': 'To start the credit repair process, you\'ll need: 1) Credit reports from all three bureaus, 2) Valid ID, 3) Proof of address, and 4) Any supporting documents for disputes.',
    'improve': 'Thank you so much for your wonderful review! We\'re thrilled to hear about your 120-point improvement.',
    'professional': 'Thank you for your feedback! We appreciate your honesty about the timeline.'
  };

  const content = message.content.toLowerCase();
  for (const [keyword, response] of Object.entries(responses)) {
    if (content.includes(keyword)) return response;
  }
  return 'Thank you for contacting Speedy Credit Repair! A specialist will respond within 24 hours.';
}

export default { generateTestSocialData };
