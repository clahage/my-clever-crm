// src/api/sendEmail.js
// API route to send email via Firebase callable function



import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { contactId, templateId, customData } = req.body;
    if (!contactId || !templateId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Call the Firebase callable function 'manualSendEmail'
    const manualSendEmail = httpsCallable(functions, 'manualSendEmail');
    const result = await manualSendEmail({ contactId, templateId, customData });
    res.status(200).json(result.data);
  } catch (error) {
    console.error('API sendEmail error:', error);
    res.status(500).json({ error: error.message });
  }
}
