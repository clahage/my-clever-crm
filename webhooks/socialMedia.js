const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Initialize Firestore
const db = admin.firestore();
const OpenAIService = require('../src/services/openAIService.js');

// Facebook webhook verification
router.get('/facebook', (req, res) => {
  const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN || 'speedy-crm-verify-2025';
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode && token === VERIFY_TOKEN) {
    console.log('Facebook webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Facebook webhook handler
router.post('/facebook', async (req, res) => {
  try {
    const { entry } = req.body;
    
    for (const pageEntry of entry) {
      if (pageEntry.messaging) {
        for (const event of pageEntry.messaging) {
          await processFacebookMessage(event);
        }
      }
      if (pageEntry.changes) {
        for (const change of pageEntry.changes) {
          if (change.field === 'ratings') {
            await processFacebookReview(change.value);
          }
        }
      }
    }
    
    res.sendStatus(200);
  } catch (error) {
    console.error('Facebook webhook error:', error);
    res.sendStatus(500);
  }
});

async function processFacebookMessage(event) {
  const messageData = {
    platform: 'Facebook',
    senderId: event.sender.id,
    message: event.message.text,
    timestamp: new Date(),
    type: 'message',
    status: 'processing'
  };
  
  // Save to Firestore
  const docRef = await db.collection('social_requests').add(messageData);
  
  // Generate AI response
  try {
    const aiResponse = await OpenAIService.generateResponse(
      event.message.text,
      'Facebook',
      { senderId: event.sender.id }
    );
    
    // Update request with AI response
    await db.collection('social_requests').doc(docRef.id).update({
      aiResponse: aiResponse.response,
      status: aiResponse.success ? 'responded' : 'pending',
      respondedAt: new Date()
    });
    
    // Save response for approval
    await db.collection('social_responses').add({
      requestId: docRef.id,
      response: aiResponse.response,
      platform: 'Facebook',
      status: 'pending_approval',
      generatedBy: aiResponse.model,
      timestamp: new Date()
    });
    
    console.log('AI response generated:', aiResponse.response);
  } catch (error) {
    console.error('Failed to generate AI response:', error);
    await db.collection('social_requests').doc(docRef.id).update({
      status: 'failed',
      error: error.message
    });
  }
}

async function processFacebookReview(review) {
  const reviewData = {
    platform: 'Facebook',
    rating: review.rating,
    reviewText: review.review_text,
    reviewerId: review.reviewer.id,
    reviewerName: review.reviewer.name,
    timestamp: new Date(),
    type: 'review',
    status: review.rating < 4 ? 'urgent' : 'pending'
  };
  
  await db.collection('social_requests').add(reviewData);
  
  if (review.rating < 4) {
    await db.collection('social_alerts').add({
      type: 'urgent_review',
      platform: 'Facebook',
      rating: review.rating,
      timestamp: new Date(),
      status: 'unread'
    });
  }
  
  console.log('Facebook review processed:', reviewData);
}

// Instagram webhook (similar structure)
router.post('/instagram', async (req, res) => {
  // Similar to Facebook
  res.sendStatus(200);
});

// Google Reviews webhook
router.post('/google', async (req, res) => {
  // Process Google review notifications
  res.sendStatus(200);
});

module.exports = router;
