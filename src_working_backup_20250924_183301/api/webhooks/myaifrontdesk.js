// Updated webhook handler for MyAIFrontDesk with automated pipeline integration
import { db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { processAICallData } from '../../services/aiDataProcessor';

// Webhook handler for MyAIFrontDesk
export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Received MyAIFrontDesk webhook:', req.body);
    
    // Process the raw webhook data through AI analysis
    const enrichedData = processAICallData(req.body);
    
    // Add to aiReceptionistCalls collection
    // DO NOT set convertedToContact - let the pipeline handle it
    const callData = {
      ...enrichedData,
      // Original webhook data
      username: req.body.username || '',
      caller: req.body.caller || '',
      timestamp: req.body.timestamp || new Date().toISOString(),
      transcript: req.body.transcript || '',
      sentiment: req.body.sentiment || {},
      duration: req.body.duration || 0,
      satisfaction: req.body.satisfaction || null,
      summary: req.body.summary || '',
      texts_sent: req.body.texts_sent || [],
      
      // Enhanced data from AI processing
      callerName: enrichedData.callerName || '',
      painPoints: enrichedData.painPoints || [],
      urgencyLevel: enrichedData.urgencyLevel || 'medium',
      leadScore: enrichedData.leadScore || 0,
      conversionProbability: enrichedData.conversionProbability || 0,
      
      // Processing flags
      processed: true,
      processedAt: serverTimestamp(),
      
      // DO NOT SET convertedToContact - the pipeline will handle this automatically
      // convertedToContact: false, // REMOVED - pipeline handles this
      
      // Source tracking
      source: 'MyAIFrontDesk',
      webhookReceivedAt: serverTimestamp()
    };
    
    // Save to Firestore
    const docRef = await addDoc(collection(db, 'aiReceptionistCalls'), callData);
    
    console.log('Call saved with ID:', docRef.id);
    console.log('Lead Score:', callData.leadScore);
    console.log('Caller Name:', callData.callerName);
    console.log('Pain Points:', callData.painPoints);
    
    // The ContactPipelineService will automatically:
    // 1. Detect this new call via real-time listener
    // 2. Create/update contact in master contacts collection
    // 3. Categorize as lead/client/etc based on score and data
    // 4. No manual intervention required
    
    // Send success response
    res.status(200).json({ 
      success: true, 
      id: docRef.id,
      message: 'Call received and queued for automatic processing',
      leadScore: callData.leadScore,
      category: callData.leadScore >= 8 ? 'hot-lead' : callData.leadScore >= 5 ? 'warm-lead' : 'cold-lead'
    });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ 
      error: 'Failed to process webhook', 
      details: error.message 
    });
  }
}