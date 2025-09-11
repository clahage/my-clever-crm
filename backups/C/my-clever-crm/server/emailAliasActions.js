// Email alias to CRM action mapping
// This module maps incoming email aliases to CRM workflow functions

module.exports = {
  'urgent@speedycreditrepair.com': {
    description: 'Flags a contact as urgent',
    handler: async (mail, crm) => {
      // Example: Find contact by email or phone in mail, flag as urgent
      const contact = await crm.findContact(mail.from.value[0].address);
      if (contact) {
        await crm.updateContact(contact.id, { urgency: 'urgent' });
        await crm.logAction(contact.id, 'Flagged as urgent via email alias.');
      }
    }
  },
  'add@speedycreditrepair.com': {
    description: 'Adds a new lead/contact',
    handler: async (mail, crm) => {
      // Example: Parse name/email/phone from mail, add as new contact
      const { subject, text } = mail;
      // Simple parsing, can be replaced with AI/NLP
      const nameMatch = subject.match(/New Lead: (.+)/i);
      const name = nameMatch ? nameMatch[1] : 'Unknown';
      await crm.addContact({
        name,
        email: mail.from.value[0].address,
        notes: text
      });
    }
  },
  'review@speedycreditrepair.com': {
    description: 'Triggers a credit report review workflow',
    handler: async (mail, crm) => {
      // Example: Find contact, trigger review
      const contact = await crm.findContact(mail.from.value[0].address);
      if (contact) {
        await crm.triggerCreditReview(contact.id);
        await crm.logAction(contact.id, 'Credit report review triggered via email alias.');
      }
    }
  },
  'notify-chris@speedycreditrepair.com': {
    description: 'Notifies Chris',
    handler: async (mail, crm) => {
      // Example: Send notification to Chris
      await crm.sendNotification('chris@speedycreditrepair.com', {
        subject: 'Notification from Email Alias',
        body: `Message from ${mail.from.text}:\n${mail.subject}\n${mail.text}`
      });
    }
  },
  // --- Additional Email Alias Actions ---
  'support@speedycreditrepair.com': {
    description: 'Creates a support ticket',
    handler: async (mail, crm) => {
      await crm.createSupportTicket({
        from: mail.from.value[0].address,
        subject: mail.subject,
        body: mail.text
      });
    }
  },
  'docs@speedycreditrepair.com': {
    description: 'Files documents to client record',
    handler: async (mail, crm) => {
      const contact = await crm.findContact(mail.from.value[0].address);
      if (contact && mail.attachments && mail.attachments.length) {
        await crm.attachDocuments(contact.id, mail.attachments);
        await crm.logAction(contact.id, 'Documents received via email alias.');
      }
    }
  },
  'feedback@speedycreditrepair.com': {
    description: 'Collects client feedback',
    handler: async (mail, crm) => {
      await crm.logFeedback({
        from: mail.from.value[0].address,
        feedback: mail.text
      });
    }
  },
  'schedule@speedycreditrepair.com': {
    description: 'Triggers appointment scheduling',
    handler: async (mail, crm) => {
      await crm.scheduleAppointment({
        from: mail.from.value[0].address,
        details: mail.text
      });
    }
  },
  'cancel@speedycreditrepair.com': {
    description: 'Flags client for cancellation review',
    handler: async (mail, crm) => {
      const contact = await crm.findContact(mail.from.value[0].address);
      if (contact) {
        await crm.flagForCancellation(contact.id);
        await crm.logAction(contact.id, 'Cancellation requested via email alias.');
      }
    }
  },
  'escalate@speedycreditrepair.com': {
    description: 'Escalates a case to management',
    handler: async (mail, crm) => {
      await crm.escalateCase({
        from: mail.from.value[0].address,
        subject: mail.subject,
        body: mail.text
      });
    }
  },
  'billing@speedycreditrepair.com': {
    description: 'Routes billing questions',
    handler: async (mail, crm) => {
      await crm.routeBilling({
        from: mail.from.value[0].address,
        subject: mail.subject,
        body: mail.text
      });
    }
  },
  'verify@speedycreditrepair.com': {
    description: 'Triggers identity/document verification',
    handler: async (mail, crm) => {
      await crm.triggerVerification({
        from: mail.from.value[0].address,
        details: mail.text
      });
    }
  },
  'welcome@speedycreditrepair.com': {
    description: 'Sends onboarding sequence',
    handler: async (mail, crm) => {
      await crm.sendWelcomeSequence({
        to: mail.from.value[0].address
      });
    }
  },
  'unsubscribe@speedycreditrepair.com': {
    description: 'Processes opt-out/unsubscribe requests',
    handler: async (mail, crm) => {
      await crm.unsubscribeContact(mail.from.value[0].address);
    }
  },
  'legal@speedycreditrepair.com': {
    description: 'Forwards legal inquiries',
    handler: async (mail, crm) => {
      await crm.forwardToLegal({
        from: mail.from.value[0].address,
        subject: mail.subject,
        body: mail.text
      });
    }
  },
  'ai@speedycreditrepair.com': {
    description: 'Custom/experimental automations for Taylor',
    handler: async (mail, crm) => {
      await crm.handleAICustomAction(mail);
    }
  }
};
