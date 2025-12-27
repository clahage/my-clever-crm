// src/utils/emailNotification.js
// ═══════════════════════════════════════════════════════════════
// EMAIL NOTIFICATION WRAPPER
// ═══════════════════════════════════════════════════════════════
// Routes all emails through the main emailService.js
// This maintains backward compatibility for any code using this file
// ═══════════════════════════════════════════════════════════════

import emailService from '../services/emailService';

export async function sendEmailNotification({ to, subject, message }) {
  console.log('📧 emailNotification: Routing through emailService.js');
  
  try {
    const result = await emailService.send({
      to,
      subject,
      html: message,
      text: message,
      type: 'notification'  // Uses notification alias
    });
    
    return result;
  } catch (error) {
    console.error('❌ emailNotification failed:', error);
    throw error;
  }
}

export default sendEmailNotification;