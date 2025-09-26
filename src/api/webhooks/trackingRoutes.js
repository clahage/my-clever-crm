// src/api/trackingRoutes.js
import { db } from '../config/firebase';
import emailTrackingService from '../services/emailTrackingService';

// Handle email open tracking
export async function handleEmailOpen(req, res) {
  const { trackingId } = req.params;
  
  // Track the open
  await emailTrackingService.trackEmailOpen(trackingId);
  
  // Return 1x1 transparent pixel
  const pixel = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );
  
  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': pixel.length,
    'Cache-Control': 'no-store, no-cache, must-revalidate, private'
  });
  
  res.end(pixel);
}

// Handle website visitor tracking
export async function handleVisitorTracking(req, res) {
  const { type, data } = req.body;
  
  // Store in Firestore
  await db.collection('websiteTracking').add({
    type,
    data,
    timestamp: new Date(),
    processed: false
  });
  
  res.json({ success: true });
}