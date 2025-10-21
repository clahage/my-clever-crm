cat > index.js << 'EOF'
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();
const app = express();

// API Key for webhook authentication
const WEBHOOK_API_KEY = 'scr-webhook-2025-secure-key-abc123';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SpeedyCRM AI Receptionist Webhook',
    timestamp: new Date().toISOString()
  });
});

// Test webhook endpoint
app.get('/test', async (req, res) => {
  try {
    // Check API key
    const apiKey = req.query.apiKey || req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== WEBHOOK_API_KEY) {
      console.error('Unauthorized test attempt - invalid or missing API key');
      return res.status(403).json({
        success: false,
        error: 'Invalid or missing API key'
      });
    }

    console.log('Test webhook called with valid API key');

    // Create test call data
    const testCallData = {
      callId: `test-${Date.now()}`,
      customerPhone: '+1234567890',
      customerName: 'John Doe',
      callDuration: 120,
      callStatus: 'completed',
      transcript: 'This is a test call transcript. The customer inquired about credit repair services.',
      summary: 'Customer interested in credit repair services',
      intent: 'inquiry',
      sentiment: 'positive',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      source: 'test',
      processed: false
    };

    // Write to Firestore
    const docRef = await db.collection('aiReceptionistCalls').add(testCallData);

    console.log('Test call created successfully:', docRef.id);

    res.json({
      success: true,
      message: 'Test call created successfully! Check Firestore aiReceptionistCalls collection.',
      documentId: docRef.id,
      testData: {
        ...testCallData,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in test webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Production webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    // Check API key
    const apiKey = req.query.apiKey || req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== WEBHOOK_API_KEY) {
      console.error('Unauthorized webhook attempt - invalid or missing API key');
      return res.status(403).json({
        success: false,
        error: 'Invalid or missing API key'
      });
    }

    console.log('Webhook received with valid API key:', {
      headers: req.headers,
      body: req.body
    });

    // Extract call data from webhook payload
    const callData = {
      callId: req.body.call_id || req.body.callId || `call-${Date.now()}`,
      customerPhone: req.body.customer_phone || req.body.from || '',
      customerName: req.body.customer_name || req.body.caller_name || '',
      callDuration: req.body.duration || req.body.call_duration || 0,
      callStatus: req.body.status || req.body.call_status || 'completed',
      transcript: req.body.transcript || '',
      summary: req.body.summary || '',
      intent: req.body.intent || req.body.call_intent || '',
      sentiment: req.body.sentiment || '',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      source: 'myaifrontdesk',
      processed: false,
      rawPayload: req.body // Store original payload for debugging
    };

    // Validate required fields
    if (!callData.customerPhone && !callData.transcript) {
      console.warn('Webhook received with missing critical data:', callData);
    }

    // Write to Firestore (this triggers processAIReceptionistCall function)
    const docRef = await db.collection('aiReceptionistCalls').add(callData);

    console.log('Webhook call saved successfully:', docRef.id);

    // Return success response
    res.json({
      success: true,
      message: 'Call received and queued for processing',
      callId: docRef.id
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Webhook service listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
EOF